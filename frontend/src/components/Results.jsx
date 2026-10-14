import ScoreRing from "./ScoreRing.jsx";
import SkillList from "./SkillList.jsx";
import { verdictFor } from "../lib/scoring.js";

export default function Results({ result, onScanAgain, innerRef }) {
  // The server sends arrays of names; SkillList expects { name, weight }.
  // Normalising here keeps the component dumb and reusable.
  const asSkills = (names) => names.map((name) => ({ name, weight: "" }));

  return (
    <section className="results" id="results" ref={innerRef}>
      <div className="results-grid">
        <div className="card score-card">
          <h2 className="card-title">Match score</h2>

          <ScoreRing score={result.score} />

          <p className="verdict">{verdictFor(result.score, result.missingSkills)}</p>

          <dl className="score-stats">
            <div>
              <dt>Matched</dt>
              <dd>{result.matchedSkills.length}</dd>
            </div>
            <div>
              <dt>Missing</dt>
              <dd>{result.missingSkills.length}</dd>
            </div>
            <div>
              <dt>Required</dt>
              <dd>{result.requiredCount}</dd>
            </div>
          </dl>
        </div>

        <div className="card skills-card" id="skills">
          <h2 className="card-title">Skill breakdown</h2>

          <SkillList
            title="You have (asked for)"
            variant="ok"
            skills={asSkills(result.matchedSkills)}
          />
          <SkillList
            title="Missing (asked for)"
            variant="miss"
            skills={asSkills(result.missingSkills)}
          />
          <SkillList
            title="Bonus (not asked for)"
            variant="bonus"
            skills={asSkills(result.bonusSkills)}
          />

          <button className="link-btn scan-again" type="button" onClick={onScanAgain}>
            Analyse another
          </button>
        </div>
      </div>
    </section>
  );
}
