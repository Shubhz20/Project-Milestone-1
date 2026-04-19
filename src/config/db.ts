import mongoose from "mongoose";
import { env } from "./env";

// Tell mongoose to NEVER buffer commands when there is no connection. By
// default mongoose queues queries against an unconnected model for 10 seconds,
// which is exactly the wrong behaviour on a serverless platform: we want the
// in-memory fallback in BaseRepository to kick in immediately when MongoDB is
// unreachable. With this flag, `model.create()` etc. throws synchronously when
// `readyState !== 1`, but BaseRepository checks `readyState` first so the
// throw never happens — the memory path is taken instead.
mongoose.set("bufferCommands", false);

/**
 * Database connection — Singleton Pattern.
 *
 * Mongoose maintains its own internal pool, but the Database class guarantees
 * that `connect()` is called at most once per process lifecycle. It also
 * exposes a `disconnect()` method used primarily by the test suite to tear
 * down an in-memory MongoDB.
 */
export class Database {
  private static instance: Database | null = null;
  private connected = false;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(uri: string = env.MONGO_URI): Promise<void> {
    if (this.connected) return;
    if (!uri) {
      // No connection string configured — skip. Repositories will use the
      // in-memory fallback automatically.
      throw new Error("MONGO_URI is not set; skipping MongoDB connection");
    }
    // Aggressive fast-fail timeouts so a misconfigured / unreachable cluster
    // doesn't block the serverless function for the default 30 seconds.
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      socketTimeoutMS: 10000,
    });
    this.connected = true;
    if (env.NODE_ENV !== "test") {
      // eslint-disable-next-line no-console
      console.log("[db] MongoDB connected");
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await mongoose.disconnect();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/** Convenience wrapper preserved for backward compatibility with server.ts. */
export const connectDB = async (): Promise<void> => {
  try {
    await Database.getInstance().connect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[db] connection failed", error);
    process.exit(1);
  }
};
