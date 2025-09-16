#!/usr/bin/env python3
"""
Sitemap Splitter - Split large sitemap.xml into categorized sitemaps
Created for DapsiWow.com

This script reads an existing sitemap.xml file and splits it into multiple
category-based sitemaps with a sitemap index file.
"""

import xml.etree.ElementTree as ET
from datetime import datetime
import re
import os
from typing import Dict, List, Tuple

class SitemapSplitter:
    def __init__(self, input_file: str = "sitemap.xml", base_url: str = "https://dapsiwow.com"):
        self.input_file = input_file
        self.base_url = base_url
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Define category patterns and their corresponding sitemap files
        self.categories = {
            'main': {
                'file': 'sitemap-main.xml',
                'patterns': [
                    r'/$',  # Homepage
                    r'/about',
                    r'/contact',
                    r'/privacy',
                    r'/terms',
                    r'/help',
                    r'/tools$',  # Main tools page
                    r'/finance$',  # Finance category page
                    r'/health$',  # Health category page
                    r'/text$',  # Text category page
                    r'/pdf$',  # PDF category page
                ]
            },
            'finance': {
                'file': 'sitemap-finance.xml',
                'patterns': [
                    r'loan.*calculator',
                    r'mortgage.*calculator',
                    r'emi.*calculator',
                    r'compound.*interest',
                    r'simple.*interest',
                    r'roi.*calculator',
                    r'tax.*calculator',
                    r'salary.*calculator',
                    r'tip.*calculator',
                    r'inflation.*calculator',
                    r'savings.*calculator',
                    r'debt.*calculator',
                    r'investment.*calculator',
                    r'retirement.*calculator',
                    r'sip.*calculator',
                    r'break.*even',
                    r'business.*loan',
                    r'car.*loan',
                    r'home.*loan',
                    r'education.*loan',
                    r'credit.*card',
                    r'percentage.*calculator',
                    r'discount.*calculator',
                    r'vat.*calculator',
                    r'gst.*calculator',
                    r'paypal.*fee',
                    r'lease.*calculator',
                    r'stock.*profit',
                    r'net.*worth',
                ]
            },
            'health': {
                'file': 'sitemap-health.xml',
                'patterns': [
                    r'bmi.*calculator',
                    r'bmr.*calculator',
                    r'calorie.*calculator',
                    r'body.*fat',
                    r'ideal.*weight',
                    r'pregnancy.*calculator',
                    r'water.*intake',
                    r'protein.*calculator',
                    r'carb.*calculator',
                    r'keto.*calculator',
                    r'fasting.*timer',
                    r'step.*calorie',
                    r'heart.*rate',
                    r'blood.*pressure',
                    r'sleep.*calculator',
                    r'ovulation.*calculator',
                    r'baby.*growth',
                    r'tdee.*calculator',
                    r'lean.*body',
                    r'waist.*ratio',
                    r'whr.*calculator',
                    r'life.*expectancy',
                    r'cholesterol.*calculator',
                    r'running.*pace',
                    r'cycling.*speed',
                    r'swimming.*calorie',
                    r'alcohol.*calorie',
                    r'smoking.*cost',
                ]
            },
            'pdf': {
                'file': 'sitemap-pdf.xml',
                'patterns': [
                    r'merge.*pdf',
                    r'split.*pdf',
                    r'compress.*pdf',
                    r'pdf.*compress',
                    r'pdf.*merge',
                    r'pdf.*split',
                    r'pdf.*convert',
                    r'convert.*pdf',
                    r'pdf.*to.*image',
                    r'image.*to.*pdf',
                    r'pdf.*to.*word',
                    r'word.*to.*pdf',
                    r'pdf.*to.*excel',
                    r'excel.*to.*pdf',
                    r'pdf.*encrypt',
                    r'encrypt.*pdf',
                    r'pdf.*decrypt',
                    r'decrypt.*pdf',
                    r'pdf.*rotate',
                    r'rotate.*pdf',
                    r'pdf.*watermark',
                    r'watermark.*pdf',
                    r'pdf.*sign',
                    r'sign.*pdf',
                    r'pdf.*edit',
                    r'edit.*pdf',
                ]
            },
            'text': {
                'file': 'sitemap-text.xml',
                'patterns': [
                    r'word.*counter',
                    r'character.*counter',
                    r'sentence.*counter',
                    r'paragraph.*counter',
                    r'case.*converter',
                    r'password.*generator',
                    r'name.*generator',
                    r'username.*generator',
                    r'address.*generator',
                    r'qr.*generator',
                    r'font.*changer',
                    r'reverse.*text',
                    r'text.*to.*qr',
                    r'qr.*to.*text',
                    r'text.*to.*binary',
                    r'binary.*to.*text',
                    r'qr.*scanner',
                    r'markdown.*to.*html',
                    r'html.*to.*markdown',
                    r'lorem.*ipsum',
                    r'text.*encrypt',
                    r'text.*decrypt',
                    r'url.*encoder',
                    r'url.*decoder',
                    r'base64.*encode',
                    r'base64.*decode',
                ]
            }
        }

    def parse_existing_sitemap(self) -> List[Tuple[str, str, str, str]]:
        """
        Parse existing sitemap.xml and extract URL data
        Returns list of tuples: (url, lastmod, changefreq, priority)
        """
        if not os.path.exists(self.input_file):
            print(f"Warning: {self.input_file} not found. Creating example URLs based on app structure.")
            return self.create_example_urls()
        
        try:
            tree = ET.parse(self.input_file)
            root = tree.getroot()
            
            # Handle namespace
            namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
            if root.tag.startswith('{'):
                namespace['ns'] = root.tag.split('}')[0][1:]
            
            urls = []
            for url_elem in root.findall('.//ns:url', namespace):
                loc = url_elem.find('ns:loc', namespace)
                lastmod = url_elem.find('ns:lastmod', namespace)
                changefreq = url_elem.find('ns:changefreq', namespace)
                priority = url_elem.find('ns:priority', namespace)
                
                if loc is not None:
                    urls.append((
                        loc.text,
                        lastmod.text if lastmod is not None else self.current_date,
                        changefreq.text if changefreq is not None else "weekly",
                        priority.text if priority is not None else "0.8"
                    ))
            
            print(f"Parsed {len(urls)} URLs from {self.input_file}")
            return urls
            
        except ET.ParseError as e:
            print(f"Error parsing {self.input_file}: {e}")
            return self.create_example_urls()

    def create_example_urls(self) -> List[Tuple[str, str, str, str]]:
        """Create example URLs based on the app structure for demonstration"""
        example_urls = [
            # Main pages
            (f"{self.base_url}/", self.current_date, "daily", "1.0"),
            (f"{self.base_url}/about", self.current_date, "monthly", "0.8"),
            (f"{self.base_url}/contact", self.current_date, "monthly", "0.8"),
            (f"{self.base_url}/privacy", self.current_date, "yearly", "0.5"),
            (f"{self.base_url}/terms", self.current_date, "yearly", "0.5"),
            (f"{self.base_url}/help", self.current_date, "monthly", "0.7"),
            (f"{self.base_url}/tools", self.current_date, "weekly", "0.9"),
            
            # Finance tools
            (f"{self.base_url}/tools/loan-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/mortgage-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/emi-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/compound-interest-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/tax-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/paypal-fee-calculator", self.current_date, "weekly", "0.8"),
            
            # Health tools
            (f"{self.base_url}/tools/bmi-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/bmr-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/calorie-calculator", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/body-fat-calculator", self.current_date, "weekly", "0.8"),
            
            # Text tools
            (f"{self.base_url}/tools/word-counter", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/character-counter", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/case-converter", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/password-generator", self.current_date, "weekly", "0.8"),
            
            # PDF tools (examples)
            (f"{self.base_url}/tools/merge-pdf", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/split-pdf", self.current_date, "weekly", "0.8"),
            (f"{self.base_url}/tools/compress-pdf", self.current_date, "weekly", "0.8"),
        ]
        
        print(f"Created {len(example_urls)} example URLs for demonstration")
        return example_urls

    def categorize_url(self, url: str) -> str:
        """Categorize a URL based on patterns"""
        # Extract path from URL for pattern matching
        path = url.replace(self.base_url, '').lower()
        
        # Check each category (skip main, check it last)
        for category_name, category_data in self.categories.items():
            if category_name == 'main':
                continue
                
            for pattern in category_data['patterns']:
                if re.search(pattern, path, re.IGNORECASE):
                    return category_name
        
        # If no specific category matches, check main patterns
        for pattern in self.categories['main']['patterns']:
            if re.search(pattern, path, re.IGNORECASE):
                return 'main'
        
        # Default to main if no pattern matches
        return 'main'

    def create_sitemap_xml(self, urls: List[Tuple[str, str, str, str]], filename: str) -> None:
        """Create a sitemap XML file with given URLs"""
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        for url, lastmod, changefreq, priority in urls:
            url_elem = ET.SubElement(urlset, 'url')
            
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = url
            
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = lastmod
            
            changefreq_elem = ET.SubElement(url_elem, 'changefreq')
            changefreq_elem.text = changefreq
            
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = priority
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(urlset)
        ET.indent(tree, space="  ", level=0)
        
        with open(filename, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"Created {filename} with {len(urls)} URLs")

    def create_sitemap_index(self) -> None:
        """Create the main sitemap index file"""
        sitemapindex = ET.Element('sitemapindex')
        sitemapindex.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        for category_data in self.categories.values():
            sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
            
            loc_elem = ET.SubElement(sitemap_elem, 'loc')
            loc_elem.text = f"{self.base_url}/{category_data['file']}"
            
            lastmod_elem = ET.SubElement(sitemap_elem, 'lastmod')
            lastmod_elem.text = self.current_date
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(sitemapindex)
        ET.indent(tree, space="  ", level=0)
        
        with open('sitemap.xml', 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"Created sitemap.xml index file referencing {len(self.categories)} category sitemaps")

    def split_sitemap(self) -> None:
        """Main method to split the sitemap"""
        print("Starting sitemap splitting process...")
        print(f"Base URL: {self.base_url}")
        print(f"Current date: {self.current_date}")
        
        # Parse existing sitemap
        all_urls = self.parse_existing_sitemap()
        
        if not all_urls:
            print("No URLs found to process!")
            return
        
        # Categorize URLs
        categorized_urls = {category: [] for category in self.categories.keys()}
        
        for url_data in all_urls:
            url = url_data[0]
            category = self.categorize_url(url)
            categorized_urls[category].append(url_data)
        
        # Report categorization results
        print("\nCategorization Summary:")
        for category, urls in categorized_urls.items():
            print(f"  {category}: {len(urls)} URLs")
        
        # Create category sitemaps
        for category, urls in categorized_urls.items():
            if urls:  # Only create sitemap if there are URLs
                filename = self.categories[category]['file']
                self.create_sitemap_xml(urls, filename)
        
        # Create sitemap index
        self.create_sitemap_index()
        
        print("\n✅ Sitemap splitting completed successfully!")
        print("\nGenerated files:")
        for category_data in self.categories.values():
            print(f"  - {category_data['file']}")
        print("  - sitemap.xml (index file)")

def main():
    """Main function to run the sitemap splitter"""
    print("DapsiWow Sitemap Splitter")
    print("=" * 50)
    
    # You can customize these parameters
    input_sitemap = "sitemap.xml"  # Change this to your existing sitemap file
    base_url = "https://dapsiwow.com"  # Change this to your domain
    
    # Check if custom input file is provided
    if len(os.sys.argv) > 1:
        input_sitemap = os.sys.argv[1]
    
    if len(os.sys.argv) > 2:
        base_url = os.sys.argv[2]
    
    # Create and run the splitter
    splitter = SitemapSplitter(input_sitemap, base_url)
    splitter.split_sitemap()

if __name__ == "__main__":
    main()