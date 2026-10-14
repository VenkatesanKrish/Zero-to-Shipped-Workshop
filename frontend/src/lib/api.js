/* The one place the frontend talks to the API.
 *
 *  Every request goes through here so there is a single spot to change the
 *  base URL, add an auth header, or handle a 401 — rather than a fetch()
 *  scattered through components. */

// Vite replaces import.meta.env.VITE_API_* at build time. Empty means "same
// origin", which Vite proxies to the API in dev (see vite.config.js). Set
// VITE_API_URL to the deployed API origin when you build for production.
const BASE_URL = import.meta.env.VITE_API_URL || "";

/** Upload a resume PDF plus a job description and get the analysis back.
 *
 *  FormData is what lets one request carry a file and text together. Note we
 *  never set Content-Type by hand: the browser has to add the multipart
 *  boundary itself, and setting it manually breaks the parse. */
export async function scanResume({ resumeFile, jobDescription }) {
  const body = new FormData();
  body.append("resume", resumeFile);
  body.append("jobDescription", jobDescription);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/scan`, { method: "POST", body });
  } catch {
    // fetch only rejects on a network failure, not on a 4xx/5xx.
    throw new Error("Could not reach the API. Is the backend running on port 5000?");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}
