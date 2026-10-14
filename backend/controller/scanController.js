/* The controller layer: HTTP in, HTTP out.
 *
 *  A controller does four things and no more — read the request, call a
 *  service, choose a status code, send a body. Any logic beyond that belongs
 *  in the service. Keeping it this thin is what makes the service testable
 *  without spinning up a server. */

import { analyseResume, listRecentScans } from "../service/analyzeService.js";

/** POST /api/scan
 *
 *  multipart/form-data with:
 *    resume          the PDF file (field name must be "resume")
 *    jobDescription  the JD as a text field
 *
 *  The upload middleware runs first and puts the file on `req.file` and the
 *  text fields on `req.body`. */
export async function createScan(req, res, next) {
  try {
    const result = await analyseResume({
      buffer: req.file?.buffer,
      fileName: req.file?.originalname,
      jobDescription: req.body.jobDescription,
    });

    res.json(result);
  } catch (error) {
    // Everything thrown below — HttpError from the service included — is
    // formatted in one place by the error handler middleware.
    next(error);
  }
}

/** GET /api/scans — recent scans, newest first. */
export async function getScans(_req, res, next) {
  try {
    const scans = await listRecentScans();
    res.json({ scans });
  } catch (error) {
    next(error);
  }
}
