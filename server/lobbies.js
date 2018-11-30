exports = module.exports = (io) => {
    let socketList = [];
    let lobbies = [];

    io
    .of('lobbies')
    .on('connection', (socket) => {
        socket.emit('currentLobbies', lobbies);

        socket.on('createNewRoom', newRoom => {
            lobbies.push(newRoom);
            socketList.forEach(s => {
                s.emit('currentLobbies', lobbies);
            });
            socket.emit('createNewRoomResponse', newRoom);
        });
    });
}