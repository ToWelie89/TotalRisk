import { MESSAGE_TYPES, ERROR_TYPES } from './../js/autoUpdating/updaterConstants';

import electron from 'electron';
import {app, BrowserWindow, Menu, protocol, ipcMain, globalShortcut} from 'electron';
import log from 'electron-log';
import {autoUpdater} from 'electron-updater';
import path from 'path';
import url from 'url';

import Store from './../js/settings/electronStore.js';
import ElectronSettings from './../js/settings/electronDefaultSettings.js';

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

const sendStatusToWindow = (state, type = 'message', data = {}) => {
  log.info(state, data);
  win.webContents.send(type, { state, data });
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
  const isDev = process.env.NODE_ENV === 'electron';

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
    /*minWidth: screenConfig.minWidth,
    minHeight: screenConfig.minHeight,*/
    minWidth: 50,
    minHeight: 50,
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

    if (isDev) {
      sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES)
      setTimeout(() => {
        sendStatusToWindow(MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE);
      }, 500)

      /*sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES)
      setTimeout(() => {
        sendStatusToWindow(ERROR_TYPES.CONNECTION_TIMED_OUT);
      }, 1000)*/

      /*sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES)
      setTimeout(() => {
        sendStatusToWindow(ERROR_TYPES.UNKNOWN);
      }, 1000)*/
    }

    //sendStatusToWindow('ERR_CONNECTION_TIMED_OUT', 'error');

    // Test GUI for download patch flow

    /*sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES)
    setTimeout(() => {
      sendStatusToWindow(MESSAGE_TYPES.NEW_UPDATE_AVAILABLE);
      setTimeout(() => {
        sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADING, 'message', { bytesPerSecond: 100000, percent: 3, transferred: '3 Mb', total: '100 Mb' });
        setTimeout(() => {
          sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADING, 'message', { bytesPerSecond: 120000, percent: 20, transferred: '20 Mb', total: '100 Mb' });
          setTimeout(() => {
            sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADING, 'message', { bytesPerSecond: 103000, percent: 85, transferred: '85 Mb', total: '100 Mb' });
            setTimeout(() => {
              sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADING, 'message', { bytesPerSecond: 99000, percent: 99, transferred: '99 Mb', total: '100 Mb' });
              setTimeout(() => {
                sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADED);
              }, 1500)
            }, 1500)
          }, 1500)
        }, 1500)
      }, 1500)
    }, 1500)*/
  })

  if (isDev) {
    globalShortcut.register('f5', () => {
      console.log('F5 was pressed, refreshing window.')
      win.reload();

      sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES)
      setTimeout(() => {
        sendStatusToWindow(MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE);
      }, 1500)
    })
    //win.webContents.openDevTools();
  }

  win.webContents.openDevTools();

  win.setMenu(null);

  win.webContents.session.setProxy({ proxyRules: proxyExists ? proxySettings.host : '' }, () => {
    win.loadURL(`file://${__dirname}/../index.html`);
  });
}

// Auto updater events
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow(MESSAGE_TYPES.CHECKING_FOR_UPDATES);
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow(MESSAGE_TYPES.NEW_UPDATE_AVAILABLE);
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow(MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE);
});

autoUpdater.on('error', (err) => {
  const errorMessage = err == null ? "unknown" : (err.stack || err).toString();
  sendStatusToWindow(errorMessage, 'error');
});

autoUpdater.on('download-progress', (progressObj) => {
  sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADING, 'message', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow(MESSAGE_TYPES.UPDATE_DOWNLOADED);
});

// Create app
app.on('ready', () => {
  createDefaultWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

require('./socket');
