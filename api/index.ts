/**
 * Vercel serverless entry point.
 *
 * Vercel's Node runtime expects a default-exported `(req, res)` handler. Our
 * Express app *is* such a handler, so we re-export it after making sure
 * Mongoose has a live connection. The Database Singleton guarantees that the
 * connection is established at most once per warm function instance, so we
 * only pay the round-trip on cold starts.
 */
import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app";
import { Database } from "../src/config/db";

let dbPromise: Promise<void> | null = null;
const ensureDb = (): Promise<void> => {
  if (!dbPromise) {
    dbPromise = Database.getInstance()
      .connect()
      .catch((err) => {
        // Reset so the next invocation can retry the connection rather than
        // being stuck with a rejected promise forever.
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    await ensureDb();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api] db connect failed. falling back to in-memory mode.", err);
  }

  // Express's app is a plain `(req, res) => void` function — delegate.
  // We ALWAYS call the app now because the repositories have a built-in
  // in-memory fallback, making the API fully functional without MongoDB.
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(
    req,
    res
  );
}
