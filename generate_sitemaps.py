#!/usr/bin/env python3
"""
Sitemap Generator for DapsiWow Tools
Reads tools from client/src/data/tools.ts and generates category sitemaps
"""

import xml.etree.ElementTree as ET
import re
import os
from datetime import datetime
from typing import Dict, List, Tuple
import json


class ToolsSitemapGenerator:
    def __init__(self, base_url: str = "https://dapsiwow.com", tools_file: str = "client/src/data/tools.ts", output_dir: str = "client/public"):
        self.base_url = base_url.rstrip('/')
        self.tools_file = tools_file
        self.output_dir = output_dir
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
    def parse_tools_from_ts(self) -> List[Dict]:
        """Parse tools from the TypeScript tools.ts file"""
        if not os.path.exists(self.tools_file):
            print(f"Error: {self.tools_file} not found!")
            return []
            
        with open(self.tools_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the toolsData array
        tools_pattern = r'const toolsData = \[(.*?)\];'
        match = re.search(tools_pattern, content, re.DOTALL)
        
        if not match:
            print("Error: Could not find toolsData array in tools.ts")
            return []
        
        tools_array = match.group(1)
        
        # Parse individual tool objects
        tool_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*name:\s*[\'"]([^\'"]+)[\'"],\s*description:\s*[\'"]([^\'"]*)[\'"],\s*category:\s*[\'"]([^\'"]+)[\'"].*?href:\s*[\'"]([^\'"]+)[\'"]'
        
        tools = []
        for match in re.finditer(tool_pattern, tools_array, re.DOTALL):
            tool_id, name, description, category, href = match.groups()
            
            # Normalize href to ensure it starts with /tools/
            if not href.startswith('/tools/'):
                href = f'/tools/{tool_id}'
            
            # Normalize href: lowercase, clean up
            href = href.lower().replace('//', '/').rstrip('/')
            
            tools.append({
                'id': tool_id,
                'name': name,
                'description': description,
                'category': category,
                'href': href,
                'url': f"{self.base_url}{href}"
            })
        
        print(f"Parsed {len(tools)} tools from {self.tools_file}")
        return tools
    
    def group_tools_by_category(self, tools: List[Dict]) -> Dict[str, List[Dict]]:
        """Group tools by category"""
        categorized = {}
        for tool in tools:
            category = tool['category']
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(tool)
        
        # Sort tools within each category by name for stable output
        for category in categorized:
            categorized[category].sort(key=lambda x: x['name'])
        
        return categorized
    
    def create_sitemap_xml(self, tools: List[Dict], filename: str) -> None:
        """Create a sitemap XML file with given tools"""
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        for tool in tools:
            url_elem = ET.SubElement(urlset, 'url')
            
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = tool['url']
            
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = self.current_date
            
            changefreq_elem = ET.SubElement(url_elem, 'changefreq')
            changefreq_elem.text = 'weekly'
            
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = '0.8'
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(urlset)
        ET.indent(tree, space="  ", level=0)
        
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"Created {filepath} with {len(tools)} URLs")
    
    def create_main_sitemap(self) -> None:
        """Create main sitemap with static pages"""
        main_pages = [
            ('/', 'daily', '1.0'),
            ('/about-us', 'monthly', '0.8'),
            ('/contact-us', 'monthly', '0.8'),
            ('/privacy-policy', 'yearly', '0.5'),
            ('/terms-of-service', 'yearly', '0.5'),
            ('/help-center', 'monthly', '0.7'),
            ('/all-tools', 'weekly', '0.9'),
            ('/finance-tools', 'weekly', '0.9'),
            ('/health-tools', 'weekly', '0.9'),
            ('/text-tools', 'weekly', '0.9'),
        ]
        
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        for path, changefreq, priority in main_pages:
            url_elem = ET.SubElement(urlset, 'url')
            
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = f"{self.base_url}{path}"
            
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = self.current_date
            
            changefreq_elem = ET.SubElement(url_elem, 'changefreq')
            changefreq_elem.text = changefreq
            
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = priority
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(urlset)
        ET.indent(tree, space="  ", level=0)
        
        filepath = os.path.join(self.output_dir, 'sitemap-main.xml')
        with open(filepath, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"Created {filepath} with {len(main_pages)} URLs")
    
    def create_sitemap_index(self, categories: List[str]) -> None:
        """Create the main sitemap index file"""
        sitemapindex = ET.Element('sitemapindex')
        sitemapindex.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        # Add main sitemap
        sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
        loc_elem = ET.SubElement(sitemap_elem, 'loc')
        loc_elem.text = f"{self.base_url}/sitemap-main.xml"
        lastmod_elem = ET.SubElement(sitemap_elem, 'lastmod')
        lastmod_elem.text = self.current_date
        
        # Add category sitemaps
        for category in sorted(categories):
            sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
            
            loc_elem = ET.SubElement(sitemap_elem, 'loc')
            loc_elem.text = f"{self.base_url}/sitemap-{category}.xml"
            
            lastmod_elem = ET.SubElement(sitemap_elem, 'lastmod')
            lastmod_elem.text = self.current_date
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(sitemapindex)
        ET.indent(tree, space="  ", level=0)
        
        filepath = os.path.join(self.output_dir, 'sitemap.xml')
        with open(filepath, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"Created {filepath} index file with {len(categories) + 1} sitemaps")
    
    def generate_sitemaps(self) -> None:
        """Main method to generate all sitemaps"""
        print("Starting sitemap generation from tools.ts...")
        print(f"Base URL: {self.base_url}")
        print(f"Current date: {self.current_date}")
        
        # Parse tools from TypeScript file
        tools = self.parse_tools_from_ts()
        
        if not tools:
            print("No tools found to process!")
            return
        
        # Group tools by category
        categorized_tools = self.group_tools_by_category(tools)
        
        # Report categorization results
        print("\nCategorization Summary:")
        total_tools = 0
        for category, tools_in_category in categorized_tools.items():
            count = len(tools_in_category)
            total_tools += count
            print(f"  {category}: {count} tools")
        print(f"  Total: {total_tools} tools")
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create category sitemaps
        for category, tools_in_category in categorized_tools.items():
            if tools_in_category:  # Only create if there are tools
                filename = f'sitemap-{category}.xml'
                self.create_sitemap_xml(tools_in_category, filename)
        
        # Create main sitemap
        self.create_main_sitemap()
        
        # Create sitemap index
        self.create_sitemap_index(list(categorized_tools.keys()))
        
        print("\n✅ Sitemap generation completed successfully!")
        print("\nGenerated files:")
        print(f"  - sitemap.xml (index file)")
        print(f"  - sitemap-main.xml")
        for category in sorted(categorized_tools.keys()):
            print(f"  - sitemap-{category}.xml")


def main():
    """Main function to run the sitemap generator"""
    print("DapsiWow Tools Sitemap Generator")
    print("=" * 50)
    
    generator = ToolsSitemapGenerator()
    generator.generate_sitemaps()


if __name__ == "__main__":
    main()