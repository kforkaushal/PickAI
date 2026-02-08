
import os

# Define output directory
output_dir = r"c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\assets\zodiac"
os.makedirs(output_dir, exist_ok=True)

# Define SVG data for 12 zodiac signs (Simplified Paths)
# All paths assume a 100x100 viewBox. Simple geometric representations.
zodiac_data = {
    "aries": '<path d="M20,40 Q30,10 50,40 Q70,10 80,40 M50,40 L50,80" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "taurus": '<circle cx="50" cy="55" r="25" stroke="#1F1F1F" stroke-width="2" fill="none" /><path d="M25,55 Q20,20 50,20 Q80,20 75,55" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "gemini": '<path d="M30,20 L70,20 M30,80 L70,80 M40,20 L40,80 M60,20 L60,80" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "cancer": '<circle cx="35" cy="40" r="10" stroke="#1F1F1F" stroke-width="2" fill="none" /><path d="M35,30 Q60,30 60,60" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" /><circle cx="65" cy="60" r="10" stroke="#1F1F1F" stroke-width="2" fill="none" /><path d="M65,70 Q40,70 40,40" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "leo": '<circle cx="35" cy="40" r="10" stroke="#1F1F1F" stroke-width="2" fill="none" /><path d="M35,30 Q60,10 80,50 Q80,70 60,80" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "virgo": '<path d="M25,30 Q35,20 40,30 L40,70 M40,30 Q50,20 55,30 L55,70 M55,30 Q70,20 75,40 Q70,70 50,80" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "libra": '<path d="M25,70 L75,70 M30,60 L70,60 M35,60 Q50,20 65,60" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "scorpio": '<path d="M25,30 Q35,20 40,30 L40,70 M40,30 Q50,20 55,30 L55,70 M55,30 Q70,20 75,40 L75,80 L85,70" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "sagittarius": '<path d="M25,75 L75,25 M75,25 L50,25 M75,25 L75,50 M35,65 L55,85" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "capricorn": '<path d="M25,30 L35,60 L50,40 Q70,40 70,60 Q70,80 50,75" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "aquarius": '<path d="M25,40 L35,30 L45,40 L55,30 L65,40 L75,30 M25,60 L35,50 L45,60 L55,50 L65,60 L75,50" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />',
    "pisces": '<path d="M35,20 Q20,50 35,80 M65,20 Q80,50 65,80 M25,50 L75,50" stroke="#1F1F1F" stroke-width="2" fill="none" stroke-linecap="round" />'
}

def create_svg(name, content):
    filepath = os.path.join(output_dir, f"{name}.svg")
    svg_template = f"""<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#E5E5E5" stroke-width="1" />
    {content}
</svg>"""
    with open(filepath, "w") as f:
        f.write(svg_template)
    print(f"Created {filepath}")

if __name__ == "__main__":
    for sign, path_data in zodiac_data.items():
        create_svg(sign, path_data)
