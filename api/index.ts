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

/** Fire the connection attempt exactly once per warm function instance. */
let dbPromise: Promise<void> | null = null;
const startDb = (): Promise<void> => {
  if (!dbPromise) {
    dbPromise = Database.getInstance()
      .connect()
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
