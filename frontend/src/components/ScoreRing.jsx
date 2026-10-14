import { useEffect, useState } from "react";
import { ringColour } from "../lib/scoring.js";

const RING = 339.292; // matches --ring in index.css

/** The animated score ring.
 *
 *  A CSS transition needs a start value and an end value in separate frames,
 *  so we render at dashoffset = full, then flip to the real value on the next
 *  frame. That two-step is what makes it sweep instead of jumping. */
export default function ScoreRing({ score }) {
  const [offset, setOffset] = useState(RING);

  useEffect(() => {
    setOffset(RING); // reset to empty...
    const frame = requestAnimationFrame(() => {
      setOffset(RING * (1 - score / 100)); // ...then animate to the score
    });
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="ring-wrap">
      <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r="54" />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r="54"
          style={{ stroke: ringColour(score), strokeDashoffset: offset }}
        />
      </svg>
      <div className="ring-label">
        <span className="score-value">{score}</span>
        <span className="score-unit">/ 100</span>
      </div>
    </div>
  );
}
