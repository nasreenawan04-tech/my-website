import fs from 'fs';
import path from 'path';
import { tools } from '../client/src/data/tools.js';

function removeDuplicateHelmet(toolId: string, pagePath: string): boolean {
  if (!fs.existsSync(pagePath)) {
    return false;
  }
  
  let content = fs.readFileSync(pagePath, 'utf-8');
  
  // Only process if page has ToolSEOHead
  if (!content.includes('ToolSEOHead')) {
    return false;
  }
  
  // Remove Helmet import if present
  const originalContent = content;
  content = content.replace(/import\s+{\s*Helmet\s*}\s+from\s+['"]react-helmet-async['"];\s*\n/g, '');
  
  // Remove Helmet component blocks
  // Pattern: <Helmet>...</Helmet> with content in between
  content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>\s*/g, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(pagePath, content);
    return true;
  }
  
  return false;
}

function main() {
  console.log(`\nRemoving duplicate Helmet blocks from pages...\n`);
  
  let updated = 0;
  let skipped = 0;
  
  tools.forEach((tool, index) => {
    const pagePath = path.join(process.cwd(), `client/src/pages/${tool.id}.tsx`);
    
    try {
      const wasUpdated = removeDuplicateHelmet(tool.id, pagePath);
      if (wasUpdated) {
        console.log(`✓ [${index + 1}/${tools.length}] ${tool.id}`);
        updated++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.log(`❌ [${index + 1}/${tools.length}] ${tool.id}: ${error}`);
    }
  });
  
  console.log(`\n✅ Complete! Updated: ${updated}, Skipped: ${skipped}`);
}

main();
