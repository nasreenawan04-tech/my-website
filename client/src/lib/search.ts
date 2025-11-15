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

export const searchAndFilterTools = (query: string, category: string): Tool[] => {
  let filteredTools = filterToolsByCategory(category);
  
  if (!query.trim()) return filteredTools;
  
  const searchFuse = new Fuse(filteredTools, fuseOptions);
  const results = searchFuse.search(query);
  return results.map(result => result.item);
};
