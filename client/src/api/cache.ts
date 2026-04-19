/**
 * User-scoped localStorage cache for API data.
 *
 * Because the Vercel serverless backend can cold-start with empty in-memory
 * storage (when MongoDB is unreachable), we cache fetched data on the client
 * so that page refreshes and re-logins show previously-seen data immediately.
 *
 * Every cache key is scoped to a user ID so one browser can host multiple
 * accounts without data leaking between them.
 */

const PREFIX = "fitness-tracker.data";

export const dataCache = {
  /** Read cached data for a given user + resource key. */
  get<T>(userId: string, key: string): T | null {
    try {
      const raw = localStorage.getItem(`${PREFIX}.${userId}.${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /** Write data to the cache. */
  set<T>(userId: string, key: string, data: T): void {
    try {
      localStorage.setItem(`${PREFIX}.${userId}.${key}`, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — silently degrade
    }
  },

  /** Remove a specific cache entry. */
  remove(userId: string, key: string): void {
    localStorage.removeItem(`${PREFIX}.${userId}.${key}`);
  },
};
