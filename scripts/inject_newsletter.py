import os
import re

# Configuration
ARTICLES_DIR = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\articles\news"
NEWSLETTER_WIDGET_HTML = """
            <!-- Newsletter Widget (Injected) -->
            <div class="sidebar-widget newsletter-widget" id="newsletter-widget">
                <h4 class="widget-title">The PickAI Briefing</h4>
                <p>Join 15,000+ researchers tracking the future of intelligence.</p>
                <form class="newsletter-form" onsubmit="handleSidebarSubmit(event)">
                    <input type="email" class="newsletter-input" placeholder="Work email" required>
                    <button type="submit" class="newsletter-btn">Subscribe</button>
                </form>
                <div class="newsletter-feedback"></div>
            </div>
"""

# Relative paths from articles/news/ to root
CSS_LINK = '<link rel="stylesheet" href="../../css/newsletter.css">'
SUPABASE_SCRIPT = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
NEWSLETTER_SCRIPT = '<script src="../../js/newsletter.js"></script>'

def process_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if already injected
    if "newsletter-widget" in content:
        print(f"Skipping {os.path.basename(file_path)}: Already injected.")
        return

    # 1. Inject CSS Link (in <head>)
    if "css/newsletter.css" not in content:
        # Insert before </head>
        content = content.replace("</head>", f"    {CSS_LINK}\n</head>")

    # 2. Inject Scripts (before </body>)
    if "js/newsletter.js" not in content:
        content = content.replace("</body>", f"    {SUPABASE_SCRIPT}\n    {NEWSLETTER_SCRIPT}\n</body>")

    # 3. Inject Widget (Top of Sidebar)
    # Look for <aside class="article-sidebar">
    sidebar_pattern = r'(<aside class="article-sidebar">)'
    if re.search(sidebar_pattern, content):
        content = re.sub(sidebar_pattern, f'\\1\n{NEWSLETTER_WIDGET_HTML}', content, count=1)
        print(f"Injected widget into {os.path.basename(file_path)}")
    else:
        print(f"Warning: No sidebar found in {os.path.basename(file_path)}")
        return

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    if not os.path.exists(ARTICLES_DIR):
        print(f"Directory not found: {ARTICLES_DIR}")
        return

    files = [f for f in os.listdir(ARTICLES_DIR) if f.endswith(".html")]
    print(f"Found {len(files)} HTML files.")

    for filename in files:
        process_file(os.path.join(ARTICLES_DIR, filename))

if __name__ == "__main__":
    main()
