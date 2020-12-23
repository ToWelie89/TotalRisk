const io = require('socket.io-client');
const endpoint = 'https://totalconquest.herokuapp.com';

class SocketService {
    constructor() {
        this.lobbiesSocket = undefined;
        this.gameSocket = undefined;
    }

    createLobbiesSocket() {
        electronLog.info('Attempting to connect to lobbies socket', `${endpoint}/lobbies`);
        this.lobbiesSocket = io.connect(`${endpoint}/lobbies`, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    createGameSocket() {
        electronLog.info('Attempting to connect to game socket', `${endpoint}/game`);
        this.gameSocket = io.connect(`${endpoint}/game`, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    disconnectLobbiesSocket() {
        this.lobbiesSocket.disconnect();
        this.lobbiesSocket = undefined;
    }

    disconnectGameSocket() {
        if (this.gameSocket) {
            this.gameSocket.emit('disconnect');
            this.gameSocket.disconnect();
            this.gameSocket = undefined;
        }
    }
}

module.exports = SocketService;