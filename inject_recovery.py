import os

RECOVERY_SCRIPT = '''    <!-- Google Ad Blocker Recovery -->
    <script async src="https://fundingchoicesmessages.google.com/i/pub-9227354288966999?ers=1"></script><script>(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();</script>
'''

def inject_recovery(root_dir):
    modified_count = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
        if '.git' in dirnames:
            dirnames.remove('.git')
        
        for filename in filenames:
            if filename.endswith('.html'):
                full_path = os.path.join(dirpath, filename)
                
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if 'fundingchoicesmessages.google.com' in content:
                        print(f"Skipping {filename} (Already injected)")
                        continue
                    
                    # Try to insert after AdSense script
                    adsense_marker = 'crossorigin="anonymous"></script>'
                    if adsense_marker in content:
                        parts = content.split(adsense_marker)
                        # Insert after the first occurrence (which is usually the ad script in head)
                        # We reconstruct: part 0 + marker + \n + script + part 1
                        new_content = parts[0] + adsense_marker + '\n' + RECOVERY_SCRIPT + parts[1]
                        
                        # Handle multiple occurrences if any? 
                        # Actually standard split/join might act weird if multiple scripts.
                        # Ideally find the *first* one in HEAD.
                        
                        # Robust approach: Find </head>, insert before it.
                        # But user usually puts adsense high up.
                        # Let's stick to inserting before </head> to be safe and simple.
                    
                    head_end_marker = '</head>'
                    if head_end_marker in content:
                        new_content = content.replace(head_end_marker, RECOVERY_SCRIPT + '\n' + head_end_marker)
                        
                        with open(full_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        modified_count += 1
                        print(f"Injected into {filename}")
                        
                except Exception as e:
                    print(f"Error processing {full_path}: {e}")

    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    inject_recovery(os.getcwd())
