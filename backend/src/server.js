import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

// dotenv/config above loads backend/.env into process.env before anything
// reads it. Without it, MONGODB_URI would be undefined and the server would
// quietly run without a database.
const PORT = process.env.PORT || 5000;

const app = createApp();

// Connect first, then listen. connectDB resolves either way (see db.js), so
// a missing database delays startup by at most 5s and never crashes it.
await connectDB(process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`[api] Listening on http://localhost:${PORT}`);
});
