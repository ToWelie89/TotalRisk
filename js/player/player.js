import {PLAYER_TYPES} from './playerConstants';

export default class Player {
    constructor(name, color, avatar, type = PLAYER_TYPES.HUMAN) {
        this.name = name;
        this.color = color;
        this.avatar = avatar;
        this.cards = [];
        this.type = type;
    }
}
