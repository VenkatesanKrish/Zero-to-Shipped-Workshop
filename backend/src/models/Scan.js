import mongoose from "mongoose";

/** One resume-vs-JD analysis.
 *
 *  We keep both raw texts so a scan can be re-run later with the AI
 *  analyser without asking the user to upload again. If you are storing
 *  real resumes, treat this collection as personal data: add a TTL index
 *  or a delete endpoint rather than keeping them forever. */
const scanSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },

    // Raw inputs
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },

    // Result
    score: { type: Number, required: true, min: 0, max: 100 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    bonusSkills: { type: [String], default: [] },

    // Which analyser produced this. "keyword" today, "ai" once that lands.
    analyzer: { type: String, default: "keyword" },
  },
  { timestamps: true }
);

export const Scan = mongoose.model("Scan", scanSchema);
