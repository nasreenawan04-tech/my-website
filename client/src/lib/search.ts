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

const fuse = new Fuse(tools, fuseOptions);

export const searchTools = (query: string): Tool[] => {
  if (!query.trim()) return tools;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const filterToolsByCategory = (category: string): Tool[] => {
  if (category === 'all') return tools;
  return tools.filter(tool => tool.category === category);
};

// Create category-specific fuse instances for better performance
const categoryFuseInstances = new Map<string, Fuse<Tool>>();

const getCategoryFuse = (category: string): Fuse<Tool> => {
  if (!categoryFuseInstances.has(category)) {
    const filteredTools = filterToolsByCategory(category);
    categoryFuseInstances.set(category, new Fuse(filteredTools, fuseOptions));
  }
  return categoryFuseInstances.get(category)!;
};

export const searchAndFilterTools = (query: string, category: string): Tool[] => {
  let filteredTools = filterToolsByCategory(category);
  
  if (!query.trim()) return filteredTools;
  
  const searchFuse = getCategoryFuse(category);
  const results = searchFuse.search(query);
  return results.map(result => result.item);
};
