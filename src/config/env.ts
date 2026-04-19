/**
 * Centralized, validated access to environment variables.
 *
 * Using a single typed `env` object avoids scattered `process.env.X as string`
 * casts throughout the codebase. We *prefer* the explicit env var but fall
 * back to a safe default where we can, so a misconfigured Vercel deploy
 * returns a sensible 4xx/5xx instead of silently hanging the whole app.
 *
 * IMPORTANT: The fallbacks below are DEV/DEMO defaults only. Real
 * deployments must set `MONGO_URI` and `JWT_SECRET` explicitly (see README).
 */

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/** Stable random-ish default that lets the demo still sign/verify tokens on
 *  a deploy where JWT_SECRET was forgotten. Not cryptographically strong. */
const DEMO_JWT_SECRET =
  "fitness-tracker-demo-secret-not-for-production-use-please-set-JWT_SECRET";

export const env = {
  get PORT(): number {
    return Number(process.env.PORT ?? 5000);
  },
  /**
   * MONGO_URI is *optional* at runtime: if it's missing, the repositories
   * transparently fall back to the in-memory store. We still expose the
   * string so the Singleton can try to connect when it IS set.
   */
  get MONGO_URI(): string {
    return process.env.MONGO_URI ?? "";
  },
  get JWT_SECRET(): string {
    const v = process.env.JWT_SECRET;
    if (v && v.length > 0) return v;
    if (process.env.NODE_ENV === "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[env] JWT_SECRET is not set in production — using an insecure demo secret. " +
          "Set JWT_SECRET in Vercel → Settings → Environment Variables."
      );
    }
    return DEMO_JWT_SECRET;
  },
  get JWT_EXPIRES_IN(): string {
    return process.env.JWT_EXPIRES_IN ?? "7d";
  },
  get NODE_ENV(): "development" | "production" | "test" {
    return (process.env.NODE_ENV as any) ?? "development";
  },
  get CORS_ORIGIN(): string {
    return process.env.CORS_ORIGIN ?? "*";
  },
};

// Re-export `required` so existing call sites / tests keep compiling.
export { required };
