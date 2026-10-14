/* The route layer: which URL maps to which controller, and which middleware
 *  runs first. No logic lives here — if you find yourself writing an `if`,
 *  it belongs in the controller or the service. */

import { Router } from "express";
import { createScan, getScans } from "../controller/scanController.js";
import { uploadPdf } from "../middleware/upload.js";

export const scanRouter = Router();

// uploadPdf runs before createScan, so the controller body is already parsed.
scanRouter.post("/scan", uploadPdf, createScan);
scanRouter.get("/scans", getScans);
