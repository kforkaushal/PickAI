import os
import re
from bs4 import BeautifulSoup

# Configuration
SOURCE_DIR = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\articles\news"
TEMPLATE_FILE = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\article.html"

# Common Header/Footer/Sidebar HTML (Dynamic parts will be inserted)
# We will use the structure from article.html but adapted for ../../ relative paths
LAYOUT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Google Analytics 4 + Consent Mode -->
    <script src="../../js/analytics-setup.js"></script>
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999"
     crossorigin="anonymous"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="../../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:wght@400;600;700;900&display=swap"
        rel="stylesheet">

    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../../assets/favicon-16x16.png">
    <link rel="manifest" href="../../site.webmanifest">

    <!-- Meta -->
    <meta name="description" content="{description}">
    <meta name="author" content="PickAI Editorial Board">
    <link rel="canonical" href="https://pickai.netlify.app/articles/news/{filename}">

    <!-- Open Graph -->
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://pickai.netlify.app/articles/news/{filename}">
    <meta property="og:image" content="{image_url}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@PickAI">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image_url}">

    <!-- JSON-LD BreadcrumbList -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pickai.netlify.app/"
      }},{{
        "@type": "ListItem",
        "position": 2,
        "name": "News",
        "item": "https://pickai.netlify.app/#news"
      }},{{
        "@type": "ListItem",
        "position": 3,
        "name": "{title}",
        "item": "https://pickai.netlify.app/articles/news/{filename}"
      }}]
    }}
    </script>

    <!-- JSON-LD NewsArticle -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "{title}",
      "description": "{description}",
      "image": "{image_url}",
      "url": "https://pickai.netlify.app/articles/news/{filename}",
      "datePublished": "{date_published}",
      "dateModified": "{date_published}",
      "author": {{
        "@type": "Organization",
        "name": "PickAI Editorial Board",
        "url": "https://pickai.netlify.app/about.html"
      }},
      "publisher": {{
        "@type": "Organization",
        "name": "PickAI",
        "logo": {{
          "@type": "ImageObject",
          "url": "https://pickai.netlify.app/assets/logo.png"
        }}
      }},
      "mainEntityOfPage": {{
        "@type": "WebPage",
        "@id": "https://pickai.netlify.app/articles/news/{filename}"
      }},
      "isAccessibleForFree": true
    }}
    </script>

    <!-- OneSignal SDK -->
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function (OneSignal) {{
            await OneSignal.init({{
                appId: "6d099781-0ba2-48ac-aa7f-a272cde07e32",
            }});
        }});
    </script>
</head>

