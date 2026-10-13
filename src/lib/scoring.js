/* Scoring. Pure functions only — no DOM, no React. That is deliberate:
   this file is the easiest thing in the project to unit test. */

import { SKILLS, WEIGHT } from "../data/skills.js";

/** Is this alias present in the text as a whole word?
 *  Plain \b cuts tech names in the wrong place: it treats "." as a boundary,
 *  so "node" matches inside "node.js" and "js" matches there too.
 *  A word char on either side blocks a match; a dot isolates it only when a
 *  word char follows, so "react" still matches at the end of a sentence. */
export function containsAlias(text, alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = /^[a-z0-9]/.test(alias) ? "(?<![a-z0-9+#]|[a-z0-9]\\.)" : "";
  const end = /[a-z0-9]$/.test(alias) ? "(?![a-z0-9+#]|\\.[a-z0-9])" : "";
  return new RegExp(start + escaped + end).test(text);
}

/** Compare raw resume text against the dictionary.
 *  `skills` defaults to the one shipped dictionary, but taking it as an
 *  argument is what lets you score against a different role later. */
export function scoreResume(rawText, skills = SKILLS) {
  // Normalise: lowercase, unify dashes/quotes/spaces, collapse whitespace.
  const text = rawText
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");

  const present = [];
  const missing = [];
  let covered = 0;
  let total = 0;

  for (const skill of skills) {
    const points = WEIGHT[skill.weight];
    total += points;
    if (skill.aliases.some((alias) => containsAlias(text, alias))) {
      present.push(skill);
      covered += points;
    } else {
      missing.push(skill);
    }
  }

  return {
    score: Math.round((covered / total) * 100),
    present,
    missing,
    words: text.split(" ").filter(Boolean).length,
  };
}

/** Ring colour for a score: green / amber / red. */
export function ringColour(score) {
  if (score >= 70) return "#34d399"; // --ok
  if (score >= 40) return "#fbbf24"; // amber
  return "#fb7185"; // --miss
}

/** One-line verdict, naming the most important gaps. */
export function verdictFor(score, missing) {
  const topGaps = missing
    .filter((s) => s.weight === "core")
    .slice(0, 3)
    .map((s) => s.name);

  if (score >= 70) {
    return "Strong match — this resume already covers most of what the target role asks for.";
  }
  if (score >= 40) {
    const gaps = topGaps.length ? ` Start with ${topGaps.join(", ")}.` : "";
    return `Solid base with clear gaps.${gaps}`;
  }
  const gaps = topGaps.length ? ` The biggest gaps: ${topGaps.join(", ")}.` : "";
  return `Early days — the core skills are mostly missing.${gaps}`;
}
