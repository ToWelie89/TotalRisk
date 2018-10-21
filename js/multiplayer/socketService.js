export default class SocketService {
    constructor() {
    }

    createSocket(url, port) {
        if (!url || !port) {
            return;
        }

        this.socket = io.connect(`${url}:${port}`);

        this.socket.on('connected', () => {
            if (url === 'http://127.0.0.1') {
                console.log('You are now hosting!');
            } else {
                console.log('You are connected to host ' + url);
            }
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
