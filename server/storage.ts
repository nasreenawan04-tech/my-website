import { collections, calculationHistory, type Collection, type InsertCollection, type CalculationHistory, type InsertCalculationHistory } from "@shared/schema";

export interface IStorage {
  getCollection(shareId: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  getCalculationHistory(): Promise<CalculationHistory[]>;
  createCalculationHistory(history: InsertCalculationHistory): Promise<CalculationHistory>;
}

export class MemStorage implements IStorage {
  private collections: Map<string, Collection>;
  private history: CalculationHistory[];
  private nextId: number;
  private nextHistoryId: number;

  constructor() {
    this.collections = new Map();
    this.history = [];
    this.nextId = 1;
    this.nextHistoryId = 1;
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

  async getCalculationHistory(): Promise<CalculationHistory[]> {
    return this.history;
  }

  async createCalculationHistory(insertHistory: InsertCalculationHistory): Promise<CalculationHistory> {
    const id = this.nextHistoryId++;
    const historyItem: CalculationHistory = { ...insertHistory, id };
    this.history.push(historyItem);
    return historyItem;
  }
}

export const storage = new MemStorage();
