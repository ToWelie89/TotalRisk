const rootPath = 'https://totalconquest.herokuapp.com';

const playerCanJoinRoom = (userUid, lobbyId, successCallback, failCallback) => {
    $.post({
        'async': true,
        'crossDomain': true,
        'url': `${rootPath}/lobbies/playerCanJoinRoom`,
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
};

const ping = (successCallback, failCallback) => {
    const time = Date.now();
    $.post({
        'async': true,
        'crossDomain': true,
        'url': `${rootPath}/lobbies/ping`,
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        'data': {
            'timestamp': Date.now()
        }
    }).done(() => {
        successCallback(Date.now() - time);
    }).fail(() => {
        failCallback();
    });
};

const getUserCountry = () => {
    return new Promise((resolve, reject) => {
        $.get('http://ip-api.com/json/').done(response => {
            resolve(response);
        }).fail(() => {
            reject();
        });
    });
};

module.exports = { playerCanJoinRoom, getUserCountry, ping };