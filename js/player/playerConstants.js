const PLAYER_COLORS = {
    RED: {
        name: 'Red',
        mainColor: '#dd4444',
        borderColor: '#b22525',
        highlightColor: '#fe8c8c'
    },
    GREEN: {
        name: 'Green',
        mainColor: '#4acd61',
        borderColor: '#35a749',
        highlightColor: '#caf6c2'
    },
    BLUE: {
        name: 'Blue',
        mainColor: '#4770ea',
        borderColor: '#234abe',
        highlightColor: '#7272fa'
    },
    PINK: {
        name: 'Pink',
        mainColor: '#ff99cc',
        borderColor: '#ff6699',
        highlightColor: '#ffc9e4'
    },
    BLACK: {
        name: 'Black',
        mainColor: '#564848',
        borderColor: '#362d2d',
        highlightColor: '#525252'
    },
    YELLOW: {
        name: 'Yellow',
        mainColor: '#eaea67',
        borderColor: '#bbbb42',
        highlightColor: '#ffffae'
    }
};

const avatars = {
    'Julius Caesar': {
        picture: 'http://www.bbc.co.uk/staticarchive/837022b3d9ba8c0664db08d3ab4f16e15a73a683.jpg',
        selectSound: ''
    },
    'Napoleon Bonaparte': {
        picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Napoleon_-_2.jpg/170px-Napoleon_-_2.jpg',
        selectSound: ''
    },
    'Hannibal Barca': {
        picture: 'http://www.leadershipgeeks.com/wp-content/uploads/hannibal-239x300.jpg',
        selectSound: ''
    },
    'Alexander the Great': {
        picture: 'http://blog.oup.com/wp-content/uploads/2014/01/Alexander-the-Great.jpg',
        selectSound: ''
    },
    'Genghis Khan': {
        picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/YuanEmperorAlbumGenghisPortrait.jpg/468px-YuanEmperorAlbumGenghisPortrait.jpg',
        selectSound: ''
    },
    'Attila the Hun': {
        picture: 'http://historythings.com/wp-content/uploads/2016/08/things-you-didn-t-know-about-attila-the-hun-u1.jpg',
        selectSound: ''
    }
};

const playerIterator = (playerMap, turnPhases) => {
    let currentPlayerIndex = 0;
    let currentTurnPhaseIndex = 0;
    let newPlayer = true;

    return {
        next: () => {
            if ((currentTurnPhaseIndex + 1) < turnPhases.length) {
                const turn = turnPhases[currentTurnPhaseIndex++];
                const player = playerMap[currentPlayerIndex];
                newPlayer = false;
                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer
                };
            }
            currentTurnPhaseIndex = 0;
            const turn = turnPhases[currentTurnPhaseIndex];
            const player = playerMap[currentPlayerIndex];
            newPlayer = true;

            if ((currentPlayerIndex + 1) < (playerMap.length)) {
                currentPlayerIndex++;
            } else {
                currentPlayerIndex = 0;
            }
            return {
                player: player[1],
                turnPhase: turn,
                done: false,
                newPlayer
            };
        },
        getCurrent: () => {
            return {
                player: playerMap[currentPlayerIndex][1],
                turnPhase: turnPhases[currentTurnPhaseIndex],
                done: false,
                newPlayer
            };
        }
    };
};

export {PLAYER_COLORS, playerIterator, avatars};
