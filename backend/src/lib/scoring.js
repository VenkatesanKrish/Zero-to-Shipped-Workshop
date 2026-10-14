/* The keyword matcher — shared by analyze.js.
 *
 *  Only the matching lives here now. The score/verdict presentation helpers
 *  moved to frontend/src/lib/scoring.js, because the server does not care
 *  what colour the ring is. */

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
