import os

ROOT_DIR = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI"

def update_files():
    count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.endswith(".html"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                original_content = content
                modified = False

                # Case 1: index.html (Already partially modified, just needs corrected method)
                if file == "index.html":
                    if 'method="GET"' in content:
                        content = content.replace('method="GET"', 'method="POST"')
                        modified = True
                
                # Case 2: Article pages (Standardize form tag and input)
                # Target: <form class="newsletter-form">
                old_form_tag = '<form class="newsletter-form">'
                new_form_tag = '<form class="newsletter-form" name="newsletter" method="POST" data-netlify="true">'
                
                if old_form_tag in content:
                    content = content.replace(old_form_tag, new_form_tag)
                    modified = True
                
                # Target: <input type="email" class="newsletter-input"
                # To: <input type="email" name="email" class="newsletter-input"
                # We need to be careful not to double-add if it already exists (unlikely given previous grep, but good practice to check logic)
                # Simple string match is safest for exact known pattern in articles
                old_input_tag = '<input type="email" class="newsletter-input"'
                new_input_tag = '<input type="email" name="email" class="newsletter-input"'
                
                if old_input_tag in content:
                    content = content.replace(old_input_tag, new_input_tag)
                    modified = True

                if modified:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"Updated: {filepath}")
                    count += 1
    
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    update_files()
