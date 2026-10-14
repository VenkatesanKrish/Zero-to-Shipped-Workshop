import { Router } from "express";
import { uploadPdf } from "../middleware/upload.js";
import { extractText } from "../lib/extractText.js";
import { analyze } from "../lib/analyze.js";
import { Scan } from "../models/Scan.js";
import { isConnected } from "../config/db.js";

export const scanRouter = Router();

/** POST /api/scan
 *
 *  multipart/form-data with:
 *    resume          the PDF file (field name must be "resume")
 *    jobDescription  the JD as a text field
 *
 *  The multer middleware runs first and puts the file on `req.file` and the
 *  text fields on `req.body`. */
scanRouter.post("/scan", uploadPdf, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume uploaded." });
    }

    const jobDescription = (req.body.jobDescription || "").trim();
    if (jobDescription.length < 30) {
      return res
        .status(400)
        .json({ error: "Paste the job description (at least a few lines) so we have something to compare against." });
    }

    const resumeText = await extractText(req.file.buffer);

    // A scanned PDF has no text layer, so pdf.js returns almost nothing.
    // Catch it here and say why, instead of scoring an empty string.
    if (resumeText.replace(/\s/g, "").length < 50) {
      return res.status(422).json({
        error:
          "Almost no text came out of that PDF. If it is a scan or an image, export it from Word/Docs so it has a text layer.",
      });
    }

    const result = analyze(resumeText, jobDescription);

    // Saving is best-effort: a scan is still useful even if Mongo is down,
    // so a failed write must not fail the request.
    let savedId = null;
    if (isConnected()) {
      try {
        const doc = await Scan.create({
          fileName: req.file.originalname,
          resumeText,
          jobDescription,
          score: result.score,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          bonusSkills: result.bonusSkills,
          analyzer: result.analyzer,
        });
        savedId = doc.id;
      } catch (dbError) {
        console.error("[db] Could not save scan:", dbError.message);
      }
    }

    res.json({ ...result, id: savedId, fileName: req.file.originalname });
  } catch (error) {
    next(error);
  }
});

/** GET /api/scans — recent scans, newest first.
 *  Handy for checking the database is actually being written to. */
scanRouter.get("/scans", async (_req, res, next) => {
  try {
    if (!isConnected()) {
      return res.status(503).json({ error: "Database not connected." });
    }
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("fileName score matchedSkills missingSkills createdAt");
    res.json({ scans });
  } catch (error) {
    next(error);
  }
});
