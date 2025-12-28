/**
 * PrecisionMath utility for robust financial and health calculations.
 * Avoids common floating-point errors by using integer-based arithmetic for currency
 * and controlled rounding for scientific values.
 * 
 * DESIGN PRINCIPLE:
 * We use a "Scale-and-Shift" approach for currency to avoid 0.1 + 0.2 !== 0.3 issues.
 * All currency is internally treated as cents (scaled by 100) before arithmetic.
 */
export const PrecisionMath = {
  /**
   * Rounds a number to a specific decimal precision correctly.
   */
  round: (value: number, decimals: number = 2): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
  },

  /**
   * Safe financial addition.
   */
  add: (a: number, b: number): number => {
    return (Math.round(a * 100) + Math.round(b * 100)) / 100;
  },

  /**
   * Safe financial subtraction.
   */
  subtract: (a: number, b: number): number => {
    return (Math.round(a * 100) - Math.round(b * 100)) / 100;
  },

  /**
   * Safe financial multiplication.
   */
  multiply: (a: number, b: number): number => {
    // For multiplication, we round the result to 4 decimal places of internal precision
    // before the final UI rounding to ensure cumulative errors don't leak.
    return Math.round((a * b + Number.EPSILON) * 10000) / 10000;
  },

  /**
   * Safe financial division.
   */
  divide: (a: number, b: number): number => {
    if (b === 0) return 0;
    return Math.round((a / b + Number.EPSILON) * 10000) / 10000;
  },

  /**
   * Formats a number as currency with guaranteed precision.
   */
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(PrecisionMath.round(value, 2));
  },

  /**
   * Safe comparison for financial values.
   * Accounts for epsilon to avoid floating point mismatch.
   */
  isEqual: (a: number, b: number, epsilon: number = 0.001): boolean => {
    return Math.abs(a - b) < epsilon;
  }
};

/**
 * Storage Keys Registry to prevent collisions.
 */
export const STORAGE_KEYS = {
  FAVORITES: 'dapsiwow-favorites',
  FAVORITE_CATEGORIES: 'dapsiwow-favorite-categories',
  PINNED_TOOLS: 'pinned-tools',
  CALC_HISTORY: 'local_calculation_history',
  USER_PREFS: 'dapsiwow_user_preferences',
} as const;

/**
 * Robust LocalStorage Wrapper with cross-tab sync and error recovery.
 */
export const PersistentStorage = {
  save: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      // Trigger a storage event for cross-tab sync if needed
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: serialized }));
    } catch (e) {
      console.error(`[PersistentStorage] Error saving key "${key}":`, e);
    }
  },

  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      const parsed = JSON.parse(item);
      // Basic type validation for common types
      if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
      if (typeof defaultValue === 'object' && defaultValue !== null && (typeof parsed !== 'object' || parsed === null)) return defaultValue;
      return parsed as T;
    } catch (e) {
      console.error(`[PersistentStorage] Error loading key "${key}", using default.`, e);
      return defaultValue;
    }
  },

  getUsage: (): number => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    return total;
  },

  preventQuotaOverflow: (key: string, limit: number = 20): void => {
    try {
      const history = PersistentStorage.load<any[]>(key, []);
      if (history.length > limit) {
        PersistentStorage.save(key, history.slice(0, limit));
      }
    } catch (e) {
      console.error(`[PersistentStorage] Error managing quota for "${key}":`, e);
    }
  }
};
