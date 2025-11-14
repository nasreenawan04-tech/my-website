import fs from 'fs';
import path from 'path';
import { tools } from '../client/src/data/tools.js';

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/-/g, '');
}

function updatePageWithSEO(toolId: string, pagePath: string): boolean {
  if (!fs.existsSync(pagePath)) {
    console.log(`  ⚠️  Page not found: ${pagePath}`);
    return false;
  }
  
  const content = fs.readFileSync(pagePath, 'utf-8');
  
  // Check if already using ToolSEOHead
  if (content.includes('ToolSEOHead')) {
    console.log(`  ✓ Already using ToolSEOHead: ${toolId}`);
    return false;
  }
  
  const configVarName = `${toCamelCase(toolId)}SEO`;
  
  // Add imports at the top after existing imports
  let updatedContent = content;
  
  // Find the last import statement
  const importRegex = /^import .+;$/gm;
  const imports = content.match(importRegex) || [];
  if (imports.length === 0) {
    console.log(`  ⚠️  No imports found in: ${toolId}`);
    return false;
  }
  
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
  
  // Add new imports after last import
  const newImports = `
import { ToolSEOHead } from '@/components/seo/ToolSEOHead';
import { ${configVarName} } from '@/config/seo/tools/${toolId}';`;
  
  updatedContent = 
    content.slice(0, lastImportIndex) + 
    newImports + 
    content.slice(lastImportIndex);
  
  // Find the component function and add ToolSEOHead after opening tag
  // Look for patterns like:
  // export default function ComponentName() {
  //   return (
  //     <div> or <>
  
  const componentMatch = updatedContent.match(/export default function \w+\([^)]*\)\s*{[\s\S]*?return\s*\(/);
  
  if (!componentMatch) {
    console.log(`  ⚠️  Could not find component return statement: ${toolId}`);
    return false;
  }
  
  // Find the opening tag after return (
  const returnIndex = componentMatch.index! + componentMatch[0].length;
  const afterReturn = updatedContent.slice(returnIndex);
  
  // Match the first opening tag (div, fragment, etc.)
  const openingTagMatch = afterReturn.match(/^\s*(<>|<\w+[^>]*>)/);
  
  if (!openingTagMatch) {
    console.log(`  ⚠️  Could not find opening tag after return: ${toolId}`);
    return false;
  }
  
  const openingTagEnd = returnIndex + openingTagMatch.index! + openingTagMatch[0].length;
  
  // Insert ToolSEOHead component after opening tag
  const seoComponent = `\n      <ToolSEOHead config={${configVarName}} />`;
  
  updatedContent = 
    updatedContent.slice(0, openingTagEnd) + 
    seoComponent + 
    updatedContent.slice(openingTagEnd);
  
  // Write updated content
  fs.writeFileSync(pagePath, updatedContent);
  
  return true;
}

function main() {
  console.log(`\nUpdating ${tools.length} tool pages with ToolSEOHead...\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  tools.forEach((tool, index) => {
    const pagePath = path.join(process.cwd(), `client/src/pages/${tool.id}.tsx`);
    
    console.log(`[${index + 1}/${tools.length}] ${tool.id}`);
    
    try {
      const wasUpdated = updatePageWithSEO(tool.id, pagePath);
      if (wasUpdated) {
        updated++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
      errors++;
    }
  });
  
  console.log(`\n✅ Page update complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main();
