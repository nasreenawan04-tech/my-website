/**
 * Persistent Storage Utility
 * Provides a safe wrapper around localStorage with type safety and error handling.
 */

export const PersistentStorage = {
  /**
   * Get an item from localStorage
   * @param key - The storage key
   * @returns The parsed value or undefined if not found or parsing fails
   */
  getItem<T>(key: string): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return undefined;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to retrieve item from localStorage: ${key}`, error);
      return undefined;
    }
  },

  /**
   * Set an item in localStorage
   * @param key - The storage key
   * @param value - The value to store
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store item in localStorage: ${key}`, error);
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - The storage key
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  },
};
