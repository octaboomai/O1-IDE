"use strict";

// FIX #3: your-org → octaboomai  |  FIX #4: added pyright bundle + icon paths
module.exports = {
    appId:       "dev.o1ide.app",
    productName: "o1 IDE",
    copyright:   `Copyright © ${new Date().getFullYear()} octaboomai`,
    asar:        true,

    directories: {
        output:         "dist",
        buildResources: "resources",
    },

    files: [
        "o1-app/lib/**/*",
        "o1-app/package.json",
        "o1-extension/lib/**/*",
        "o1-extension/package.json",
        "node_modules/**/*",
        "resources/**/*",
        "!**/node_modules/.cache/**/*",
        "!**/node_modules/*/{CHANGELOG.md,README.md,readme.md,test,tests}",
        "!**/{test,tests,__tests__,spec,specs}/**/*",
    ],

    extraResources: [
        // Bundled clangd binary (downloaded in CI — no host install needed)
        { from: "resources/clangd", to: "clangd", filter: ["**/*"] },
        // Bundled pyright (npm package — no global install needed)
        { from: "resources/pyright", to: "pyright", filter: ["**/*"] },
        // Three.js + roslibjs for offline URDF viewer
        { from: "resources/vendor", to: "vendor", filter: ["three.min.js","roslib.min.js"] },
        // Post-install scripts
        { from: "scripts", to: "scripts", filter: ["*.sh","*.ps1"] },
        // Splash screen
        { from: "o1-app/src/splash.html", to: "resources/splash.html" },
    ],

    // ── Linux ──────────────────────────────────────────────────────────────
    linux: {
        target: [
            { target: "deb",      arch: ["x64", "arm64"] },
            { target: "AppImage", arch: ["x64", "arm64"] },
        ],
        icon:        "resources/icon.png",
        category:    "Development",
        description: "ROS 2 robotics IDE — zero-setup for drone and robot developers",
        maintainer:  "octaboomai <hello@o1ide.dev>",
        desktop: {
            Name:       "o1 IDE",
            Comment:    "ROS 2 robotics IDE",
            Categories: "Development;IDE;",
            StartupWMClass: "o1-ide",
        },
    },

    deb: {
        depends: ["libnotify4","libxtst6","libnss3","libsecret-1-0","libxss1","python3","python3-pip"],
        recommends: ["git","cmake"],
        afterInstall: "scripts/after-install.sh",
        afterRemove:  "scripts/after-remove.sh",
    },

    // ── Windows ────────────────────────────────────────────────────────────
    win: {
        target: [
            { target: "nsis", arch: ["x64"] },
            { target: "msi",  arch: ["x64"] },
        ],
        icon:         "resources/icon.ico",
        artifactName: "o1-ide-${version}-windows-${arch}.${ext}",
        sign:          process.env["WIN_SIGN_CERT"] ? "./scripts/sign-win.js" : undefined,
        signingHashAlgorithms: ["sha256"],
    },

    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        installerIcon:          "resources/icon.ico",
        uninstallerIcon:        "resources/icon.ico",
        installerHeaderIcon:    "resources/icon.ico",
        createDesktopShortcut:  true,
        createStartMenuShortcut: true,
        shortcutName:           "o1 IDE",
        license:                "resources/LICENSE.txt",
        include:                "resources/installer.nsh",
        displayLanguageSelector: false,
    },

    msi: {
        createDesktopShortcut:    true,
        createStartMenuShortcut:  true,
    },

    // ── Auto-updater → GitHub Releases (octaboomai/o1-ide) ────────────────
    publish: {
        provider:    "github",
        owner:       "octaboomai",   // FIX #3
        repo:        "o1-ide",
        releaseType: "release",
    },
};
