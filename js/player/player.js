import {PLAYER_TYPES, AI_VALUES} from './playerConstants';

export default class Player {
    constructor(name, color, avatar, type = PLAYER_TYPES.HUMAN) {
        this.name = name;
        this.color = color;
        this.avatar = avatar;
        this.cards = [];
        this.type = type;

        this.aiValues = AI_VALUES;
    }
}
