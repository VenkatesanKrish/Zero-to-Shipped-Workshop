import Nav from "./components/Nav.jsx";
import Uploader from "./components/Uploader.jsx";
import Results from "./components/Results.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import { useResumeScanner } from "./hooks/useResumeScanner.js";

/* v0.2 — the flow is now: pick a resume, paste a job description, analyse.
   The scoring happens on the server (see backend/src/lib/analyze.js). */

/** The page. State lives in the hook; the components below are presentational.
 *
 *  Two patterns worth noticing as you read:
 *   - `result && <Results .../>` — in React, false renders nothing. That is
 *     the idiomatic replacement for toggling the `hidden` attribute.
 *   - the scanner is created once and its callbacks are stable, so children
 *     do not re-render just because the parent did. */
export default function App() {
  const {
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
  } = useResumeScanner();

  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Nav />

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Resume parser · v0.2</p>
            <h1>
              Know your match score <span className="grad">before a recruiter does.</span>
            </h1>
            <p className="lede">
              Upload your resume, paste the job description, and see how well they line up —
              the score, the skills the job asks for that you already have, and the ones you
              are missing.
            </p>
            <ul className="hero-points">
              <li>Compares your resume against the specific job you are targeting</li>
              <li>Match score with the exact skills you are missing</li>
              <li>Bonus skills you have that the posting never asked for</li>
            </ul>
          </div>

          <Uploader
            onSelectFile={selectFile}
            onAnalyze={analyze}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            status={status}
            statusKind={statusKind}
            file={file}
            busy={busy}
            onReset={reset}
          />
        </section>

        {result && (
          <Results
            result={result}
            innerRef={resultsRef}
            onScanAgain={() => {
              reset();
              document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}

        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}
