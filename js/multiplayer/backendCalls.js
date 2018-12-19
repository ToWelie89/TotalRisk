const playerCanJoinRoom = (userUid, lobbyId, successCallback, failCallback) => {
    $.post({
        'async': true,
        'crossDomain': true,
        'url': 'http://localhost:5000/lobbies/playerCanJoinRoom',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        'data': {
            'userUid': userUid,
            'lobbyId': lobbyId
        }
    }).done(response => {
        console.log('playerCanJoinRoom response', response);
        successCallback(response);
    }).fail(() => {
        failCallback();
    });
}

module.exports = { playerCanJoinRoom };