import fs from 'fs';
import path from 'path';
import { tools } from '../client/src/data/tools.js';

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/-/g, '');
}

function updatePageWithSEO(toolId: string, pagePath: string): boolean {
  if (!fs.existsSync(pagePath)) {
    return false;
  }
  
  let content = fs.readFileSync(pagePath, 'utf-8');
  
  // Skip if already has ToolSEOHead
  if (content.includes('ToolSEOHead')) {
    return false;
  }
  
  const configVarName = `${toCamelCase(toolId)}SEO`;
  
  // Add imports after the last import statement
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  if (importLines.length === 0) return false;
  
  const lastImportLine = importLines[importLines.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImportLine);
  const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
  
  const newImports = `import { ToolSEOHead } from '@/components/seo/ToolSEOHead';\nimport { ${configVarName} } from '@/config/seo/tools/${toolId}';\n`;
  
  content = content.slice(0, insertIndex) + newImports + content.slice(insertIndex);
  
  // Find the return statement and add ToolSEOHead right after the opening tag
  // Handle both: return ( and return<>
  const patterns = [
    /return\s*\(\s*\n\s*</,  // return (\n  <
    /return\s*\(\s*</,        // return (<
    /return\s*</,             // return <
  ];
  
  let insertLocation = -1;
  let matchedPattern = '';
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      insertLocation = match.index + match[0].length;
      matchedPattern = match[0];
      break;
    }
  }
  
  if (insertLocation === -1) {
    console.log(`  ⚠️  Could not find return statement: ${toolId}`);
    return false;
  }
  
  // Find the end of the opening tag
  const afterReturn = content.slice(insertLocation - 1);
  const tagEndMatch = afterReturn.match(/^[^>]*>/);
  
  if (!tagEndMatch) {
    console.log(`  ⚠️  Could not find opening tag end: ${toolId}`);
    return false;
  }
  
  const tagEnd = insertLocation - 1 + tagEndMatch[0].length;
  
  // Insert ToolSEOHead with proper indentation
  const seoComponent = `\n      <ToolSEOHead config={${configVarName}} />`;
  
  content = content.slice(0, tagEnd) + seoComponent + content.slice(tagEnd);
  
  fs.writeFileSync(pagePath, content);
  return true;
}

function main() {
  console.log(`\nUpdating pages with ToolSEOHead (v2)...\n`);
  
  let updated = 0;
  let skipped = 0;
  
  tools.forEach((tool, index) => {
    const pagePath = path.join(process.cwd(), `client/src/pages/${tool.id}.tsx`);
    
    try {
      const wasUpdated = updatePageWithSEO(tool.id, pagePath);
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
