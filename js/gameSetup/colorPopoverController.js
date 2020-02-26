const {PLAYER_COLORS} = require('./../player/playerConstants');

class ColorPopoverController {
    constructor() {
        this.vm = this;
        this.vm.init = this.init;
    }

    init(player) {
        this.vm.colors = Array.from(Object.keys(PLAYER_COLORS).map((key) => PLAYER_COLORS[key]));
        this.vm.player = player;
    }
}

module.exports = ColorPopoverController;