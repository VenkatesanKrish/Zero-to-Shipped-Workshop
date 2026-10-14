import { useCallback, useRef, useState } from "react";
import { scanResume } from "../lib/api.js";

const MAX_BYTES = 5 * 1024 * 1024;

/** All the upload/scan state for the page, in one place.
 *
 *  The shape is the same as before, but `analyze` now posts to the API
 *  instead of extracting and scoring in the browser. Everything below stays
 *  presentational — none of the components knows a network call happened. */
export function useResumeScanner() {
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState(""); // "" | "is-error" | "is-ok"
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

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

  /** The file picker only selects; it does not submit. The user still has a
   *  job description to paste, so scanning on drop would be premature. */
  const selectFile = useCallback(
    (picked) => {
      if (!picked) return;

      const name = picked.name.toLowerCase();
      const isPdf = picked.type === "application/pdf" || name.endsWith(".pdf");

      if (!isPdf) {
        say("That is not a PDF. Export your resume as PDF and try again.", "is-error");
        return;
      }
      if (picked.size > MAX_BYTES) {
        say("That file is over 5 MB — try a smaller export.", "is-error");
        return;
      }

      setFile(picked);
      say("Resume ready. Paste the job description, then analyse.");
    },
    [say]
  );

  const analyze = useCallback(async () => {
    if (!file) {
      say("Choose a PDF resume first.", "is-error");
      return;
    }
    if (jobDescription.trim().length < 30) {
      say("Paste the job description — at least a few lines.", "is-error");
      return;
    }

    setBusy(true);
    say("Comparing your resume against the job description…");

    try {
      const data = await scanResume({ resumeFile: file, jobDescription });
      setResult(data);
      say(
        `Matched ${data.matchedSkills.length} of ${data.requiredCount} required skills.`,
        "is-ok"
      );

      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      console.error(error);
      say(error.message, "is-error");
    } finally {
      setBusy(false);
    }
  }, [file, jobDescription, say]);

  return {
    status,
    statusKind,
    file,
    jobDescription,
    setJobDescription,
    result,
    busy,
    resultsRef,
    selectFile,
    analyze,
    reset,
  };
}
