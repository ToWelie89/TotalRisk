exports = module.exports = (io) => {
    let socketList = [];
    let lobbies = [];

    this.updatePlayersInRoom = (roomId, amountOfPlayers) => {
        lobbies.find(lobby => lobby.id === roomId).currentNumberOfPlayers = amountOfPlayers;
        socketList.forEach(s => {
            s.emit('currentLobbies', lobbies);
        });
    }

    io
    .of('lobbies')
    .on('connection', (socket) => {
        socketList.push(socket);

        socket.emit('currentLobbies', lobbies);

        socket.on('createNewRoom', newRoom => {
            lobbies.push(newRoom);
            socketList.forEach(s => {
                s.emit('currentLobbies', lobbies);
            });
            socket.emit('createNewRoomResponse', newRoom);
        });

        socket.on('setMaxNumberOfPlayers', (maxAmount, roomId) => {
            lobbies.find(lobby => lobby.id === roomId).maxNumberOfPlayer = maxAmount;
            socketList.forEach(s => {
                s.emit('currentLobbies', lobbies);
            });
        });
    });
}