export const PLAYER_COLORS = {
    RED: {
        name: 'Red',
        mainColor: '#EF5C5C',
        borderColor: '#CC3030'
    },
    GREEN: {
        name: 'Green',
        mainColor: '#92F381',
        borderColor: '#53E239'
    },
    BLUE: {
        name: 'Blue',
        mainColor: '#3333ff',
        borderColor: '#1a1a9c'
    }
}
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
            } else {
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
            }
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