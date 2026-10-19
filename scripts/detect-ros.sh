#!/bin/bash
# Detects ROS 2 on Linux (native) and Windows (WSL2)
# Output: JSON { found, distro, path, via }

ROS_DISTROS=("jazzy" "humble" "iron" "rolling" "foxy")

# ── Linux: native detection ───────────────────────────────────────────────────
for distro in "${ROS_DISTROS[@]}"; do
    SETUP="/opt/ros/${distro}/setup.bash"
    if [ -f "$SETUP" ]; then
        source "$SETUP" 2>/dev/null
        echo "{\"found\":true,\"distro\":\"${distro}\",\"path\":\"/opt/ros/${distro}\",\"via\":\"native\"}"
        exit 0
    fi
done

# ── Windows: WSL2 detection (when running via Electron on Windows) ────────────
if command -v wsl.exe &>/dev/null 2>&1; then
    for distro in "${ROS_DISTROS[@]}"; do
        FOUND=$(wsl.exe -- bash -c "test -f /opt/ros/${distro}/setup.bash && echo yes || echo no" 2>/dev/null | tr -d '\r')
        if [ "$FOUND" = "yes" ]; then
            echo "{\"found\":true,\"distro\":\"${distro}\",\"path\":\"/opt/ros/${distro}\",\"via\":\"wsl2\"}"
            exit 0
        fi
    done
fi

# ── Conda / mamba ROS install ─────────────────────────────────────────────────
if command -v conda &>/dev/null; then
    for distro in "${ROS_DISTROS[@]}"; do
        CONDA_ROS=$(conda run -n ros python -c "import rclpy; print('${distro}')" 2>/dev/null)
        if [ -n "$CONDA_ROS" ]; then
            echo "{\"found\":true,\"distro\":\"${distro}\",\"path\":\"conda\",\"via\":\"conda\"}"
            exit 0
        fi
    done
fi

echo '{"found":false,"distro":null,"path":null,"via":null}'
