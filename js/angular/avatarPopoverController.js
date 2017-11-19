import {avatars} from './../player/playerConstants';

export default class AvatarPopoverController {
    constructor($scope, $sce) {
        this.vm = this;
        this.$sce = $sce;

        this.vm.init = this.init;
        this.vm.getNameOfAvatar = this.getNameOfAvatar;
        this.vm.mouseLeave = this.mouseLeave;
        this.vm.mouseEnter = this.mouseEnter;

        this.vm.bioText = '';
        this.vm.avatarName = '';
        this.vm.avatarFlag = '';
    }

    init(player) {
        this.vm.avatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
        this.vm.player = player;
    }

    getNameOfAvatar(avatar) {
        return Object.entries(avatars).find(a => a[1] === avatar)[0];
    }

    mouseLeave() {
        this.vm.bioText = '';
        this.vm.avatarName = '';
        this.vm.avatarFlag = '';
        this.vm.avatarPortrait = '';
    }

    mouseEnter(avatar) {
        this.vm.bioText = avatar.biography ? avatar.biography : '';
        this.$sce.trustAsHtml(this.vm.bioText);

        this.vm.avatarName = this.getNameOfAvatar(avatar);
        this.vm.avatarFlag = avatar.flag ? avatar.flag : '';
        this.vm.avatarPortrait = avatar.picture;
    }
}
