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

const PLAYER_PREDEFINED_NAMES = [
    'Julius Caesar',
    'Napoleon Bonaparte',
    'Hannibal Barca',
    'Alexander the Great',
    'Genghis Khan',
    'Attila the Hun'
];

const playerIterator = (playerMap, turnPhases) => {
    let currentPlayerIndex = 0;
    let currentTurnPhaseIndex = 0;
    let newPlayer = true;

    return {
        next: function() {
            if ((currentTurnPhaseIndex + 1) < turnPhases.length) {
                let turn = turnPhases[currentTurnPhaseIndex++];
                let player = playerMap[currentPlayerIndex];
                newPlayer = false;
                return {
                    player: player[1],
                    turnPhase: turn,
                    done: false,
                    newPlayer
                };
            }
            currentTurnPhaseIndex = 0;
            let turn = turnPhases[currentTurnPhaseIndex];
            let player = playerMap[currentPlayerIndex];
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
        getCurrent: function() {
            return {
                player: playerMap[currentPlayerIndex][1],
                turnPhase: turnPhases[currentTurnPhaseIndex],
                done: false,
                newPlayer
            };
        }
    };
}

export {PLAYER_COLORS, PLAYER_PREDEFINED_NAMES, playerIterator};
