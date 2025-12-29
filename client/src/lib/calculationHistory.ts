/**
 * Calculation History Service
 * Fully offline-first system using localStorage
 * No external dependencies required
 */

import { PersistentStorage } from './utils/persistent-storage';

export interface CalculationHistory {
  id: string;
  toolName: string;
  toolPath: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  timestamp: Date;
}

interface StoredCalculation {
  id: string;
  toolName: string;
  toolPath: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  timestamp: string; // ISO string for JSON serialization
}

const STORAGE_KEY = 'dapsiwow_calculation_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Save a calculation to history
 */
export function saveCalculation(
  toolName: string,
  toolPath: string,
  inputs: Record<string, any>,
  results: Record<string, any>
): void {
  try {
    const history = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    
    const newCalculation: StoredCalculation = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolName,
      toolPath,
      inputs,
      results,
      timestamp: new Date().toISOString()
    };
    
    // Add new calculation to the beginning (most recent first)
    history.unshift(newCalculation);
    
    // Keep only the most recent MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    PersistentStorage.setItem(STORAGE_KEY, trimmedHistory);
    console.log(`[CalculationHistory] Saved: ${toolName}`);
  } catch (error) {
    console.error('[CalculationHistory] Failed to save calculation:', error);
  }
}

/**
 * Get all calculations from history
 */
export function getCalculationHistory(): CalculationHistory[] {
  try {
    const stored = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    return stored.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('[CalculationHistory] Failed to get history:', error);
    return [];
  }
}

/**
 * Get calculations for a specific tool
 */
export function getCalculationHistoryByTool(toolName: string): CalculationHistory[] {
  try {
    const history = getCalculationHistory();
    return history.filter(calc => calc.toolName === toolName);
  } catch (error) {
    console.error('[CalculationHistory] Failed to filter by tool:', error);
    return [];
  }
}

/**
 * Get a specific calculation by ID
 */
export function getCalculationById(calculationId: string): CalculationHistory | null {
  try {
    const history = getCalculationHistory();
    return history.find(calc => calc.id === calculationId) || null;
  } catch (error) {
    console.error('[CalculationHistory] Failed to get calculation by ID:', error);
    return null;
  }
}

/**
 * Delete a specific calculation
 */
export function deleteCalculation(calculationId: string): void {
  try {
    const history = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    const filtered = history.filter(calc => calc.id !== calculationId);
    PersistentStorage.setItem(STORAGE_KEY, filtered);
    console.log(`[CalculationHistory] Deleted: ${calculationId}`);
  } catch (error) {
    console.error('[CalculationHistory] Failed to delete calculation:', error);
  }
}

/**
 * Delete all calculations for a specific tool
 */
export function deleteCalculationsForTool(toolName: string): void {
  try {
    const history = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    const filtered = history.filter(calc => calc.toolName !== toolName);
    PersistentStorage.setItem(STORAGE_KEY, filtered);
    console.log(`[CalculationHistory] Deleted all for tool: ${toolName}`);
  } catch (error) {
    console.error('[CalculationHistory] Failed to delete calculations for tool:', error);
  }
}

/**
 * Clear entire calculation history
 */
export function clearAllCalculations(): void {
  try {
    PersistentStorage.removeItem(STORAGE_KEY);
    console.log('[CalculationHistory] Cleared all calculations');
  } catch (error) {
    console.error('[CalculationHistory] Failed to clear all calculations:', error);
  }
}

/**
 * Get count of calculations
 */
export function getCalculationCount(): number {
  try {
    const history = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    return history.length;
  } catch (error) {
    console.error('[CalculationHistory] Failed to get count:', error);
    return 0;
  }
}

/**
 * Export history as JSON
 */
export function exportHistoryAsJSON(): string {
  try {
    const history = getCalculationHistory();
    return JSON.stringify(history, null, 2);
  } catch (error) {
    console.error('[CalculationHistory] Failed to export:', error);
    return '[]';
  }
}

/**
 * Import history from JSON
 */
export function importHistoryFromJSON(jsonData: string): void {
  try {
    const parsed = JSON.parse(jsonData);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid format: expected an array');
    }
    
    // Validate and convert
    const validCalculations: StoredCalculation[] = parsed.map(item => ({
      id: item.id || `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolName: item.toolName || 'Unknown',
      toolPath: item.toolPath || '',
      inputs: item.inputs || {},
      results: item.results || {},
      timestamp: item.timestamp || new Date().toISOString()
    }));
    
    // Merge with existing history (new items first)
    const existing = PersistentStorage.getItem<StoredCalculation[]>(STORAGE_KEY) || [];
    const merged = [...validCalculations, ...existing].slice(0, MAX_HISTORY_ITEMS);
    
    PersistentStorage.setItem(STORAGE_KEY, merged);
    console.log(`[CalculationHistory] Imported ${validCalculations.length} calculations`);
  } catch (error) {
    console.error('[CalculationHistory] Failed to import:', error);
    throw new Error('Invalid JSON format for calculation history');
  }
}

/**
 * Get statistics about the history
 */
export function getHistoryStats() {
  try {
    const history = getCalculationHistory();
    const toolCounts = history.reduce((acc, calc) => {
      acc[calc.toolName] = (acc[calc.toolName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCalculations: history.length,
      totalTools: Object.keys(toolCounts).length,
      toolBreakdown: toolCounts,
      oldestCalculation: history[history.length - 1]?.timestamp || null,
      newestCalculation: history[0]?.timestamp || null
    };
  } catch (error) {
    console.error('[CalculationHistory] Failed to get stats:', error);
    return {
      totalCalculations: 0,
      totalTools: 0,
      toolBreakdown: {},
      oldestCalculation: null,
      newestCalculation: null
    };
  }
}
