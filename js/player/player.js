const {PLAYER_TYPES, AI_VALUES} = require('./playerConstants');

class Player {
    constructor(name, color, avatar, type = PLAYER_TYPES.HUMAN, userUid = undefined, isHost = undefined, attackerDice = undefined, attackerDiceLabel = undefined) {
        this.name = name;
        this.color = color;
        this.avatar = avatar;
        this.cards = [];
        this.type = type;
        this.userUid = userUid;
        this.isHost = isHost;
        this.attackerDice = attackerDice;
        this.attackerDiceLabel = attackerDiceLabel;

        this.aiValues = AI_VALUES;

        this.statistics = {
            battlesWon: 0,
            battlesLost: 0,
            troopsKilled: 0,
            troopsLost: 0,
            totalReinforcements: 0,
            cardCombinationsUsed: 0,
            retreats: 0
        };
    }
}

module.exports = Player;