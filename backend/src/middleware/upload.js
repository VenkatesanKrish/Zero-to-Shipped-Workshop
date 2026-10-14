import multer from "multer";

const MAX_BYTES = 5 * 1024 * 1024;

/** Multer keeps the upload in memory instead of writing it to disk.
 *
 *  memoryStorage is the right call here: the PDF is parsed once and thrown
 *  away, so a temp file would only add cleanup work and a place for stale
 *  resumes to pile up. The trade-off is that a large file sits in RAM, which
 *  is why the size limit matters. */
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      // Passing an Error here surfaces as a 400 in the error handler.
      return cb(new Error("Only PDF resumes are accepted."));
    }
    cb(null, true);
  },
}).single("resume"); // the form field must be named "resume"
