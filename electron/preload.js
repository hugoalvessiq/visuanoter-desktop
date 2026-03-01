const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  focusApp: () => ipcRenderer.send("focus-window"),
  selectFolder: () => ipcRenderer.invoke("dialog:openDirectory"),
  saveBackup: (data) => ipcRenderer.invoke("backup:save", data),
});
