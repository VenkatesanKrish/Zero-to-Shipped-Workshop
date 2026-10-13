import Nav from "./components/Nav.jsx";
import Uploader from "./components/Uploader.jsx";
import Results from "./components/Results.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import { useResumeScanner } from "./hooks/useResumeScanner.js";

/** The page. State lives in the hook; the components below are presentational.
 *
 *  Two patterns worth noticing as you read:
 *   - `result && <Results .../>` — in React, false renders nothing. That is
 *     the idiomatic replacement for toggling the `hidden` attribute.
 *   - the scanner is created once and its callbacks are stable, so children
 *     do not re-render just because the parent did. */
export default function App() {
  const { status, statusKind, file, result, busy, resultsRef, scan, reset } =
    useResumeScanner();

  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Nav />

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Resume parser · v0.1</p>
            <h1>
              Know your resume's score <span className="grad">before a recruiter does.</span>
            </h1>
            <p className="lede">
              Drop in a PDF. We pull the text out, match it against the skills your target
              roles actually ask for, and show you the score, what you have, and what is missing.
            </p>
            <ul className="hero-points">
              <li>Runs entirely in your browser — nothing is uploaded to a server</li>
              <li>Instant skill-match score with a per-category breakdown</li>
              <li>Concrete missing skills, so you know exactly what to learn next</li>
            </ul>
          </div>

          <Uploader
            onFile={scan}
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
