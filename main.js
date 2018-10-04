// This is free and unencumbered software released into the public domain.
// See LICENSE for details

const electron = require('electron');
const {app, BrowserWindow, Menu, protocol, ipcMain, globalShortcut} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const path = require('path');
const url = require('url');

const Store = require('./js/settings/electronStore.js');
const ElectronSettings = require('./js/settings/electronDefaultSettings.js');

let win;
const store = new Store({
  configName: 'user-preferences',
  defaults: ElectronSettings
});
const proxySettings = store.get('proxySettings');
const proxyExists = proxySettings && proxySettings.host && proxySettings.username && proxySettings.password;

// LOGGING
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';

const sendStatusToWindow = (text, type = 'message') => {
  log.info(text);
  win.webContents.send(type, text);
}

log.info('App starting...');

// Fix for audio bug
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.on('login', (event, webContents, request, authInfo, callback) => {
    callback(
      proxyExists ? proxySettings.username : '',
      proxyExists ? proxySettings.password : ''
    );
});

// Create window here
const createDefaultWindow = () => {
  const isDev = process.env.NODE_ENV === 'dev';

  let windowBounds = store.get('windowBounds');
  let riskSettings = store.get('riskSettings');

  const mainScreen = electron.screen.getPrimaryDisplay();
  let screenConfig;

  if (mainScreen.bounds.width <= 1920) { // Full-HD or smaller
    console.log('Screen witdh equal or smaller than 1920')
    screenConfig = {
      zoomFactor: 0.85,
      minWidth: 1340,
      minHeight: 1000
    }
  } else if (mainScreen.bounds.width > 1920 && mainScreen.bounds.width <= 2560) { // Larger than Full-HD up to QHD
    console.log('Screen witdh larger than 1920 and equal or smaller than 2560')
    screenConfig = {
      zoomFactor: 0.9,
      minWidth: 1480,
      minHeight: 1290
    }
  } else if (mainScreen.bounds.width > 2560) { // Larger than QHD
    console.log('Screen witdh larger than 2560')
    screenConfig = {
      zoomFactor: 1.1,
      minWidth: 1480,
      minHeight: 1340
    }
  } else { // Screen bounds could not be identified
    screenConfig = {
      zoomFactor: 1,
      minWidth: 1280,
      minHeight: 760
    }
  }

  let width = windowBounds ? windowBounds.width : screenConfig.minWidth;
  let height = windowBounds ? windowBounds.height : screenConfig.minHeight;

  win = new BrowserWindow({
    width: width,
    height: height,
    minWidth: screenConfig.minWidth,
    minHeight: screenConfig.minHeight,
    title: isDev ? 'TotalRisk DEVELOPMENT VERSION' : 'TotalRisk',
    fullscreen: riskSettings.fullScreen,
    show: false,
    icon: 'icon.ico',
    webPreferences: {
      zoomFactor: screenConfig.zoomFactor
    }
  });

  win.on('closed', () => {
    win = null;
  });

  win.on('resize', () => {
    // Save window size to settings
    let { width, height } = win.getBounds();
    store.set('windowBounds', { width, height });
  });

  win.once('ready-to-show', () => {
    win.webContents.setZoomFactor(screenConfig.zoomFactor)
    win.show()
    autoUpdater.checkForUpdatesAndNotify();
    sendStatusToWindow('ERR_CONNECTION_TIMED_OUT', 'error');
  })

  if (isDev) {
    globalShortcut.register('f5', () => {
      console.log('F5 was pressed, refreshing window.')
      win.reload();
    })
    //win.webContents.openDevTools();
  }

  win.webContents.openDevTools();
  win.setMenu(null);

  win.webContents.session.setProxy({ proxyRules: proxyExists ? proxySettings.host : '' }, () => {
    win.loadURL(`file://${__dirname}/index.html`);
  });
}

// Auto updater events

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  const errorMessage = err == null ? "unknown" : (err.stack || err).toString();
  sendStatusToWindow(errorMessage, 'error');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

// Create app

app.on('ready', () => {
  createDefaultWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});