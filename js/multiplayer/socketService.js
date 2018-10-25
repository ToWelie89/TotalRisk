import io from 'socket.io-client';
import firebase from 'firebase/app';

export default class SocketService {
    constructor() {
    }

    createSocket(url, port, roomId, userUid, userName) {
        if (!url || !port) {
            return;
        }

        this.socket = io.connect(`${url}:${port}`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connected', () => {
            const isHost = (url === 'http://127.0.0.1');
            if (isHost) {
                console.log('You are now hosting!');
            } else {
                console.log('You are connected to host ' + url);
            }
            const uid = firebase.auth().currentUser.uid;
            this.socket.emit('setUserAndRoom', uid, roomId, isHost);
            this.sendMessage('SERVER', `${userName} connected to the room`, Date.now(), roomId);
        });
    }

    sendMessage(sender, message, timestamp, roomId) {
        this.socket.emit('sendMessage', roomId, {
            sender,
            message,
            timestamp
        });
    }

    leaveLobby(roomId, userName) {
        //this.socket.emit('disconnect');
        this.sendMessage('SERVER', `${userName} left the room`, Date.now(), roomId);
        this.socket.disconnect();
    }
}
