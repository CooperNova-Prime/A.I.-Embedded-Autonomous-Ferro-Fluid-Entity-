const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win = null;
let driftInterval = null;
let driftAngle = 0;
let isDrifting = true;

function createEntityWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  win = new BrowserWindow({
    width: 480,
    height: 480,
    x: screenWidth - 520,
    y: screenHeight - 540,
    frame: false,              // Sleek, borderless floating window
    transparent: true,         // Transparent canvas background
    alwaysOnTop: true,         // Floats above all open desktop windows
    hasShadow: false,
    resizable: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Load the running dev server or fallback to production port
  const targetURL = process.env.ELECTRON_URL || 'http://localhost:3000';
  win.loadURL(targetURL);

  // Mouse events enabled for interaction with entity and diegetic spatial UI
  win.setIgnoreMouseEvents(false);

  // Autonomous entity drift across screen perimeter
  startDriftLoop();

  win.on('closed', () => {
    win = null;
    if (driftInterval) clearInterval(driftInterval);
  });
}

function startDriftLoop() {
  if (driftInterval) clearInterval(driftInterval);

  driftInterval = setInterval(() => {
    if (!win || !isDrifting) return;

    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: sw, height: sh } = primaryDisplay.workAreaSize;

      driftAngle += 0.012;
      // Smooth Lissajous curve for organic, living entity trajectory
      const targetX = Math.round((sw / 2 - 240) + Math.cos(driftAngle) * (sw * 0.36));
      const targetY = Math.round((sh / 2 - 240) + Math.sin(driftAngle * 0.6) * (sh * 0.26));

      win.setPosition(targetX, targetY);
    } catch (_) {}
  }, 45);
}

app.whenReady().then(createEntityWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Controls from Ferrofluid frontend
ipcMain.on('toggle-drift', (event, enable) => {
  isDrifting = typeof enable === 'boolean' ? enable : !isDrifting;
  event.reply('drift-status', isDrifting);
});

ipcMain.on('teleport-entity', (event, { x, y }) => {
  if (win) {
    win.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.on('execute-desktop-action', (event, { action, command }) => {
  try {
    if (action === 'launch_app') {
      const cmd = process.platform === 'win32' ? `start "" "${command}"` : `open "${command}"`;
      exec(cmd, (err, stdout, stderr) => {
        event.reply('desktop-action-result', { success: !err, output: stdout || stderr });
      });
    } else if (action === 'open_url') {
      const cmd = process.platform === 'win32' ? `start "" "${command}"` : `open "${command}"`;
      exec(cmd, (err, stdout) => {
        event.reply('desktop-action-result', { success: !err, output: stdout });
      });
    } else if (action === 'run_script') {
      const shellCmd = process.platform === 'win32'
        ? `powershell -NoProfile -Command "${command}"`
        : command;
      exec(shellCmd, (err, stdout, stderr) => {
        event.reply('desktop-action-result', { success: !err, output: stdout || stderr });
      });
    } else if (action === 'system_status') {
      event.reply('desktop-action-result', {
        success: true,
        output: `Platform: ${process.platform}, Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`
      });
    }
  } catch (err) {
    event.reply('desktop-action-result', { success: false, error: String(err) });
  }
});
