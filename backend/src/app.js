import express from "express";
import cors from "cors";
import { scanRouter } from "./routes/scan.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

/** Build the Express app. Kept separate from server.js so a test file can
 *  import the app and hit it with supertest without opening a port. */
export function createApp() {
  const app = express();

  // The frontend runs on a different port (5173 vs 5000), so it is a
  // cross-origin request and needs CORS. Listing the origin explicitly is
  // better than "*" once you add cookies or auth.
  const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim());

  app.use(cors({ origin: origins }));

  // Only parses JSON bodies. The resume arrives as multipart, which multer
  // handles per-route, so there is no body parser needed for it here.
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", scanRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
