exports = module.exports = (io) => {
    let lobbiesSocketList = [];
    let lobbies = [];

    this.updatePlayersInRoom = (roomId, amountOfPlayers) => {
        lobbies.find(lobby => lobby.id === roomId).currentNumberOfPlayers = amountOfPlayers;
        lobbiesSocketList.forEach(s => {
            s.emit('currentLobbies', lobbies);
        });
    }

    io
    .of('lobbies')
    .on('connection', (socket) => {
        lobbiesSocketList.push(socket);

        socket.emit('currentLobbies', lobbies);

        socket.on('createNewRoom', newRoom => {
            lobbies.push(newRoom);
            lobbiesSocketList.forEach(s => {
                s.emit('currentLobbies', lobbies);
            });
            socket.emit('createNewRoomResponse', newRoom);
        });

        socket.on('setMaxNumberOfPlayers', (maxAmount, roomId) => {
            lobbies.find(lobby => lobby.id === roomId).maxNumberOfPlayer = maxAmount;
            lobbiesSocketList.forEach(s => {
                s.emit('currentLobbies', lobbies);
            });
        });
    });
}