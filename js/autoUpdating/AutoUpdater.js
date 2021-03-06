const { MESSAGE_TYPES, ERROR_TYPES } = require('./updaterConstants');
const { runningElectron } = require('./../helpers');

class AutoUpdater {
    constructor() {
        window.state = {
            currentStateInternal: {},
            aListener: function(val) {},
            set currentState(val) {
                this.currentStateInternal = val;
                if (this.currentStateListener) {
                    this.currentStateListener(val);
                }
            },
            get currentState() {
                return this.currentStateInternal;
            },
            registerListener: function(listener) {
                this.currentStateListener = listener;
            }
        };

        if (runningElectron() && ipcRenderer) {
            ipcRenderer.on('message', function(event, { state, data }) {
                if (state === MESSAGE_TYPES.CHECKING_FOR_UPDATES) {
                    console.log('Checking for updates');
                } else if (state === MESSAGE_TYPES.NEW_UPDATE_AVAILABLE) {
                    console.log('New update available');
                } else if (state === MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE) {
                    console.log('No new updates available');
                } else if (state === MESSAGE_TYPES.UPDATE_DOWNLOADING) {
                    console.log('Downloading new update', data);
                } else if (state === MESSAGE_TYPES.UPDATE_DOWNLOADED) {
                    console.log('Downloaded new update');
                }
                console.log('New state', state);
                window.state.currentState = { state, data };
            });

            ipcRenderer.on('error', function(event, error) {
                console.log(error);
                if (error.state.indexOf('ERR_CONNECTION_TIMED_OUT') !== -1) {
                    console.log('Internet connection problem');
                    window.state.currentState = { state: ERROR_TYPES.CONNECTION_TIMED_OUT, data: {} };
                } else if (error.state.indexOf('Cannot parse releases feed') !== -1) {
                    console.log('No releases exists');
                    window.state.currentState = { state: ERROR_TYPES.NO_RELEASES_COULD_BE_FETCHED, data: {} };
                } else {
                    console.log('Unknown problem');
                    window.state.currentState = { state: ERROR_TYPES.UNKNOWN, data: {} };
                }
            });
        }
    }
}

module.exports = AutoUpdater;