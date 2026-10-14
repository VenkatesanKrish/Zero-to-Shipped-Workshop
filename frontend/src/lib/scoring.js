/* Presentation helpers for the results view.
 *
 *  These used to live beside the matcher, back when the browser did the
 *  scoring. Now the server returns a score and the frontend decides how to
 *  show it, so the colour and the verdict belong here. */

/** Ring colour for a score: green / amber / red. */
export function ringColour(score) {
  if (score >= 70) return "#34d399"; // --ok
  if (score >= 40) return "#fbbf24"; // amber
  return "#fb7185"; // --miss
}

/** One-line verdict for the score. `missing` is an array of skill names. */
export function verdictFor(score, missing = []) {
  const gaps = missing.slice(0, 3);

  if (score >= 70) {
    return "Strong match — this resume already covers most of what the job asks for.";
  }
  if (score >= 40) {
    const list = gaps.length ? ` Start with ${gaps.join(", ")}.` : "";
    return `Solid base with clear gaps.${list}`;
  }
  const list = gaps.length ? ` The biggest gaps: ${gaps.join(", ")}.` : "";
  return `Early days — most of what this job asks for is missing.${list}`;
}
