/**
 * Centralized, validated access to environment variables.
 *
 * Using a single typed `env` object avoids scattered `process.env.X as string`
 * casts throughout the codebase and fails fast on startup if a required
 * variable is missing.
 */

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  get PORT(): number {
    return Number(process.env.PORT ?? 5000);
  },
  get MONGO_URI(): string {
    return required("MONGO_URI");
  },
  get JWT_SECRET(): string {
    return required("JWT_SECRET");
  },
  get JWT_EXPIRES_IN(): string {
    return process.env.JWT_EXPIRES_IN ?? "24h";
  },
  get NODE_ENV(): "development" | "production" | "test" {
    return (process.env.NODE_ENV as any) ?? "development";
  },
  get CORS_ORIGIN(): string {
    return process.env.CORS_ORIGIN ?? "*";
  },
};
