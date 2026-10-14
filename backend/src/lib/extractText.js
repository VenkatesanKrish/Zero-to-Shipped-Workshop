/* Text extraction for the backend.
 *
 *  This is the Node version of the file the browser used to run. Two things
 *  had to change for the server:
 *
 *  1. No `?url` worker import — that is a Vite feature and means nothing in
 *     Node. We use pdfjs-dist's legacy build, which is the one that runs on
 *     a plain Node runtime.
 *  2. The worker is disabled outright. Running pdf.js off the main thread is
 *     a browser concern (it keeps the UI responsive); on a server the
 *     request is already asynchronous, so a worker would only add moving
 *     parts. `disableFontFace` and `isEvalSupported` cut the browser-only
 *     code paths that would otherwise warn.
 */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/** Read a PDF Buffer and return its text. */
export async function extractText(buffer) {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }

  await pdf.destroy(); // free the worker/memory for the next request
  return pages.join("\n");
}
