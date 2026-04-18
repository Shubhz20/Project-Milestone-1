import { Document, Model } from "mongoose";

// Mongoose's generic filter/update types aren't re-exported consistently
// across versions, so we use light-weight aliases that keep the repository
// type-safe at the call site without pinning ourselves to a specific major.
export type Filter<T> = Partial<Record<keyof T, unknown>> & Record<string, unknown>;
export type UpdatePayload<T> = Partial<T> & Record<string, unknown>;

/**
 * Generic repository (Template Method pattern) — encapsulates the most common
 * Mongoose operations so concrete repositories only need to override behavior
 * that differs. Keeps data-access logic out of services and controllers.
 */
export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return (await this.model.create(data as any)) as unknown as T;
  }

  findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec() as Promise<T | null>;
  }

  findOne(filter: Filter<T>): Promise<T | null> {
    return this.model.findOne(filter as any).exec() as Promise<T | null>;
  }

  findMany(filter: Filter<T> = {} as Filter<T>): Promise<T[]> {
    return this.model.find(filter as any).exec() as Promise<T[]>;
  }

  updateById(id: string, update: UpdatePayload<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update as any, { new: true })
      .exec() as Promise<T | null>;
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return !!res;
  }

  count(filter: Filter<T> = {} as Filter<T>): Promise<number> {
    return this.model.countDocuments(filter as any).exec();
  }
}
