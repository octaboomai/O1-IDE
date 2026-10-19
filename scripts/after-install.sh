#!/bin/bash
INSTALL_DIR="/opt/o1-ide"
BIN_LINK="/usr/local/bin/o1-ide"
if [ -f "${INSTALL_DIR}/o1-ide" ]; then
    ln -sf "${INSTALL_DIR}/o1-ide" "${BIN_LINK}" 2>/dev/null || true
fi
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi
echo "o1 IDE installed. Run: o1-ide"
