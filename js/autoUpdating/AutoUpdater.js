export default class AutoUpdater {
    constructor() {
        this.proxyError = false;

        ipcRenderer.on('message', function(event, text) {
            console.log(text);
        });

        ipcRenderer.on('error', function(event, error) {
            console.log(error);
            if (error.indexOf('ERR_CONNECTION_TIMED_OUT') !== -1) {
                console.log('Proxy problem');
                this.proxyError = true;
            }
        });
    }
}