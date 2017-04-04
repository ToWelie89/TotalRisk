import {avatars} from './../player/playerConstants';

export default class AvatarPopoverController {
    constructor($scope) {
        this.vm = this;
        this.vm.init = this.init;
    }

    init(player) {
        this.vm.avatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
        this.vm.player = player;
    }
}
