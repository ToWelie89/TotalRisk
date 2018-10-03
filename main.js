// This is free and unencumbered software released into the public domain.
// See LICENSE for details

const electron = require('electron')
const {app, BrowserWindow, Menu, protocol, ipcMain, globalShortcut} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

const Store = require('./js/settings/electronStore.js');
const ElectronSettings = require('./js/settings/electronDefaultSettings.js');

let win;

// LOGGING
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// FIX
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Create window here
function createDefaultWindow() {
  const isDev = process.env.NODE_ENV === 'dev'

  const store = new Store({
    configName: 'user-preferences',
    defaults: ElectronSettings
  })

  let windowBounds = store.get('windowBounds')
  let riskSettings = store.get('riskSettings')

  const mainScreen = electron.screen.getPrimaryDisplay()
  let screenConfig

  if (mainScreen.bounds.width <= 1920) {
    console.log('Screen witdh equal or smaller than 1920')
    screenConfig = {
      zoomFactor: 0.85,
      minWidth: 1340,
      minHeight: 1000
    }
  } else if (mainScreen.bounds.width > 1920 && mainScreen.bounds.width <= 2560) {
    console.log('Screen witdh larger than 1920 and equal or smaller than 2560')
    screenConfig = {
      zoomFactor: 0.9,
      minWidth: 1480,
      minHeight: 1290
    }
  } else if (mainScreen.bounds.width > 2560) {
    console.log('Screen witdh larger than 2560')
    screenConfig = {
      zoomFactor: 1.1,
      minWidth: 1480,
      minHeight: 1340
    }
  } else {
    screenConfig = {
      zoomFactor: 1,
      minWidth: 1280,
      minHeight: 760
    }
  }

  let width = windowBounds ? windowBounds.width : screenConfig.minWidth
  let height = windowBounds ? windowBounds.height : screenConfig.minHeight

  win = new BrowserWindow({
    width: width,
    height: height,
    minWidth: screenConfig.minWidth,
    minHeight: screenConfig.minHeight,
    title: isDev ? 'TotalRisk DEVELOPMENT VERSION' : 'TotalRisk',
    fullscreen: riskSettings.fullScreen,
    show: false,
    icon: 'icon.ico'
  })

  win.on('closed', () => {
    win = null;
  })

  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = win.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  })

  win.once('ready-to-show', () => {
    win.webContents.setZoomFactor(screenConfig.zoomFactor)
    win.show()
    autoUpdater.checkForUpdatesAndNotify();
  })

  if (isDev) {
    globalShortcut.register('f5', function() {
      console.log('F5 was pressed, refreshing window.')
      win.reload()
    })
    //win.webContents.openDevTools()
  }
  win.webContents.openDevTools()

  win.setMenu(null);

  win.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);

  return win;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});
function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
app.on('ready', function() {
  autoUpdater.checkForUpdatesAndNotify();
  createDefaultWindow();
  autoUpdater.checkForUpdatesAndNotify();
});
app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});