<body>

    <header class="site-header">
        <div class="container header-inner">
            <div class="logo"><a href="../../index.html">PickAI.</a></div>
            <nav class="main-nav">
                <ul>
                    <li><a href="../../tools/index.html">Tools</a></li>
                    <li><a href="../../research.html">Research</a></li>
                    <li><a href="../../opinion.html">Opinion</a></li>
                    <li><a href="../../explainers.html">Explainers</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
    </header>

    <div class="container article-layout" style="padding-top: 40px; padding-bottom: 80px;">

        <!-- Main Content -->
        <main class="article-content">
            <header class="article-header">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                    <a href="../../index.html">Home</a>
                    <span class="separator">/</span>
                    <a href="../../index.html#news">News</a>
                    <span class="separator">/</span>
                    <span class="current">Article</span>
                </nav>

                <span class="category">{category}</span>
                <h1>{headline}</h1>
                <div class="article-meta">
                    <span class="author">By PickAI Editorial Board</span>
                    <span class="divider">|</span>
                    <span class="date">{date}</span>
                </div>
            </header>

            <!-- Featured Image -->
            <img src="{image_url}" alt="{headline}" class="article-hero-image" loading="eager">

            <div class="article-body">
                {body_content}
            </div>
        </main>

        <!-- Sidebar -->
        <aside class="article-sidebar">

            <!-- Trending/Related -->
            <div class="sidebar-widget">
                <h4 class="widget-title">Related Analysis</h4>
                <ul class="sidebar-list">
                    <li>
                        <a href="eu-ai-act-compliance.html">
                            <span class="list-category">Policy</span>
                            EU AI Act: Compliance deadlines approaching
                        </a>
                    </li>
                    <li>
                        <a href="nvidia-next-gen-architecture.html">
                            <span class="list-category">Hardware</span>
                            Nvidia's new chip architecture explained
                        </a>
                    </li>
                    <li>
                        <a href="agentic-workflows.html">
                            <span class="list-category">Enterprise</span>
                            The Rise of Agentic Workflows
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Tool Suggestions -->
            <div class="sidebar-widget">
                <h4 class="widget-title">Tools You Might Like</h4>
                <div class="mini-tool-list">
                    <a href="https://cursor.com" class="mini-tool-item">
                        <img src="https://img.logo.dev/cursor.com?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="Cursor" loading="lazy">
                        <div class="mini-tool-info">
                            <span class="name">Cursor</span>
                            <span class="desc">Coding / IDE</span>
                        </div>
                    </a>
                    <a href="https://perplexity.ai" class="mini-tool-item">
                        <img src="https://img.logo.dev/perplexity.ai?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="Perplexity" loading="lazy">
                        <div class="mini-tool-info">
                            <span class="name">Perplexity</span>
                            <span class="desc">Search / Research</span>
                        </div>
                    </a>
                    <a href="https://claude.ai" class="mini-tool-item">
                        <img src="https://img.logo.dev/claude.ai?token=pk_Mg3XAPU3QqSkLxHtf5tWww" alt="Claude" loading="lazy">
                        <div class="mini-tool-info">
                            <span class="name">Claude</span>
                            <span class="desc">LLM / Writing</span>
                        </div>
                    </a>
                </div>
                <a href="../../tools/index.html" class="widget-link">View all tools &rarr;</a>
            </div>

            <!-- Ad Slot Sidebar -->
            <div class="ad-container" style="margin-top: 40px;">
                <span class="ad-label">Advertisement</span>
                <div class="ad-slot ad-rectangle" style="width: 300px; height: 250px;"></div>
            </div>

        </aside>

    </div>

    <footer class="site-footer">
        <div class="container footer-content">
            <div class="footer-brand">
                PickAI.
                <div class="meta-text" style="font-weight: normal; margin-top: 10px; font-size: 0.8rem;">
                    &copy; 2026 PickAI Editorial.
                </div>
            </div>
            <div class="footer-links">
                <ul>
                    <li><a href="../../about.html">About</a></li>
                    <li><a href="../../editorial-policy.html">Editorial Policy</a></li>
                    <li><a href="../../privacy.html">Privacy</a></li>
                    <li><a href="../../contact.html">Contact</a></li>
                </ul>
            </div>
        </div>
    </footer>

    <!-- Global Search -->
    <script src="../../js/search.js"></script>
    <script src="../../js/app.js"></script>
    <!-- Consent Banner -->
    <script src="../../js/consent.js" defer></script>

</body>

</html>
"""

def extract_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Basic Metadata
    title = soup.title.string if soup.title else "News — PickAI"
    if "— PickAI" not in title:
        title += " — PickAI"
        
    desc_meta = soup.find('meta', attrs={'name': 'description'})
    description = desc_meta['content'] if desc_meta else "Latest AI analysis and news."

    # Article Header Info
    h1 = soup.find('h1')
    headline = h1.text.strip() if h1 else "Untitled Article"
    
    cat_span = soup.find('span', class_='category')
    category = cat_span.text.strip() if cat_span else "News"

    # Try to find date in existing meta or default
    date = "Jan 19, 2026" 
    
    # Image
    img = soup.find('img')
    image_url = img['src'] if img else "https://picsum.photos/seed/default/1200/675"
    if image_url.startswith('../'): # Fix relative paths from old structure if any
        image_url = image_url.replace('../', '')

    # Body Content
    # We look for <article class="article-body"> or just take p tags if missing
    article_body = soup.find('article', class_='article-body')
    if article_body:
        # Remove the first image if it's the hero image inside body (we moved it to Layout)
        first_img = article_body.find('figure')
        if first_img:
            first_img.decompose()
        elif article_body.find('img'):
             article_body.find('img').decompose()
             
        body_content = "".join([str(x) for x in article_body.contents])
    else:
        # Fallback: grab all paragraphs in main
        main = soup.find('main')
        if main:
            body_content = "".join([str(p) for p in main.find_all('p')])
        else:
            body_content = "<p>Content parsing error.</p>"

    return {
        "title": title,
        "description": description,
        "category": category,
        "headline": headline,
        "date": date,
        "image_url": image_url,
        "body_content": body_content
    }

def process_files():
    if not os.path.exists("scripts"):
        os.makedirs("scripts")
        
    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.html')]
    print(f"Found {len(files)} articles to process.")

    for filename in files:
        path = os.path.join(SOURCE_DIR, filename)
        try:
            data = extract_content(path)
            new_html = LAYOUT_TEMPLATE.format(
                title=data['title'],
                description=data['description'],
                category=data['category'],
                headline=data['headline'],
                date=data['date'],
                image_url=data['image_url'],
                body_content=data['body_content'],
                filename=filename,
                date_published="2026-01-19"  # ISO 8601 format for JSON-LD
            )
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_html)
                
            print(f"Updated: {filename}")
        except Exception as e:
            print(f"Failed to process {filename}: {e}")

if __name__ == "__main__":
    process_files()
