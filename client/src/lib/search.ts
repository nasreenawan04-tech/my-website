import Fuse from 'fuse.js';
import { tools, type Tool } from '@/data/tools';

const fuseOptions = {
  keys: [
    'name',
    'description',
    'category'
  ],
  threshold: 0.3,
  includeScore: true
};

// Cache Fuse instances to avoid re-indexing on every search (critical performance fix)
const fuseCache = new Map<string, Fuse<Tool>>();
const CACHE_KEY_ALL = 'all-tools';
const CACHE_KEY_PREFIX = 'category-';

/**
 * Get or create a cached Fuse instance for the given dataset
 * Prevents unnecessary re-indexing which is the primary bottleneck
 * in search performance as the tool catalog grows
 */
function getFuseInstance(toolSet: Tool[], cacheKey: string): Fuse<Tool> {
  if (!fuseCache.has(cacheKey)) {
    fuseCache.set(cacheKey, new Fuse(toolSet, fuseOptions));
  }
  return fuseCache.get(cacheKey)!;
}

/**
 * Clear cached Fuse instances (call when tools data changes)
 */
export function clearSearchCache(): void {
  fuseCache.clear();
}

export const searchTools = (query: string): Tool[] => {
  if (!query.trim()) return tools;
  
  const fuse = getFuseInstance(tools, CACHE_KEY_ALL);
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const filterToolsByCategory = (category: string): Tool[] => {
  if (category === 'all') return tools;
  return tools.filter(tool => tool.category === category);
};

export const searchAndFilterTools = (query: string, category: string): Tool[] => {
  const filteredTools = filterToolsByCategory(category);
  const cacheKey = category === 'all' ? CACHE_KEY_ALL : `${CACHE_KEY_PREFIX}${category}`;
  
  if (!query.trim()) return filteredTools;
  
  const fuse = getFuseInstance(filteredTools, cacheKey);
  const results = fuse.search(query);
  return results.map(result => result.item);
};
