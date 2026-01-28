import os

# Process files in articles/news
DIR = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\articles\news"

def clean_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target: onsubmit="handleSidebarSubmit(event)"
    # We want to remove this strictly.
    target = ' onsubmit="handleSidebarSubmit(event)"'
    
    if target in content:
        new_content = content.replace(target, '')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned: {os.path.basename(path)}")
    else:
        # Check for alternative spacing just in case
        pass

def main():
    if not os.path.exists(DIR):
        print("Dir not found")
        return
        
    for name in os.listdir(DIR):
        if name.endswith(".html"):
            clean_file(os.path.join(DIR, name))

if __name__ == "__main__":
    main()
