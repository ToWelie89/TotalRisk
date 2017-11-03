import {avatars} from './../player/playerConstants';

export default class AvatarPopoverController {
    constructor($scope) {
        this.vm = this;
        this.vm.init = this.init;
        this.vm.getNameOfAvatar = this.getNameOfAvatar;
    }

    init(player) {
        this.vm.avatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
        this.vm.player = player;
    }

    getNameOfAvatar(avatar) {
        return Object.entries(avatars).find(a => a[1] === avatar)[0];
    }
}
