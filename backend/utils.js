/* Small, dependency-free helpers shared across layers.
 *
 *  Anything in here is a pure function or a tiny class with no knowledge of
 *  Express, Mongoose or the database. That is what makes this the one file
 *  you can unit test without any setup. */

/** An error carrying an HTTP status.
 *
 *  Services throw these; the error handler in middleware/ reads `.status`
 *  and turns it into a response. Without it a service would have to know
 *  about status codes, which is the controller's job. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

/** Is this alias present in the text as a whole word?
 *  Plain \b cuts tech names in the wrong place: it treats "." as a boundary,
 *  so "node" matches inside "node.js" and "js" matches there too.
 *  A word char on either side blocks a match; a dot isolates it only when a
 *  word char follows, so "react" still matches at the end of a sentence. */
export function containsAlias(text, alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = /^[a-z0-9]/.test(alias) ? "(?<![a-z0-9+#]|[a-z0-9]\\.)" : "";
  const end = /[a-z0-9]$/.test(alias) ? "(?![a-z0-9+#]|\\.[a-z0-9])" : "";
  return new RegExp(start + escaped + end).test(text);
}

/** Lowercase, unify quotes/dashes/spaces, collapse whitespace.
 *  Both texts go through this before matching, so they are compared on the
 *  same footing — a curly apostrophe in a PDF must not break a match that a
 *  straight one would have made. */
export function normalise(rawText) {
  return rawText
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
}
