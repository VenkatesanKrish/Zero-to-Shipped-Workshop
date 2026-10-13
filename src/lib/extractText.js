/* Text extraction. In the vanilla version this loaded pdf.js from a CDN with a
   dynamic import; now pdfjs-dist is a real dependency, so it works offline.

   `?url` is a Vite feature: it hands back the built URL of the worker file
   rather than importing it as a module. pdf.js parses off the main thread in
   that worker, which is why a big PDF does not freeze the page. */

import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/** Read a PDF (or plain .txt) File and return its text. */
export async function extractText(file) {
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return file.text();
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  return pages.join("\n");
}
