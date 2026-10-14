import mongoose from "mongoose";

/** Connect to MongoDB.
 *
 *  This deliberately does NOT crash the process if the database is
 *  unreachable. During development you will often start the API before
 *  Mongo is running, and a server that dies on boot is much harder to
 *  debug than one that says "not connected" and keeps serving. The scan
 *  endpoint checks `isConnected()` before trying to save. */
export async function connectDB(uri) {
  if (!uri) {
    console.warn("[db] No MONGODB_URI set — scans will not be saved.");
    return false;
  }

  try {
    // Fail fast (5s) instead of hanging for 30s when nothing is listening.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[db] Connected to ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[db] Could not connect: ${error.message}`);
    console.warn("[db] The API will still run; scans just will not be saved.");
    return false;
  }
}

/** True when mongoose has an open connection. */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}
