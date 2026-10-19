#!/bin/bash
# First-run Python package installation
# Called by Electron main on startup if setup flag not set
PKGS=(pymavlink pyulog numpy)
PIP=$(command -v pip3 || command -v pip)

if [ -z "$PIP" ]; then
    echo "pip not found — install Python 3.9+ first"
    exit 1
fi

echo "[o1] Installing Python packages: ${PKGS[*]}"
$PIP install "${PKGS[@]}" --break-system-packages -q 2>&1 || \
$PIP install "${PKGS[@]}" -q 2>&1 || \
$PIP install "${PKGS[@]}" --user -q 2>&1

if python3 -c "import pymavlink, pyulog, numpy" 2>/dev/null; then
    echo "[o1] Python packages ready"
    exit 0
else
    echo "[o1] Some packages failed to install — check pip manually"
    exit 1
fi
