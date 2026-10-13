import { useCallback, useRef, useState } from "react";
import { extractText } from "../lib/extractText.js";
import { scoreResume } from "../lib/scoring.js";

const MAX_BYTES = 5 * 1024 * 1024;

/** All the upload/scan state for the page, in one place.
 *
 *  Keeping this in a hook rather than in App means the components below
 *  stay presentational: they receive a result and render it, and none of
 *  them has to know how a File becomes a score. */
export function useResumeScanner() {
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState(""); // "" | "is-error" | "is-ok"
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  // The results section scrolls into view after a scan. A ref to the DOM node
  // is the React way to reach an element — no getElementById.
  const resultsRef = useRef(null);

  const say = useCallback((message, kind = "") => {
    setStatus(message);
    setStatusKind(kind);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setBusy(false);
    say("");
  }, [say]);

  const scan = useCallback(
    async (picked) => {
      if (!picked) return;

      const name = picked.name.toLowerCase();
      const isPdf = picked.type === "application/pdf" || name.endsWith(".pdf");
      const isTxt = picked.type === "text/plain" || name.endsWith(".txt");

      if (!isPdf && !isTxt) {
        say("That is not a PDF. Export your resume as PDF and try again.", "is-error");
        return;
      }
      if (picked.size > MAX_BYTES) {
        say("That file is over 5 MB — try a smaller export.", "is-error");
        return;
      }

      setFile(picked);
      setBusy(true);
      say("Reading your resume…");

      try {
        const text = await extractText(picked);

        if (text.replace(/\s/g, "").length < 50) {
          say(
            "Almost no text came out. If your resume is a scan or an image, it needs a text layer (export from Word/Docs rather than photographing it).",
            "is-error"
          );
          return;
        }

        const scored = scoreResume(text);
        setResult(scored);
        say(`Scored ${scored.present.length} tracked skills in this resume.`, "is-ok");

        // Wait a frame so the results section exists before scrolling to it.
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch (error) {
        console.error(error);
        say(
          "Could not read that PDF. It may be encrypted or damaged — try re-exporting it.",
          "is-error"
        );
      } finally {
        setBusy(false);
      }
    },
    [say]
  );

  return { status, statusKind, file, result, busy, resultsRef, scan, reset };
}
