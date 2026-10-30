#!/bin/bash
INSTALL_DIR="/opt/rovant"
BIN_LINK="/usr/local/bin/rovant"
if [ -f "${INSTALL_DIR}/rovant" ]; then
    ln -sf "${INSTALL_DIR}/rovant" "${BIN_LINK}" 2>/dev/null || true
fi
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi
echo "Rovant installed. Run: rovant"
