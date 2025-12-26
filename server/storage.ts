import { collections, type Collection, type InsertCollection } from "@shared/schema";

export interface IStorage {
  getCollection(shareId: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
}

export class MemStorage implements IStorage {
  private collections: Map<string, Collection>;
  private nextId: number;

  constructor() {
    this.collections = new Map();
    this.nextId = 1;
  }

  async getCollection(shareId: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find(c => c.shareId === shareId);
  }

  async createCollection(insertCol: InsertCollection): Promise<Collection> {
    const id = this.nextId++;
    const collection: Collection = { ...insertCol, id };
    this.collections.set(collection.shareId, collection);
    return collection;
  }
}

export const storage = new MemStorage();
