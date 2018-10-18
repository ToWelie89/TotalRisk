export default class SocketService {
    constructor() {
        this.connectedToIo = false;
    }

    createSocket(url, port) {
        if (!url || !port || this.connectedToIo) {
            return;
        }
        this.socket = io.connect(`${url}:${port}`);
        this.connectedToIo = true;

        this.socket.on('messagesUpdated', (messages) => {
          //console.log(`${name}: ${msg}`);
          console.log(messages);
        });

        /*setInterval(function(){
            socket.emit('updateView', {
                name,
                position: {
                    x: Math.random(),
                    y: Math.random()
                }
            });
        }, 2000);*/
    }

    sendMessage(msg) {
        this.socket.emit('sendMessage', msg);
    }

    getMyIp() {
        /*return fetch('https://api.ipify.org/?format=json')
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            return myJson.ip;
          });*/
    }
}
