# o1 IDE

> **The IDE that reads your drone's mind.**
> Zero-setup ROS 2 robotics IDE for Ubuntu and Windows.

[![Release](https://img.shields.io/github/v/release/octaboomai/o1-ide)](https://github.com/octaboomai/o1-ide/releases/latest)
[![Version](https://img.shields.io/badge/version-0.1.0-0fdfff)](https://github.com/octaboomai/o1-ide/releases/tag/v0.1.0)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)

---

## Download

**Latest release: o1 IDE v0.1.0**

| Platform | Format | Install |
|---|---|---|
| **Ubuntu / Debian** | `.deb` | `sudo apt install ./o1-ide-*.deb` |
| **Any Linux** | `.AppImage` | `chmod +x o1-ide-*.AppImage && ./o1-ide-*.AppImage` |
| **Windows 10/11** | `.exe` | Run the installer |

→ **[⬇ Download o1 IDE v0.1.0 — latest release](https://github.com/octaboomai/o1-ide/releases/latest)**

### Windows: browser blocked the download?

The Windows installer is **not code-signed**, so Chrome / Edge and Windows SmartScreen may block it or warn that it "isn't commonly downloaded". If that happens, download it directly with PowerShell — open a Windows PowerShell window and paste this:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri "https://github.com/octaboomai/O1-IDE/releases/download/v0.1.0/o1-ide-0.1.0-windows-x64.exe" -OutFile "$env:USERPROFILE\Downloads\o1-ide-0.1.0-windows-x64.exe"
```

Then run the file from your Downloads folder. Windows may still show a SmartScreen prompt for an unsigned app — choose **More info → Run anyway**.

---

## What's bundled (nothing to install separately)

- ROS 2 Humble detection + guided install
- **clangd 18** — C++ IntelliSense, bundled in the app
- **pyright** — Python IntelliSense, bundled in the app
- **pymavlink + pyulog + numpy** — installed automatically on first launch
- Three.js + roslibjs — offline, no CDN needed

---

## Features

- Live ROS 2 telemetry via rosbridge WebSocket
- URDF / Xacro 3D model viewer
- `.msg` / `.srv` / `.action` syntax + autocomplete
- colcon + CMake build tasks
- Python + C++ attach-to-process debugging
- Project templates (PX4, ArduPilot, Nav2, Jetson, RPi)
- Toolchain environment checker
- System tray, auto-updater, window state persistence

---

## Development

```bash
git clone https://github.com/octaboomai/o1-ide
cd o1-ide
yarn install
yarn workspace o1-extension build
yarn workspace o1-app build       # dev build
yarn workspace o1-app start       # run in Electron

# Production package
yarn dist:linux    # → dist/*.deb + dist/*.AppImage
yarn dist:windows  # → dist/*.exe
```

---

## Release

```bash
git tag v0.2.0
git push origin v0.2.0
# GitHub Actions builds and publishes automatically
```

---

## License

Apache 2.0 © octaboomai
