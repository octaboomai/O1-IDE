import { contextBridge, ipcRenderer } from 'electron';

/**
 * Secure IPC bridge — exposes only specific channels to the renderer.
 * The frontend can call window.o1.detectToolchain() etc.
 */
contextBridge.exposeInMainWorld('o1', {
    detectToolchain: () => ipcRenderer.invoke('o1:detect-toolchain'),
    openFolder:      () => ipcRenderer.invoke('o1:open-folder'),
    getPlatform:     () => ipcRenderer.invoke('o1:get-platform'),

    // Listen for commands from main process
    onCommand: (cb: (cmd: string) => void) =>
        ipcRenderer.on('theia:command', (_e, cmd) => cb(cmd)),
    onOpenFolder: (cb: (folder: string) => void) =>
        ipcRenderer.on('theia:open-folder', (_e, folder) => cb(folder)),
});
