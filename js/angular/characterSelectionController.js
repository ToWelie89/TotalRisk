import {avatars} from './../player/playerConstants';

export default class CharacterSelectionController {
    constructor($scope, $uibModalInstance, currentSelectedPlayer, selectedPlayers) {
        this.vm = this;
        this.$uibModalInstance = $uibModalInstance;

        this.vm.currentSelectedPlayer = currentSelectedPlayer ? Object.assign({}, currentSelectedPlayer) : null;
        this.vm.oldAvatar = currentSelectedPlayer ? currentSelectedPlayer.avatar : null;
        this.vm.selectedPlayers = selectedPlayers;
        this.vm.avatars = avatars;
        this.vm.selectAvatar = this.selectAvatar;
        this.vm.ok = this.ok;
        this.vm.selectAvatarAndClose = this.selectAvatarAndClose;

        this.vm.takenAvatars = selectedPlayers.map(x => x.avatar);

        console.log('current selected player', this.vm.currentSelectedPlayer);

        // PUBLIC FIELDS

        $('.mainWrapper').css('filter', 'blur(5px)');
        $('.mainWrapper').css('-webkit-filter', 'blur(5px)');

        setTimeout(() => {
            if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar.svg) {
                $('#selectedCharacterSvg').load(this.vm.currentSelectedPlayer.avatar.svg);
            }
        }, 50);
    }

    selectAvatar(avatar) {
        if (this.vm.takenAvatars.includes(avatar) && avatar !== this.oldAvatar) {
            return;
        }

        if (this.vm.currentSelectedPlayer === null) {
            this.vm.currentSelectedPlayer = {
                avatar,
                name: Object.entries(avatars).find(x => x[1] === avatar)[0]
            }
        } else {
            this.vm.currentSelectedPlayer.name = Object.entries(avatars).find(x => x[1] === avatar)[0];
            this.vm.currentSelectedPlayer.avatar = avatar;
        }

        if (this.vm.currentSelectedPlayer.avatar.svg) {
            $('#selectedCharacterSvg').load(this.vm.currentSelectedPlayer.avatar.svg);
        }
    }

    selectAvatarAndClose(avatar) {
        if (this.vm.takenAvatars.includes(avatar) && avatar !== this.oldAvatar) {
            return;
        }

        this.selectAvatar(avatar);
        this.ok();
    }

    ok() {
        this.$uibModalInstance.close({
            avatar: this.vm.currentSelectedPlayer.avatar,
            name: this.vm.currentSelectedPlayer.name
        });
    }
}
