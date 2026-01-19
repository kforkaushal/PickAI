import os
import datetime
import json
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from xml.dom import minidom

# Configuration
BASE_URL = "https://pickai.netlify.app"
ROOT_DIR = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI"
NEWS_DIR = os.path.join(ROOT_DIR, "articles", "news")
OUTPUT_SITEMAP = os.path.join(ROOT_DIR, "sitemap.xml")
OUTPUT_RSS = os.path.join(ROOT_DIR, "rss.xml")

# Static pages priority map
PRIORITY_MAP = {
    "index.html": "1.0",
    "tools/index.html": "0.9",
    "research.html": "0.8",
    "opinion.html": "0.8",
    "explainers.html": "0.8",
    "about.html": "0.5",
    "contact.html": "0.5",
    "privacy.html": "0.1",
    "editorial-policy.html": "0.1",
    "404.html": "0.0"
}

def get_last_mod(filepath):
    timestamp = os.path.getmtime(filepath)
    return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')

def get_rss_date(filepath):
    timestamp = os.path.getmtime(filepath)
    return datetime.datetime.fromtimestamp(timestamp).strftime('%a, %d %b %Y %H:%M:%S +0530')

def generate_sitemap():
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # 1. Add Static Pages
    for filename, priority in PRIORITY_MAP.items():
        if filename == "404.html": continue
        
        filepath = os.path.join(ROOT_DIR, filename)
        if os.path.exists(filepath):
            url = ET.SubElement(urlset, "url")
            loc = ET.SubElement(url, "loc")
            
            # Fix URL construction
            if filename == "index.html":
                page_url = BASE_URL + "/"
            else:
                 page_url = f"{BASE_URL}/{filename}"
            
            loc.text = page_url
            
            lastmod = ET.SubElement(url, "lastmod")
            lastmod.text = get_last_mod(filepath)
            
            prio = ET.SubElement(url, "priority")
            prio.text = priority

    # 2. Add Article Pages
    if os.path.exists(NEWS_DIR):
        for filename in os.listdir(NEWS_DIR):
            if filename.endswith(".html") and filename != "index.html":
                filepath = os.path.join(NEWS_DIR, filename)
                url = ET.SubElement(urlset, "url")
                loc = ET.SubElement(url, "loc")
                loc.text = f"{BASE_URL}/articles/news/{filename}"
                
                lastmod = ET.SubElement(url, "lastmod")
                lastmod.text = get_last_mod(filepath)
                
                prio = ET.SubElement(url, "priority")
                prio.text = "0.7"

    # Write Sitemap
    xml_str = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent="    ")
    with open(OUTPUT_SITEMAP, "w", encoding="utf-8") as f:
        f.write(xml_str)
    print(f"Generated sitemap.xml with {len(urlset)} URLs.")

def generate_rss():
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    
    ET.SubElement(channel, "title").text = "PickAI News & Analysis"
    ET.SubElement(channel, "link").text = BASE_URL
    ET.SubElement(channel, "description").text = "Latest artificial intelligence news, research analysis, and tool reviews from PickAI."
    ET.SubElement(channel, "language").text = "en-us"
    ET.SubElement(channel, "lastBuildDate").text = datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0530')

    if os.path.exists(NEWS_DIR):
        articles = []
        for filename in os.listdir(NEWS_DIR):
            if filename.endswith(".html") and filename != "index.html":
                filepath = os.path.join(NEWS_DIR, filename)
                
                # Parse HTML for title/desc
                with open(filepath, 'r', encoding='utf-8') as f:
                    soup = BeautifulSoup(f.read(), 'html.parser')
                    
                title = soup.title.string.replace(" — PickAI", "") if soup.title else filename
                desc_meta = soup.find('meta', attrs={'name': 'description'})
                description = desc_meta['content'] if desc_meta else "No description available."
                
                articles.append({
                    "title": title,
                    "link": f"{BASE_URL}/articles/news/{filename}",
                    "description": description,
                    "pubDate": get_rss_date(filepath)
                })

        # Sort by date (files don't have real pubDate in metadata easily accessible, using file mod time for simplicity or just reversing)
        # Ideally we'd parse the date from HTML content, but file mod time is a decent proxy for "latest updates"
        articles.sort(key=lambda x: x['pubDate'], reverse=True)

        for art in articles[:20]: # Limit to 20 items
            item = ET.SubElement(channel, "item")
            ET.SubElement(item, "title").text = art['title']
            ET.SubElement(item, "link").text = art['link']
            ET.SubElement(item, "description").text = art["description"]
            ET.SubElement(item, "pubDate").text = art["pubDate"]
            ET.SubElement(item, "guid").text = art['link']

    # Write RSS
    xml_str = minidom.parseString(ET.tostring(rss)).toprettyxml(indent="    ")
    with open(OUTPUT_RSS, "w", encoding="utf-8") as f:
        f.write(xml_str)
    print(f"Generated rss.xml with {len(articles)} items.")

if __name__ == "__main__":
    generate_sitemap()
    generate_rss()
