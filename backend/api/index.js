/* Vercel serverless entry point.
 *
 *  Vercel never runs server.js: there is no long-lived process and nothing
 *  to call app.listen() on. Instead the Express app is exported as a request
 *  handler and Vercel invokes it per request. The rewrite in vercel.json
 *  sends every /api/* path here, so Express still does all the routing —
 *  app.js, the routes and the controller are untouched. */

import mongoose from "mongoose";
import { createApp } from "../app.js";
import { connectDB } from "../config/db.js";

const app = createApp();

/*  A serverless function is frozen between requests and reused while warm,
 *  so the database connection is cached rather than reopened per request.
 *  Without this, every request would open a new connection and you would
 *  exhaust your Atlas connection limit under any real traffic. */
let connectionPromise = null;

function ensureConnection() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true);

  if (!connectionPromise) {
    connectionPromise = connectDB(process.env.MONGODB_URI).then((ok) => {
      // Never cache a failure — otherwise one bad cold start would leave
      // the function permanently unable to reach the database.
      if (!ok) connectionPromise = null;
      return ok;
    });
  }
  return connectionPromise;
}

export default async function handler(req, res) {
  await ensureConnection();
  return app(req, res);
}
