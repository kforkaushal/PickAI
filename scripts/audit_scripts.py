import os

root = r'c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI'
analytics_str = 'analytics-setup.js'
pub_id = 'ca-pub-9227354288966999'

missing_analytics = []
missing_adsense_id = []

for dirpath, dirnames, filenames in os.walk(root):
    if any(d in dirpath for d in ['.git', '.next', 'node_modules', '.gemini']):
        continue
    for filename in filenames:
        if filename.endswith('.html'):
            # Skip verification files
            if filename.startswith('google') and filename.endswith('.html') and len(filename) > 20:
                continue
            
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if analytics_str not in content:
                        missing_analytics.append(os.path.relpath(filepath, root))
                    if pub_id not in content:
                        missing_adsense_id.append(os.path.relpath(filepath, root))
            except Exception as e:
                pass

print("Audit Results:")
print(f"Missing Analytics ({len(missing_analytics)}):", missing_analytics)
print(f"Missing AdSense ID ({len(missing_adsense_id)}):", missing_adsense_id)
