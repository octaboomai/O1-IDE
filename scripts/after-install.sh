#!/bin/bash
INSTALL_DIR="/opt/o1-ide"
BIN_LINK="/usr/local/bin/o1-ide"
[ -f "${INSTALL_DIR}/o1-ide" ] && ln -sf "${INSTALL_DIR}/o1-ide" "${BIN_LINK}" 2>/dev/null || true
command -v update-desktop-database &>/dev/null && update-desktop-database /usr/share/applications 2>/dev/null || true
echo "o1 IDE installed. Run: o1-ide"
