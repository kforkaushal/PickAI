import os
import sys
from PIL import Image

def generate_favicons():
    source_path = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\assets\logo-source.png"
    assets_dir = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\assets"

    if not os.path.exists(source_path):
        print(f"Error: Source image not found at {source_path}")
        return

    try:
        img = Image.open(source_path)
        # Ensure RGB mode (remove alpha if any, though generated is likely RGBA or RGB)
        if img.mode in ('RGBA', 'LA'):
             # Create white background for transparency
             background = Image.new(img.mode[:-1], img.size, (255, 255, 255))
             background.paste(img, img.split()[-1])
             img = background
        img = img.convert("RGB")

        # 1. Android/Chrome 192x192
        img.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "android-chrome-192x192.png"))
        
        # 2. Android/Chrome 512x512 (Base for PWA)
        img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "android-chrome-512x512.png"))

        # 3. Apple Touch Icon (180x180)
        img.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "apple-touch-icon.png"))

        # 4. Favicon 32x32
        img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "favicon-32x32.png"))

        # 5. Favicon 16x16
        img.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "favicon-16x16.png"))

        # 6. Favicon.ico (Includes 16, 32, 48)
        img.save(os.path.join(assets_dir, "favicon.ico"), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

        print("Favicons generated successfully.")

    except ImportError:
        print("Error: Pillow library not found. Please run 'pip install Pillow'")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_favicons()
