import mongoose, { Document, Model, Types } from "mongoose";

// Mongoose's generic filter/update types aren't re-exported consistently
// across versions, so we use light-weight aliases that keep the repository
// type-safe at the call site without pinning ourselves to a specific major.
export type Filter<T> = Partial<Record<keyof T, unknown>> & Record<string, unknown>;
export type UpdatePayload<T> = Partial<T> & Record<string, unknown>;

/**
 * Generic repository (Template Method pattern) — encapsulates the most common
 * Mongoose operations.
 *
 * HYBRID STORAGE: If MongoDB is connected, it uses the database. If not, it
 * falls back to an in-memory store. This allows the project
 * to be fully functional on Vercel even without an Atlas cluster configured.
 */
export abstract class BaseRepository<T extends Document> {
  // Global memory storage shared across all instances
  private static readonly memoryStorage: Record<string, any[]> = {};

  protected constructor(protected readonly model: Model<T>) {}

  private get isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private get memory(): any[] {
    const name = this.model.modelName;
    if (!BaseRepository.memoryStorage[name]) {
      BaseRepository.memoryStorage[name] = [];
    }
    return BaseRepository.memoryStorage[name];
  }

  async create(data: Partial<T>): Promise<T> {
    if (this.isConnected) {
      return (await this.model.create(data as any)) as unknown as T;
    }

    const newItem = {
      ...data,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memory.push(newItem);
    return newItem as unknown as T;
  }

  async findById(id: string): Promise<T | null> {
    if (this.isConnected) {
      return this.model.findById(id).exec() as Promise<T | null>;
    }
    return (this.memory.find((item) => item._id.toString() === id.toString()) ||
      null) as T | null;
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    if (this.isConnected) {
      return this.model.findOne(filter as any).exec() as Promise<T | null>;
    }
    return (this.memory.find((item) => {
      return Object.entries(filter).every(([key, value]) => {
        if (item[key] instanceof Types.ObjectId || value instanceof Types.ObjectId) {
          return item[key]?.toString() === value?.toString();
        }
        return item[key] === value;
      });
    }) || null) as T | null;
  }

  async findMany(filter: Filter<T> = {} as Filter<T>): Promise<T[]> {
    if (this.isConnected) {
      return this.model.find(filter as any).exec() as Promise<T[]>;
    }
    return this.memory.filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        // Handle MongoDB $exists operator
        if (value && typeof value === 'object' && '$exists' in value) {
          const exists = (value as any).$exists;
          const hasKey = key in item && item[key] !== undefined && item[key] !== null;
          return exists ? hasKey : !hasKey;
        }

        if (item[key] instanceof Types.ObjectId || value instanceof Types.ObjectId) {
          return item[key]?.toString() === value?.toString();
        }
        return item[key] === value;
      });
    }) as T[];
  }

  async updateById(id: string, update: UpdatePayload<T>): Promise<T | null> {
    if (this.isConnected) {
      return this.model
        .findByIdAndUpdate(id, update as any, { new: true })
        .exec() as Promise<T | null>;
    }

    const index = this.memory.findIndex((item) => item._id.toString() === id.toString());
    if (index === -1) return null;

    this.memory[index] = { ...this.memory[index], ...update, updatedAt: new Date() };
    return this.memory[index] as T;
  }

  async deleteById(id: string): Promise<boolean> {
    if (this.isConnected) {
      const res = await this.model.findByIdAndDelete(id).exec();
      return !!res;
    }

    const index = this.memory.findIndex((item) => item._id.toString() === id.toString());
    if (index === -1) return false;

    this.memory.splice(index, 1);
    return true;
  }

  async count(filter: Filter<T> = {} as Filter<T>): Promise<number> {
    if (this.isConnected) {
      return this.model.countDocuments(filter as any).exec();
    }
    return (await this.findMany(filter)).length;
  }
}
