import os
import re
from bs4 import BeautifulSoup

files = [
    "articles/news/openai-safety-benchmarks.html",
    "articles/news/pebble-round-2-smartwatch.html",
    "articles/news/ringg-ai-voice-funding.html",
    "articles/news/samsung-galaxy-trifold.html",
    "articles/news/spacex-starlink-mission-346.html",
    "articles/news/tech-ai-roundup-jan-2026.html",
    "articles/news/thoughtworks-ai-works.html",
    "articles/news/top-ai-trending-prompts-chatgpt.html",
    "articles/news/transformer-replacements.html",
    "articles/news/transformers-101.html"
]

print("--- BATCH 1 CONTEXT ---")
for fpath in files:
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            soup = BeautifulSoup(content, "html.parser")
            
            title = soup.title.string if soup.title else "NO TITLE"
            h1 = soup.h1.get_text().strip() if soup.h1 else "NO H1"
            
            # Try to find the first significant paragraph
            p_text = "NO CONTENT"
            # Look for logical start of content (often after h1)
            paragraphs = soup.find_all('p')
            for p in paragraphs:
                text = p.get_text().strip()
                if len(text) > 50: # Skip menu items or metadata
                    p_text = text[:300] + "..."
                    break
            
            print(f"\nFILE: {fpath}")
            print(f"TITLE: {title}")
            print(f"H1: {h1}")
            print(f"CONTENT: {p_text}")
            print("-" * 20)
            
    except Exception as e:
        print(f"Error reading {fpath}: {e}")
