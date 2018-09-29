const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const Store = require('./../js/settings/electronStore.js');

const ElectronSettings = require('./../js/settings/electronDefaultSettings.js');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');


// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const globalShortcut = electron.globalShortcut

function createWindow () {
  const isDev = process.env.NODE_ENV === 'dev';

  const store = new Store({
    configName: 'user-preferences',
    defaults: ElectronSettings
  });

  let { width, height } = store.get('windowBounds');
  let riskSettings = store.get('riskSettings');

  const screen = electron.screen
  const mainScreen = screen.getPrimaryDisplay();
  let screenConfig;

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

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: screenConfig.minWidth,
    minHeight: screenConfig.minHeight,
    title: isDev ? 'TotalRisk DEVELOPMENT VERSION' : 'TotalRisk',
    fullscreen: riskSettings.fullScreen,
    show: false,
    icon: 'electron/assets/icon.ico'
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.setZoomFactor(screenConfig.zoomFactor)
    mainWindow.show()
  })

  if (isDev) {
    globalShortcut.register('f5', function() {
      console.log('F5 was pressed, refreshing window.')
      mainWindow.reload()
    })
    mainWindow.webContents.openDevTools()
  }

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.