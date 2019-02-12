const {PLAYER_TYPES} = require('./../player/playerConstants');

class PlayerTypePopoverController {
    constructor() {
        this.vm = this;
        this.vm.init = this.init;
        this.vm.getTypeName = this.getTypeName;
    }

    init(player) {
        this.vm.types = Array.from(Object.keys(PLAYER_TYPES).map((key, index) => PLAYER_TYPES[key]));
        this.vm.player = player;
    }

    getTypeName(type) {
        switch(type) {
        case PLAYER_TYPES.HUMAN:
            return 'Human';
        case PLAYER_TYPES.AI:
            return 'AI';
        }
    }
}

module.exports = PlayerTypePopoverController;