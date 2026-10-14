/* Settings for the labd AI integration.
 *
 *  These live in config/ for the same reason the skills dictionary does: they
 *  are values that shape what the analyser does, not logic. Nothing here reads
 *  process.env — the key is read at the point of use in service/labdService.js,
 *  so this file stays importable in a test with no environment set up. */

export const LABD = {
  /* The documented endpoint. Hard-coded rather than configurable: the key is
   *  issued for this host, so an env var here would only be a way to get it
   *  wrong. */
  apiUrl: "https://agent.thedevlabs.io/v1/api/chat",

  /* An answer that has not arrived in this long is not going to be useful to
   *  someone watching a spinner, and it holds a serverless function open.
   *  Without a timeout a stalled upstream keeps the request alive until the
   *  client gives up, which is the worst of both. */
  timeoutMs: 45_000,

  /* Prompt size caps. A resume and a JD are a couple of pages; these are not
   *  limits on what can be parsed, they are what stops one unusually long
   *  paste from spending a large slice of the monthly allowance on a single
   *  scan. Roughly, 4 characters ≈ 1 token. */
  maxResumeChars: 12_000,
  maxJdChars: 8_000,
};
