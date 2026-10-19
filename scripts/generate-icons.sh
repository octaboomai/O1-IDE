#!/bin/bash
# Generates icon.png and icon.ico from the o1 SVG logo
# Requires: imagemagick (available in ubuntu-22.04 CI runner)
set -e

mkdir -p resources

SVG_SOURCE="o1-app/src/splash.html"
ICON_OUT="resources/icon.png"
ICO_OUT="resources/icon.ico"

# Extract the SVG from splash.html
python3 << 'PYEOF'
import re, sys

with open('o1-app/src/splash.html') as f:
    html = f.read()

m = re.search(r'(<svg[^>]*viewBox[^>]*>.*?</svg>)', html, re.DOTALL)
if m:
    svg = m.group(1)
    with open('/tmp/o1-icon.svg', 'w') as f:
        f.write(f'<?xml version="1.0"?>\n{svg}')
    print("SVG extracted")
else:
    # Fallback: write o1 logo SVG directly
    svg = '''<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="50" fill="#07090d"/>
  <rect x="4" y="4" width="248" height="248" rx="47" fill="none" stroke="#0fdfff" stroke-width="4" stroke-opacity="0.3"/>
  <circle cx="128" cy="128" r="70" stroke="#0fdfff" stroke-width="8" fill="none"/>
  <circle cx="128" cy="128" r="35" stroke="#0fdfff" stroke-width="4" fill="none" stroke-opacity="0.3"/>
  <ellipse cx="128" cy="128" rx="105" ry="38" stroke="#0fdfff" stroke-width="5" fill="none"
           stroke-dasharray="14 10" stroke-opacity="0.4" transform="rotate(-28 128 128)"/>
  <circle cx="210" cy="84" r="16" fill="#0fdfff"/>
  <circle cx="128" cy="128" r="14" fill="#0fdfff" opacity="0.9"/>
</svg>'''
    with open('/tmp/o1-icon.svg', 'w') as f:
        f.write(svg)
    print("SVG generated from fallback")
PYEOF

# Convert SVG → PNG (512×512)
if command -v convert &>/dev/null; then
    convert -background none -size 512x512 /tmp/o1-icon.svg "$ICON_OUT" 2>/dev/null || \
    convert -background "#07090d" -size 512x512 /tmp/o1-icon.svg "$ICON_OUT"
    echo "icon.png generated (512×512)"

    # PNG → ICO (multi-size: 16,32,48,256)
    convert "$ICON_OUT" \
        \( -clone 0 -resize 256x256 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 16x16 \) \
        -delete 0 "$ICO_OUT" 2>/dev/null && echo "icon.ico generated" || true
else
    echo "imagemagick not found — using placeholder icons"
    # Create minimal valid PNG placeholder (1×1 pixel)
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$ICON_OUT"
fi
