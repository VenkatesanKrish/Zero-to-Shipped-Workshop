/* The transport layer for the labd API: one function, one HTTP call.
 *
 *  Kept separate from aiAnalyzeService so the prompt and the JSON-parsing can
 *  change without touching how the request is made, and so every failure mode
 *  (401, 402, 403, 429) is translated into an `HttpError` in exactly one place.
 *
 *  There is no SDK to install: labd is called with plain `fetch`, which Node 22
 *  provides globally, and `AbortSignal.timeout` for the deadline. That is why
 *  this integration adds nothing to package.json. */

import { LABD } from "../config/labd.js";
import { HttpError } from "../utils.js";

/* What each upstream status means *here*, and what to tell the caller.
 *
 *  Not every failure is the same kind of problem: a rejected key is a
 *  configuration fault on this server, a used-up allowance is the learner's to
 *  resolve, and their remedies are different. Mapping them explicitly beats
 *  passing "labd said 402" up to the browser. */
function upstreamFailure(status) {
  switch (status) {
    case 401:
      // Server-side config: the client can do nothing about it. Should never
      // happen in production, so it is worth a 5xx and a loud log.
      return new HttpError(503, "The labd key was rejected. Check LABD_API_KEY.");
    case 402:
      // A quota, so 429 rather than 500: "you have used it up", not "we broke".
      return new HttpError(
        429,
        "The labd allowance is used up. Top it up, or score with the keyword analyser instead."
      );
    case 403:
      return new HttpError(503, "The labd API is switched off for this account.");
    case 429:
      return new HttpError(429, "labd is limiting requests this minute — try again shortly.");
    default:
      return new HttpError(502, `labd answered ${status}.`);
  }
}

/**
 * Send one conversation to labd and return its reply.
 *
 * `messages` is an array of `{ role: "user" | "assistant", content }`, ending
 * on the user's turn — the documented shape. Nothing is remembered between
 * requests, so a caller wanting a conversation must resend the earlier turns;
 * this single-shot analyser has no earlier turns to send.
 *
 * Returns `{ content, percentLeft }`: the answer, and what is left of the
 * monthly allowance. The caller decides what to do with the second one.
 */
export async function askLabd({ messages }) {
  const key = process.env.LABD_API_KEY;

  // A missing key is this server's problem, not the caller's, so it is a 503
  // and not a 400 — and it is checked before the fetch so the failure is a
  // clear message rather than a 401 from upstream.
  if (!key) {
    throw new HttpError(503, "No labd key is configured (LABD_API_KEY).");
  }

  let response;
  try {
    response = await fetch(LABD.apiUrl, {
      method: "POST",
      headers: {
        // The key travels in a header: never in the body, never in the query
        // string, where it would end up in logs and in any link someone pasted.
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(LABD.timeoutMs),
    });
  } catch (error) {
    // fetch only rejects on a network failure or the abort — a 4xx/5xx comes
    // back as a normal response and is handled below.
    if (error.name === "TimeoutError") {
      throw new HttpError(504, `labd did not answer within ${LABD.timeoutMs / 1000}s.`);
    }
    throw new HttpError(502, `Could not reach labd (${error.message}).`);
  }

  if (!response.ok) {
    // Deliberately not forwarding the upstream body: it is not ours, it may
    // quote the request back, and the status is the part that is actionable.
    throw upstreamFailure(response.status);
  }

  const data = await response.json().catch(() => {
    throw new HttpError(502, "labd sent a response that was not JSON.");
  });

  return {
    content: data?.message?.content,
    percentLeft: data?.credits?.percentLeft,
  };
}
