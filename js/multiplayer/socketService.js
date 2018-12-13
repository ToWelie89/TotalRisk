const io = require('socket.io-client');

class SocketService {
    constructor() {
        this.lobbiesSocket = undefined;
        this.gameSocket = undefined;
    }

    createLobbiesSocket() {
        this.lobbiesSocket = io.connect(`http://127.0.0.1:5000/lobbies`, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    createGameSocket() {
        this.gameSocket = io.connect(`http://127.0.0.1:5000/game`, {transports: ['websocket', 'polling', 'flashsocket']});
    }

    disconnectLobbiesSocket() {
        this.lobbiesSocket.disconnect();
        this.lobbiesSocket = undefined;
    }

    disconnectGameSocket() {
        this.gameSocket.disconnect();
        this.gameSocket = undefined;
    }
}

module.exports = SocketService;