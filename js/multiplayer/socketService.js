const io = require('socket.io-client');
const endpoint = 'https://totalconquest.herokuapp.com';

class SocketService {
    constructor() {
        this.lobbiesSocket = undefined;
        this.gameSocket = undefined;
    }

    createLobbiesSocket() {
        this.lobbiesSocket = io.connect(`${endpoint}/lobbies`, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    createGameSocket() {
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