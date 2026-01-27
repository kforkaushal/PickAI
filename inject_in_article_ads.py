import os

# The specific ad code provided by the user
AD_CODE = '''
<!-- In-Article Ad -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-9227354288966999"
     data-ad-slot="5217219266"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
'''

# Unique identifier to prevent double injection
UNIQUE_ID = 'data-ad-slot="5217219266"'

def inject_in_article_ads(root_dir):
    modified_count = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
        
        for filename in filenames:
            if filename.endswith('.html'):
                full_path = os.path.join(dirpath, filename)
                
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check if already injected
                    if UNIQUE_ID in content:
                        print(f"Skipping {filename} (Already injected)")
                        continue
                        
                    # Locate article body
                    body_start = content.find('<div class="article-body">')
                    if body_start == -1:
                        continue
                        
                    # Find 2nd paragraph end AFTER the body start
                    # We search for </p> starting from the body_start position
                    first_p_end = content.find('</p>', body_start)
                    if first_p_end == -1:
                        continue
                        
                    second_p_end = content.find('</p>', first_p_end + 4)
                    
                    # If there isn't a 2nd paragraph, try inserting after the 1st
                    insert_pos = -1
                    if second_p_end != -1:
                        insert_pos = second_p_end + 4 # Length of </p>
                    elif first_p_end != -1:
                        insert_pos = first_p_end + 4
                    
                    if insert_pos != -1:
                        print(f"Injecting into: {filename}")
                        new_content = content[:insert_pos] + AD_CODE + content[insert_pos:]
                        
                        with open(full_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        modified_count += 1
                        
                except Exception as e:
                    print(f"Error processing {full_path}: {e}")

    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    inject_in_article_ads(os.getcwd())
