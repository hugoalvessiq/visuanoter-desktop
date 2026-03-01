const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeTheme,
} = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  nativeTheme.themeSource = "system";
  const win = new BrowserWindow({
    // frame: false,
    autoHideMenuBar: true,
    width: 1100,
    height: 750,
    minWidth: 700, // Impede que a sidebar esmague o conteúdo
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "hiddenInset", // Deixa o topo limpo estilo Mac
  });

  // Em desenvolvimento, carrega o servidor do Vite
  const loadURL = () => {
    win.loadURL("http://localhost:5173").catch(() => {
      // Se falhar, tenta novamente em 1 segundo
      setTimeout(loadURL, 1000);
    });
  };

  ipcMain.on("focus-window", () => {
    if (win) {
      if (win.isMinimized()) win.restore(); // Se estiver minimizada, restaura
      win.focus(); // Dá o foco
      win.show(); // Garante que apareça
    }
  });

  loadURL();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 1. Função para abrir o seletor de pastas
ipcMain.handle("dialog:openDirectory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0]; // Retorna o caminho da pasta escolhida
  }
});

// 2. Função para salvar o arquivo silenciosamente
ipcMain.handle("backup:save", async (event, { folderPath, fileName, data }) => {
  try {
    const fullPath = path.join(folderPath, fileName);
    fs.writeFileSync(fullPath, data, "utf-8");
    return { success: true, path: fullPath };
  } catch (error) {
    console.error("Erro no backup:", error);
    return { success: false, error: error.message };
  }
});
