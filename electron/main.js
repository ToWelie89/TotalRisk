const { MESSAGE_TYPES, ERROR_TYPES } = require('./../js/autoUpdating/updaterConstants');

const electron = require('electron');
const {app, BrowserWindow, Menu, protocol, ipcMain, globalShortcut} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');
const path = require('path');
const url = require('url');

const Store = require('./../js/settings/electronStore.js');
const ElectronSettings = require('./../js/settings/electronDefaultSettings.js');

let win;
const store = new Store({
  configName: 'user-preferences',
  defaults: ElectronSettings
});


// LOGGING
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';

// PROXY

const getProxyDetails = proxy => {
  // Remove quote symbols from start and finish
  if (proxy[0] === '"') {
    proxy = proxy.substring(1, proxy.length)
  }
  if (proxy[proxy.length - 1] === '"') {
    proxy = proxy.substring(0, proxy.length - 1)
  }

  proxy = proxy.replace('http://', '');
  const proxyParts = proxy.split('@');
  const credentials = proxyParts[0].split(':');
  const host = `http://${proxyParts[1]}`;
  const username = credentials[0];
  const password = credentials[1];

  return {
    host,
    username,
    password
  }
}

const proxyFromSettings = store.get('proxySettings');
let proxyFromEnvironment = process.env.http_proxy ? process.env.http_proxy : '';
proxyFromEnvironment = process.env.proxy ? process.env.proxy : proxyFromEnvironment;

let proxyToUse;

if (proxyFromSettings && proxyFromSettings.host) {
  proxyToUse = proxyFromSettings;
} else if (proxyFromEnvironment) {
  proxyToUse = getProxyDetails(proxyFromEnvironment);
}

const proxyExists = proxyToUse && proxyToUse.host && proxyToUse.username && proxyToUse.password;
const proxySettings = proxyToUse;

console.log('proxyToUse', proxyToUse)

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
