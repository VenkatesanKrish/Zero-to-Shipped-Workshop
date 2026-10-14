/* The service layer: the actual work, with no knowledge of HTTP.
 *
 *  Nothing here touches `req` or `res`. It takes plain values in and returns
 *  plain values or throws `HttpError`, which means it can be called from a
 *  script, a test, or a future queue worker just as easily as from a route.
 *
 *  THIS IS THE SEAM FOR THE AI: `analyseResume()` is the one function the
 *  controller calls. Write an AI-backed version with the same signature and
 *  swap it here — the controller, routes and frontend never change. */

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { SKILLS, WEIGHT } from "../config/skills.js";
import { Scan } from "../models/Scan.js";
import { isConnected } from "../config/db.js";
import { HttpError, containsAlias, normalise } from "../utils.js";

/** Read a PDF Buffer and return its text.
 *
 *  The legacy build is the one that runs on a plain Node runtime — the
 *  default build assumes a browser. The worker is left disabled on purpose:
 *  running pdf.js off the main thread keeps a *browser* responsive, but on a
 *  server the request is already asynchronous, so a worker would only add
 *  moving parts. `disableFontFace` and `isEvalSupported` switch off the
 *  browser-only code paths that would otherwise warn. */
export async function extractPdfText(buffer) {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  try {
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(" "));
    }
    return pages.join("\n");
  } finally {
    // In a finally block so a corrupt page still releases the memory.
    await pdf.destroy();
  }
}

/** Which dictionary skills does this text mention? */
function skillsIn(text) {
  return SKILLS.filter((skill) =>
    skill.aliases.some((alias) => containsAlias(text, alias))
  );
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
export function compareResumeToJob(resumeRaw, jdRaw) {
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

  // A JD that mentions no known skill would divide by zero. Returning 0 is
  // more useful to the client than NaN.
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

/** Persist a scan. Best-effort: a scan is still useful to the caller even if
 *  the database is down, so a failed write must not fail the request. */
async function saveScan({ fileName, resumeText, jobDescription, result }) {
  if (!isConnected()) return null;

  try {
    const doc = await Scan.create({
      fileName,
      resumeText,
      jobDescription,
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      bonusSkills: result.bonusSkills,
      analyzer: result.analyzer,
    });
    return doc.id;
  } catch (error) {
    console.error("[service] Could not save scan:", error.message);
    return null;
  }
}

/** The whole scan flow, start to finish: text in, result out.
 *
 *  Validation that is about *content* rather than transport lives here, so
 *  the rules hold no matter who calls this. */
export async function analyseResume({ buffer, fileName, jobDescription }) {
  if (!buffer) {
    throw new HttpError(400, "No resume uploaded.");
  }

  const jd = (jobDescription || "").trim();
  if (jd.length < 30) {
    throw new HttpError(
      400,
      "Paste the job description (at least a few lines) so we have something to compare against."
    );
  }

  const resumeText = await extractPdfText(buffer);

  // A scanned PDF has no text layer, so pdf.js returns almost nothing.
  // Catch it here and say why, instead of scoring an empty string.
  if (resumeText.replace(/\s/g, "").length < 50) {
    throw new HttpError(
      422,
      "Almost no text came out of that PDF. If it is a scan or an image, export it from Word/Docs so it has a text layer."
    );
  }

  const result = compareResumeToJob(resumeText, jd);
  const id = await saveScan({ fileName, resumeText, jobDescription: jd, result });

  return { ...result, id, fileName };
}

/** Recent scans, newest first. Used by the /scans endpoint to check the
 *  database is actually being written to. */
export async function listRecentScans(limit = 20) {
  if (!isConnected()) {
    throw new HttpError(503, "Database not connected.");
  }

  return Scan.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("fileName score matchedSkills missingSkills createdAt");
}
