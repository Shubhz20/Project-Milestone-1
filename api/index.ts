/**
 * Vercel serverless entry point.
 *
 * Vercel's Node runtime expects a default-exported `(req, res)` handler. Our
 * Express app *is* such a handler, so we re-export it after *attempting* to
 * bring up a Mongoose connection — capped at a short timeout so a
 * misconfigured `MONGO_URI` or a blocked Atlas IP whitelist can never stall
 * the request. The repositories have a full in-memory fallback that kicks in
 * automatically when `mongoose.connection.readyState !== 1`, so the API stays
 * 100 % functional regardless of database health.
 */
import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app";
import { Database } from "../src/config/db";

// Loud, one-time startup banner so the Vercel function logs make the
// difference between "MongoDB connected" and "in-memory fallback" obvious.
if (!process.env.MONGO_URI) {
  // eslint-disable-next-line no-console
  console.warn(
    "\n================================================================\n" +
      "[api] WARNING: MONGO_URI is not set.\n" +
      "  The API will run in IN-MEMORY FALLBACK mode.\n" +
      "  Data will NOT persist across serverless invocations, and\n" +
      "  signup/login may appear to fail intermittently because each\n" +
      "  Vercel lambda replica has its own independent memory store.\n" +
      "  Fix: Vercel Dashboard → Project → Settings → Environment\n" +
      "       Variables → add MONGO_URI (MongoDB Atlas connection string).\n" +
      "  Also ensure the Atlas IP allowlist permits 0.0.0.0/0 so Vercel\n" +
      "  can reach your cluster.\n" +
      "================================================================\n"
  );
}

/** Fire the connection attempt exactly once per warm function instance. */
let dbPromise: Promise<void> | null = null;
const startDb = (): Promise<void> => {
  if (!dbPromise) {
    dbPromise = Database.getInstance()
      .connect()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log("[api] MongoDB connection established");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(
          "[api] mongo connect failed — falling back to in-memory store:",
          (err as Error)?.message ?? err
        );
        // Reset so a later cold start can retry (e.g. after env vars are
        // fixed in the Vercel dashboard).
        dbPromise = null;
      });
  }
  return dbPromise;
};

/** Race the connection against a hard deadline so the handler never hangs. */
const waitForDbWithDeadline = (ms: number): Promise<void> =>
  Promise.race([
    startDb(),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]);

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // Give Mongo a brief window to come up on cold start, then proceed no
  // matter what. If Mongo is ready, repositories will use it. If not, the
  // BaseRepository falls through to the in-memory store.
  await waitForDbWithDeadline(3000);

  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(
    req,
    res
  );
}
