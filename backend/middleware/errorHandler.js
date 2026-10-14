/** Central error handler.
 *
 *  Every layer below throws; this is the single place that turns a thrown
 *  error into an HTTP response. Services throw `HttpError` with a status,
 *  multer throws its own codes, and anything else becomes a 500.
 *
 *  Express identifies this as an error handler by its four arguments, so
 *  the unused `next` is required — removing it silently turns this into
 *  ordinary middleware that never runs. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Multer reports its own failures with a `code`.
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "That file is over 5 MB — try a smaller export." });
  }

  const status = err.status || 400;

  // Log server-side faults loudly; expected 4xx noise is not a bug.
  if (status >= 500) {
    console.error("[error]", err);
  } else {
    console.warn("[error]", err.message);
  }

  res.status(status).json({ error: err.message || "Something went wrong." });
}

/** Any request that matched no route. */
export function notFound(_req, res) {
  res.status(404).json({ error: "Not found." });
}
