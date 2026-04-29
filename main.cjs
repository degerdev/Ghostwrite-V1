// main.cjs
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    backgroundColor: '#0a0a0a', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL('http://localhost:5173'); 
}

app.whenReady().then(createWindow);