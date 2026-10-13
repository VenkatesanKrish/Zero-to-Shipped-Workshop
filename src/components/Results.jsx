import ScoreRing from "./ScoreRing.jsx";
import SkillList from "./SkillList.jsx";
import { verdictFor } from "../lib/scoring.js";

export default function Results({ result, onScanAgain, innerRef }) {
  return (
    <section className="results" id="results" ref={innerRef}>
      <div className="results-grid">
        <div className="card score-card">
          <h2 className="card-title">Skill match score</h2>

          <ScoreRing score={result.score} />

          <p className="verdict">{verdictFor(result.score, result.missing)}</p>

          <dl className="score-stats">
            <div>
              <dt>Skills found</dt>
              <dd>{result.present.length}</dd>
            </div>
            <div>
              <dt>Skills missing</dt>
              <dd>{result.missing.length}</dd>
            </div>
            <div>
              <dt>Words read</dt>
              <dd>{result.words.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="card skills-card" id="skills">
          <h2 className="card-title">Skill breakdown</h2>

          <SkillList title="Skills present" variant="ok" skills={result.present} />
          <SkillList title="Skills missing" variant="miss" skills={result.missing} />

          <button className="link-btn scan-again" type="button" onClick={onScanAgain}>
            Scan another resume
          </button>
        </div>
      </div>
    </section>
  );
}
