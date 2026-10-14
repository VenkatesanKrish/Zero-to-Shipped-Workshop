/* The analysis engine: resume text + job description -> score.
 *
 *  THIS IS THE SEAM FOR THE AI. `analyze()` is the only function the route
 *  calls, and it returns a plain object. When you add the AI analyser, write
 *  a second function with the same signature and pick between them by an
 *  `analyzer` option — the route, the model and the frontend all stay put.
 *
 *  Today it is keyword matching, which is honest about its limits: it cannot
 *  tell "led a team of 5" from "wants to lead a team", and it does not
 *  understand synonyms it has not been told about. */

import { SKILLS, WEIGHT } from "../data/skills.js";
import { containsAlias } from "./scoring.js";

/** Which dictionary skills does this text mention? */
function skillsIn(text) {
  return SKILLS.filter((skill) =>
    skill.aliases.some((alias) => containsAlias(text, alias))
  );
}

/** Normalise text the same way scoring.js does, so the two agree. */
export function normalise(rawText) {
  return rawText
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Compare a resume against a job description.
 *
 * The JD defines what is *required*; the resume defines what the candidate
 * *has*. So:
 *   matched = required by the JD and present in the resume
 *   missing = required by the JD and absent from the resume
 *   bonus   = in the resume but not asked for (nice for the user to see)
 *
 * The score is the weight of the matched requirements over the weight of all
 * requirements — not over the whole dictionary. Scoring against the whole
 * dictionary would punish a candidate for skills the JD never wanted.
 */
export function analyze(resumeRaw, jdRaw) {
  const resumeText = normalise(resumeRaw);
  const jdText = normalise(jdRaw);

  const inResume = new Set(skillsIn(resumeText).map((s) => s.name));
  const required = skillsIn(jdText);

  const matchedSkills = [];
  const missingSkills = [];
  let covered = 0;
  let total = 0;

  for (const skill of required) {
    total += WEIGHT[skill.weight];
    if (inResume.has(skill.name)) {
      matchedSkills.push(skill.name);
      covered += WEIGHT[skill.weight];
    } else {
      missingSkills.push(skill.name);
    }
  }

  const bonusSkills = SKILLS.filter(
    (s) => inResume.has(s.name) && !required.some((r) => r.name === s.name)
  ).map((s) => s.name);

  // A JD that mentions no known skill would divide by zero. Returning 0 with
  // a flag is more useful to the client than NaN.
  const score = total === 0 ? 0 : Math.round((covered / total) * 100);

  return {
    score,
    matchedSkills,
    missingSkills,
    bonusSkills,
    requiredCount: required.length,
    analyzer: "keyword",
  };
}
