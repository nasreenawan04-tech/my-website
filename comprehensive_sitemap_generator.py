#!/usr/bin/env python3
"""
Comprehensive Sitemap Generator for DapsiWow Tools
Scans actual tool pages in client/src/pages and generates complete sitemaps
"""

import xml.etree.ElementTree as ET
import re
import os
import glob
from datetime import datetime
from typing import Dict, List, Set
import json


class ComprehensiveSitemapGenerator:
    def __init__(self, base_url: str = "https://dapsiwow.com", pages_dir: str = "client/src/pages", output_dir: str = "client/public"):
        self.base_url = base_url.rstrip('/')
        self.pages_dir = pages_dir
        self.output_dir = output_dir
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Define category patterns for tool classification
        self.category_patterns = {
            'finance': [
                r'loan.*calculator', r'mortgage.*calculator', r'emi.*calculator',
                r'compound.*interest', r'simple.*interest', r'roi.*calculator',
                r'tax.*calculator', r'salary.*calculator', r'tip.*calculator',
                r'inflation.*calculator', r'savings.*calculator', r'debt.*calculator',
                r'investment.*calculator', r'retirement.*calculator', r'sip.*calculator',
                r'break.*even', r'business.*loan', r'car.*loan', r'home.*loan',
                r'education.*loan', r'credit.*card', r'percentage.*calculator',
                r'discount.*calculator', r'vat.*calculator', r'gst.*calculator',
                r'paypal.*fee', r'lease.*calculator', r'stock.*profit',
                r'net.*worth', r'cryptocurrency.*converter', r'currency.*converter'
            ],
            'health': [
                r'bmi.*calculator', r'bmr.*calculator', r'calorie.*calculator',
                r'body.*fat', r'ideal.*weight', r'pregnancy.*calculator',
                r'water.*intake', r'protein.*calculator', r'carb.*calculator',
                r'keto.*calculator', r'fasting.*timer', r'step.*calorie',
                r'heart.*rate', r'blood.*pressure', r'sleep.*calculator',
                r'ovulation.*calculator', r'baby.*growth', r'tdee.*calculator',
                r'lean.*body', r'waist.*ratio', r'whr.*calculator',
                r'life.*expectancy', r'cholesterol.*calculator', r'running.*pace',
                r'cycling.*speed', r'swimming.*calorie', r'alcohol.*calorie',
                r'smoking.*cost', r'intermittent.*fasting'
            ],
            'text': [
                r'word.*counter', r'character.*counter', r'sentence.*counter',
                r'paragraph.*counter', r'case.*converter', r'password.*generator',
                r'name.*generator', r'username.*generator', r'address.*generator',
                r'qr.*generator', r'qr.*text', r'font.*changer', r'reverse.*text',
                r'text.*to.*qr', r'qr.*to.*text', r'text.*to.*binary',
                r'binary.*to.*text', r'qr.*scanner', r'markdown.*to.*html',
                r'html.*to.*markdown', r'lorem.*ipsum', r'text.*encrypt',
                r'text.*decrypt', r'url.*encoder', r'url.*decoder',
                r'base64.*encode', r'base64.*decode', r'decimal.*to.*text',
                r'text.*to.*decimal'
            ]
        }
        
    def get_all_tool_pages(self) -> List[Dict]:
        """Get all tool pages from the pages directory"""
        pages_pattern = os.path.join(self.pages_dir, "*.tsx")
        all_pages = glob.glob(pages_pattern)
        
        tools = []
        
        # Static/category pages to exclude from tool listings
        exclude_pages = {
            'about-us', 'contact-us', 'privacy-policy', 'terms-of-service',
            'help-center', 'not-found', 'home', 'all-tools', 'finance-tools',
            'health-tools', 'text-tools', 'tool-page'
        }
        
        for page_path in all_pages:
            filename = os.path.basename(page_path)
            page_id = filename.replace('.tsx', '')
            
            # Skip excluded pages
            if page_id in exclude_pages:
                continue
            
            # Create URL path
            href = f'/tools/{page_id}'
            url = f'{self.base_url}{href}'
            
            # Categorize the tool
            category = self.categorize_tool(page_id)
            
            # Try to extract name from the page file
            name = self.extract_tool_name(page_path, page_id)
            
            tools.append({
                'id': page_id,
                'name': name,
                'category': category,
                'href': href,
                'url': url,
                'page_file': filename
            })
        
        print(f"Found {len(tools)} tool pages in {self.pages_dir}")
        return tools
    
    def extract_tool_name(self, page_path: str, page_id: str) -> str:
        """Try to extract the tool name from the page file"""
        try:
            with open(page_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Look for title patterns in the component
            title_patterns = [
                r'title="([^"]+)"',
                r'<title>([^<]+)</title>',
                r'title:\s*[\'"]([^\'"]+)[\'"]',
                r'name:\s*[\'"]([^\'"]+)[\'"]'
            ]
            
            for pattern in title_patterns:
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
            
        except Exception as e:
            print(f"Warning: Could not extract name from {page_path}: {e}")
        
        # Fallback to formatted page ID
        return page_id.replace('-', ' ').title()
    
    def categorize_tool(self, page_id: str) -> str:
        """Categorize a tool based on its page ID"""
        page_lower = page_id.lower()
        
        # Check each category
        for category, patterns in self.category_patterns.items():
            for pattern in patterns:
                if re.search(pattern, page_lower, re.IGNORECASE):
                    return category
        
        # Default to main if no pattern matches
        return 'main'
    
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
        
        # Add category sitemaps (only for known tool categories, skip 'main')
        tool_categories = [cat for cat in sorted(categories) if cat in self.category_patterns]
        for category in tool_categories:
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
        
        print(f"Created {filepath} index file with {len(tool_categories) + 1} sitemaps")
    
    def compare_with_tools_ts(self) -> None:
        """Compare found pages with tools.ts entries for validation"""
        tools_ts_path = "client/src/data/tools.ts"
        if not os.path.exists(tools_ts_path):
            print(f"Warning: {tools_ts_path} not found, skipping comparison")
            return
        
        # Get tool IDs from tools.ts
        with open(tools_ts_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract tool IDs from tools.ts
        id_pattern = r'id:\s*[\'"]([^\'"]+)[\'"]'
        tools_ts_ids = set(re.findall(id_pattern, content))
        
        # Get actual page IDs
        actual_pages = self.get_all_tool_pages()
        actual_ids = set(tool['id'] for tool in actual_pages)
        
        print(f"\nComparison with tools.ts:")
        print(f"Tools.ts has {len(tools_ts_ids)} tool entries")
        print(f"Actual pages has {len(actual_ids)} tool files")
        
        # Find discrepancies
        missing_from_ts = actual_ids - tools_ts_ids
        missing_pages = tools_ts_ids - actual_ids
        
        if missing_from_ts:
            print(f"\nPages missing from tools.ts ({len(missing_from_ts)}):")
            for tool_id in sorted(missing_from_ts):
                print(f"  - {tool_id}")
        
        if missing_pages:
            print(f"\nTools.ts entries missing pages ({len(missing_pages)}):")
            for tool_id in sorted(missing_pages):
                print(f"  - {tool_id}")
        
        if not missing_from_ts and not missing_pages:
            print("✅ Tools.ts and actual pages are in sync!")
    
    def generate_sitemaps(self) -> None:
        """Main method to generate all sitemaps from actual pages"""
        print("Starting comprehensive sitemap generation from actual pages...")
        print(f"Base URL: {self.base_url}")
        print(f"Current date: {self.current_date}")
        
        # Get all actual tool pages
        tools = self.get_all_tool_pages()
        
        if not tools:
            print("No tool pages found!")
            return
        
        # Compare with tools.ts for validation
        self.compare_with_tools_ts()
        
        # Group tools by category
        categorized_tools = self.group_tools_by_category(tools)
        
        # Report categorization results
        print(f"\nCategorization Summary:")
        total_tools = 0
        for category, tools_in_category in categorized_tools.items():
            count = len(tools_in_category)
            total_tools += count
            print(f"  {category}: {count} tools")
        print(f"  Total: {total_tools} tools")
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create category sitemaps (only for recognized tool categories)
        tool_categories = []
        for category, tools_in_category in categorized_tools.items():
            if category in self.category_patterns and tools_in_category:  # Only known categories
                filename = f'sitemap-{category}.xml'
                self.create_sitemap_xml(tools_in_category, filename)
                tool_categories.append(category)
        
        # Handle any tools categorized as 'main' (uncategorized)
        if 'main' in categorized_tools:
            main_tools = categorized_tools['main']
            if main_tools:
                print(f"\nWarning: {len(main_tools)} tools could not be categorized:")
                for tool in main_tools:
                    print(f"  - {tool['id']}")
        
        # Create main sitemap
        self.create_main_sitemap()
        
        # Create sitemap index
        self.create_sitemap_index(tool_categories)
        
        print("\n✅ Comprehensive sitemap generation completed successfully!")
        print("\nGenerated files:")
        print(f"  - sitemap.xml (index file)")
        print(f"  - sitemap-main.xml")
        for category in sorted(tool_categories):
            print(f"  - sitemap-{category}.xml")


def main():
    """Main function to run the comprehensive sitemap generator"""
    print("DapsiWow Comprehensive Sitemap Generator")
    print("=" * 60)
    
    generator = ComprehensiveSitemapGenerator()
    generator.generate_sitemaps()


if __name__ == "__main__":
    main()