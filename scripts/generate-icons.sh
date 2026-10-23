#!/bin/bash
# Generates resources/icon.png and resources/icon.ico for o1 IDE.
# Requires: imagemagick (available on the ubuntu-22.04 CI runner)
set -e

mkdir -p resources

ICON_OUT="resources/icon.png"
ICO_OUT="resources/icon.ico"

# ── o1 logo ───────────────────────────────────────────────────────────────────
# Bright cyan tile with the dark o1 orbit mark. The previous design was a
# near-black (#07090d) tile, which read as a black blob against a dark taskbar.
# A light tile keeps the mark legible on BOTH dark and light taskbars.
cat > /tmp/o1-icon.svg << 'SVGEOF'
<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="#0fdfff"/>
  <rect x="7" y="7" width="242" height="242" rx="50" fill="none" stroke="#07090d" stroke-width="3" stroke-opacity="0.15"/>
  <ellipse cx="128" cy="128" rx="96" ry="35" stroke="#07090d" stroke-width="8" fill="none"
           stroke-dasharray="17 12" stroke-opacity="0.5" transform="rotate(-28 128 128)"/>
  <circle cx="128" cy="128" r="62" stroke="#07090d" stroke-width="13" fill="none"/>
  <circle cx="128" cy="128" r="17" fill="#07090d"/>
  <circle cx="205" cy="86" r="15" fill="#07090d"/>
</svg>
SVGEOF
echo "icon SVG written"

# ── SVG → PNG (512×512) ───────────────────────────────────────────────────────
if command -v convert &>/dev/null; then
    convert -background none -size 512x512 /tmp/o1-icon.svg "$ICON_OUT" 2>/dev/null || \
    convert -background "#0fdfff" -size 512x512 /tmp/o1-icon.svg "$ICON_OUT"
    echo "icon.png generated (512×512)"

    # PNG → ICO (multi-size: 256,48,32,16)
    if convert "$ICON_OUT" \
        \( -clone 0 -resize 256x256 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 16x16 \) \
        -delete 0 "$ICO_OUT" 2>/dev/null; then
        echo "icon.ico generated"
    fi
else
    echo "imagemagick not found — using placeholder icons"
    # Create minimal valid PNG placeholder (1×1 pixel)
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$ICON_OUT"
fi
