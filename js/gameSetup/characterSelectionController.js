import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {avatars} from './../player/playerConstants';
import {objectsAreEqual, arrayIncludesObject, getRandomColor, loadSvgIntoDiv} from './../helpers';

export default class CharacterSelectionController {
    constructor($scope, $uibModalInstance, socketService, currentSelectedPlayer, selectedPlayers) {
        this.vm = this;
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.socketService = socketService;

        this.vm.currentSelectedPlayer = currentSelectedPlayer ? Object.assign({}, currentSelectedPlayer) : null;
        this.vm.oldAvatar = currentSelectedPlayer ? currentSelectedPlayer.avatar : null;
        this.vm.selectedPlayers = selectedPlayers.filter(x => x !== undefined);
        this.vm.avatars = avatars;
        this.vm.selectAvatar = this.selectAvatar;
        this.vm.ok = this.ok;
        this.vm.selectAvatarAndClose = this.selectAvatarAndClose;
        this.vm.avatarIsSelected = this.avatarIsSelected;
        this.vm.avatarIsTaken = this.avatarIsTaken;

        if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.userName) {
            this.vm.currentSelectedPlayer.name = this.vm.currentSelectedPlayer.userName;
        }

        this.vm.takenAvatars = this.vm.selectedPlayers.map(x => x.avatar);

        console.log('current selected player', this.vm.currentSelectedPlayer);

        // PUBLIC FIELDS

        $('.mainWrapper').css('filter', 'blur(5px)');
        $('.mainWrapper').css('-webkit-filter', 'blur(5px)');

        setTimeout(() => {
            if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar.svg) {
                loadSvgIntoDiv(this.vm.currentSelectedPlayer.avatar.svg, '#selectedCharacterSvg');
            }
        }, 50);

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                firebase.database().ref('users/' + user.uid).on('value', snapshot => {
                    const user = snapshot.val();
                    if (user && user.characters) {
                        user.characters.forEach(c => {
                            this.vm.avatars[c.name] = c;
                            this.vm.avatars[c.name].customCharacter = true;
                            this.vm.avatars[c.name].bgColor = getRandomColor();
                        });
                    }
                    setTimeout(() => {
                        this.loadSavedCharacterPortraits();
                    }, 50);
                });
            }
        });

        if (this.socketService.socket) { // Is multiplayer game
            this.socketService.socket.on('updatedPlayers', players => {
                this.vm.selectedPlayers = players.filter(x => x !== undefined);
                this.vm.takenAvatars = this.vm.selectedPlayers.map(x => x.avatar);
                this.$scope.$apply();
            });
        }
    }

    loadSavedCharacterPortraits() {
        document.querySelectorAll('.selectableAvatars__item').forEach(characterBox => {
            if (characterBox.querySelector('div[character]')) {
                const avatarId = characterBox.querySelector('div[character]').getAttribute('character');
                characterBox.querySelector('svg').setAttribute('viewBox', '120 20 400 400');
                characterBox.querySelector('svg').setAttribute('xmlns', 'http://www.w3.org/2000/svg'+Math.random());
                characterBox.querySelector('svg').setAttribute('xmlns:bx', 'https://boxy-svg.com'+Math.random());

                if (characterBox.querySelector('svg')) {
                    const character = Object.values(this.vm.avatars).find(x => x.id === avatarId);

                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="hat"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="head"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="eyes"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="nose"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="mouth"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="torso"] > g`).css('visibility', 'hidden');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="legs"] > g`).css('visibility', 'hidden');

                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="hat"] > g[name="${character.hat}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="head"] > g[name="${character.head}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="eyebrows"] > g[name="${character.eyebrows}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="eyes"] > g[name="${character.eyes}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="nose"] > g[name="${character.nose}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="mouth"] > g[name="${character.mouth}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="torso"] > g[name="${character.torso}"]`).css('visibility', 'visible');
                    $(`.selectableAvatars__item div[character="${avatarId}"] svg g[category="legs"] > g[name="${character.legs}"]`).css('visibility', 'visible');

                    $(`.selectableAvatars__item div[character="${avatarId}"] svg .skinTone`).css('fill', character.skinTone);
                }
            }
        });
    }

    avatarIsSelected(avatar) {
        return objectsAreEqual(avatar, this.vm.currentSelectedPlayer ? this.vm.currentSelectedPlayer.avatar : {});
    }

    avatarIsTaken(avatar) {
        return arrayIncludesObject(this.vm.takenAvatars, avatar) && !objectsAreEqual(avatar, this.vm.oldAvatar ? this.vm.oldAvatar : {});
    }

    selectAvatar(avatar) {
        if (this.avatarIsTaken(avatar)) {
            return;
        }

        if (this.vm.currentSelectedPlayer === null) {
            this.vm.currentSelectedPlayer = {
                avatar,
                name: Object.entries(avatars).find(x => x[1] === avatar)[0]
            }
        } else {
            if (!this.vm.currentSelectedPlayer.userName) {
                this.vm.currentSelectedPlayer.name = Object.entries(avatars).find(x => x[1] === avatar)[0];
            }
            this.vm.currentSelectedPlayer.avatar = avatar;
        }

        if (this.vm.currentSelectedPlayer.avatar.svg) {
            loadSvgIntoDiv(this.vm.currentSelectedPlayer.avatar.svg, '#selectedCharacterSvg');
        } else if (this.vm.currentSelectedPlayer.avatar.customCharacter) {
            loadSvgIntoDiv('assets/avatarSvg/custom.svg', '#selectedCharacterSvg', () => {
                const character = Object.values(this.vm.avatars).find(x => x.id === this.vm.currentSelectedPlayer.avatar.id);

                $(`#selectedCharacterSvg svg g[category="hat"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="head"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="eyes"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="eyebrows"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="nose"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="mouth"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="torso"] > g`).css('visibility', 'hidden');
                $(`#selectedCharacterSvg svg g[category="legs"] > g`).css('visibility', 'hidden');

                $(`#selectedCharacterSvg svg g[category="hat"] > g[name="${character.hat}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="head"] > g[name="${character.head}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="eyebrows"] > g[name="${character.eyebrows}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="eyes"] > g[name="${character.eyes}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="nose"] > g[name="${character.nose}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="mouth"] > g[name="${character.mouth}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="torso"] > g[name="${character.torso}"]`).css('visibility', 'visible');
                $(`#selectedCharacterSvg svg g[category="legs"] > g[name="${character.legs}"]`).css('visibility', 'visible');

                $(`#selectedCharacterSvg svg .skinTone`).css('fill', character.skinTone);
            });
        }

        $('#characterSelectionFlag .flag-element').css('background-image', `url("${this.vm.currentSelectedPlayer.avatar.flag}")`)
    }

    selectAvatarAndClose(avatar) {
        if (this.avatarIsTaken(avatar)) {
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
