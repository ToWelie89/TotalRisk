export const PLAYER_COLORS = {
    RED: {
        name: 'Red',
        mainColor: '#EF5C5C',
        borderColor: '#CC3030',
        highlightColor: '#fe8c8c'
    },
    GREEN: {
        name: 'Green',
        mainColor: '#92F381',
        borderColor: '#53E239',
        highlightColor: '#caf6c2'
    },
    BLUE: {
        name: 'Blue',
        mainColor: '#3333ff',
        borderColor: '#1a1a9c',
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
        mainColor: '#3c3c3c',
        borderColor: '#202020',
        highlightColor: '#525252'
    },
    YELLOW: {
        name: 'Yellow',
        mainColor: '#ffff66',
        borderColor: '#dbdb39',
        highlightColor: '#ffffae'
    }
};

export const PLAYER_PREDEFINED_NAMES = [
    'Julius Caesar',
    'Napoleon Bonaparte',
    'Hannibal Barca',
    'Alexander the Great',
    'Genghis Khan',
    'Attila the Hun'
];

export function playerIterator(playerMap, turnPhases) {
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
                    newPlayer: newPlayer
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
                newPlayer: newPlayer
            };
        },
        getCurrent: function() {
            return {
                player: playerMap[currentPlayerIndex][1],
                turnPhase: turnPhases[currentTurnPhaseIndex],
                done: false,
                newPlayer: newPlayer
            };
        }
    };
}
