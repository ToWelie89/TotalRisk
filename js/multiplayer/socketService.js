import io from 'socket.io-client';

export default class SocketService {
    constructor() {
    }

    createSocket(url, port, roomId, userUid) {
        if (!url || !port) {
            return;
        }

        this.socket = io.connect(`${url}:${port}`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connected', () => {
            if (url === 'http://127.0.0.1') {
                console.log('You are now hosting!');
            } else {
                console.log('You are connected to host ' + url);
            }

            this.socket.emit('addUserToRoom', roomId, userUid);
        });
    }

    sendMessage(sender, message, timestamp, roomId) {
        this.socket.emit('sendMessage', roomId, {
            sender,
            message,
            timestamp
        });
    }
}
