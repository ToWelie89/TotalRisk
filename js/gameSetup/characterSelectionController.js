require('firebase/app');
require('firebase/auth');
require('firebase/database');
const {avatars} = require('./../player/playerConstants');
const {objectsAreEqual, arrayIncludesObject, loadSvgIntoDiv, loadCustomCharacterSvgIntoDiv} = require('./../helpers');

class CharacterSelectionController {
    constructor($scope, $uibModalInstance, currentSelectedPlayer, selectedPlayers, multiplayer, customCharacters, socketService, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.socketService = socketService;
        this.soundService = soundService;

        this.vm.currentSelectedPlayer = currentSelectedPlayer ? Object.assign({}, currentSelectedPlayer) : null;
        this.vm.oldAvatar = currentSelectedPlayer ? currentSelectedPlayer.avatar : null;
        this.vm.selectedPlayers = selectedPlayers.filter(x => x !== undefined);
        this.vm.customCharacters = customCharacters || [];
        this.multiplayer = multiplayer;
        this.vm.avatars = avatars;
        this.vm.selectAvatar = this.selectAvatar;
        this.vm.ok = this.ok;
        this.vm.cancel = this.cancel;
        this.vm.selectAvatarAndClose = this.selectAvatarAndClose;
        this.vm.avatarIsSelected = this.avatarIsSelected;
        this.vm.avatarIsTaken = this.avatarIsTaken;
        this.vm.loadingCharacters = true;

        if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar) {
            this.vm.currentSelectedPlayer.name = this.vm.currentSelectedPlayer.avatar.displayName;
        }

        this.vm.takenAvatars = this.vm.selectedPlayers.map(x => x.avatar);

        // PUBLIC FIELDS

        $('.mainWrapper').css('filter', 'blur(5px)');
        $('.mainWrapper').css('-webkit-filter', 'blur(5px)');

        console.log('BALLE', this.vm.currentSelectedPlayer)

        if (!this.vm.currentSelectedPlayer || !this.vm.currentSelectedPlayer.avatar) {
            const backgroundToSelect = './assets/avatarBackgrounds/default.svg';
            loadSvgIntoDiv(backgroundToSelect, '#characterSelectionModal__background');
            this.currentBackground = backgroundToSelect;
        }

        setTimeout(() => {
            $('.selectableAvatars').css('opacity', '0');
            if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar && this.vm.currentSelectedPlayer.avatar.svg) {
                this.selectAvatar(this.vm.currentSelectedPlayer.avatar, true);
            } else if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar && this.vm.currentSelectedPlayer.avatar.customCharacter) {
                loadCustomCharacterSvgIntoDiv('assets/avatarSvg/custom.svg', '#selectedCharacterSvg', this.vm.currentSelectedPlayer.avatar, () => {
                    $('#selectedCharacterSvg svg .skinTone').css('fill', this.vm.currentSelectedPlayer.avatar.skinTone);

                    const backgroundToSelect = './assets/avatarBackgrounds/default.svg';
                    loadSvgIntoDiv(backgroundToSelect, '#characterSelectionModal__background');
                    this.currentBackground = backgroundToSelect;
                    this.vm.currentSelectedPlayer.name = this.vm.currentSelectedPlayer.avatar.name;

                    $('#selectedCharacterSvg').animate({
                        opacity: '1'
                    }, 200);
                });
            }
        }, 50);

        if (this.vm.customCharacters && this.vm.customCharacters.length > 0) {
            this.vm.customCharacters.forEach(c => {
                this.vm.avatars[c.name] = c;
                this.vm.avatars[c.name].customCharacter = true;
            });
            setTimeout(() => {
                // Must fix this
                this.loadSavedCharacterPortraits(() => {
                    $('.selectableAvatars').animate({
                        opacity: 1
                    }, 300);
                });
            }, 900);
        } else {
            setTimeout(() => {
                $('.selectableAvatars').animate({
                    opacity: 1
                }, 300);
            }, 500);
        }

        if (this.multiplayer) { // Is multiplayer game
            this.socketService.setGameListener('updatedPlayers', players => {
                this.vm.selectedPlayers = players.filter(x => x !== undefined);
                this.vm.takenAvatars = this.vm.selectedPlayers.map(x => x.avatar);
                this.$scope.$apply();
            });
        }
    }

    loadSavedCharacterPortraits(callback) {
        document.querySelectorAll('.selectableAvatars__item').forEach(characterBox => {
            if (characterBox.querySelector('div[character]')) {
                const avatarId = characterBox.querySelector('div[character]').getAttribute('character');
                characterBox.querySelector('svg').setAttribute('viewBox', '127 10 398 400');
                characterBox.querySelector('svg').setAttribute('xmlns', 'http://www.w3.org/2000/svg'+Math.random());
                characterBox.querySelector('svg').setAttribute('xmlns:bx', 'https://boxy-svg.com'+Math.random());

                if (characterBox.querySelector('svg')) {
                    console.log(avatarId, this.vm.avatars);
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
        this.vm.loadingCharacters = false;
        this.$scope.$apply();
        callback();
    }

    avatarIsSelected(avatar) {
        if (avatar.customCharacter) {
            if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar && this.vm.currentSelectedPlayer.avatar.customCharacter) {
                return (this.vm.currentSelectedPlayer.avatar.id === avatar.id);
            } else {
                return false;
            }
        } else {
            return objectsAreEqual(avatar, this.vm.currentSelectedPlayer ? this.vm.currentSelectedPlayer.avatar : {});
        }
    }

    avatarIsTaken(avatar) {
        if (avatar.customCharacter) {
            const currentAvatar = this.vm.takenAvatars.find(a => a.id === avatar.id);
            return (currentAvatar !== undefined);
        } else {
            return arrayIncludesObject(this.vm.takenAvatars, avatar) && !objectsAreEqual(avatar, this.vm.oldAvatar ? this.vm.oldAvatar : {});
        }
    }

    selectAvatar(avatar, initialLoad = false) {
        if (this.avatarIsTaken(avatar)) {
            this.soundService.denied.play();
            return;
        }

        if (this.vm.currentSelectedPlayer && this.vm.currentSelectedPlayer.avatar && this.vm.currentSelectedPlayer.avatar.id === avatar.id && !initialLoad) {
            return;
        }

        this.soundService.tick.play();

        if (this.vm.currentSelectedPlayer === null) {
            this.vm.currentSelectedPlayer = {
                avatar,
                name: Object.entries(avatars).find(x => x[1] === avatar)[0]
            };
        } else {
            this.vm.currentSelectedPlayer.name = avatar.displayName || avatar.name;
            this.vm.currentSelectedPlayer.avatar = avatar;
        }

        if (this.vm.currentSelectedPlayer.avatar.svg) {
            loadSvgIntoDiv(this.vm.currentSelectedPlayer.avatar.svg, '#selectedCharacterSvg');
        } else if (this.vm.currentSelectedPlayer.avatar.customCharacter) {
            $('#selectedCharacterSvg').css('opacity', '0');
            loadCustomCharacterSvgIntoDiv('assets/avatarSvg/custom.svg', '#selectedCharacterSvg', this.vm.currentSelectedPlayer.avatar, () => {
                $('#selectedCharacterSvg svg .skinTone').css('fill', this.vm.currentSelectedPlayer.avatar.skinTone);
                $('#selectedCharacterSvg').animate({
                    opacity: '1'
                }, 200);
            });
        }

        $('#characterSelectionFlag .flag-element').css('background-image', `url("${this.vm.currentSelectedPlayer.avatar.flag}")`);

        const backgroundToSelect = this.vm.currentSelectedPlayer.avatar.backgroundSvg || './assets/avatarBackgrounds/default.svg';
        if (this.currentBackground !== backgroundToSelect) {
            loadSvgIntoDiv(backgroundToSelect, '#characterSelectionModal__background');
            this.currentBackground = backgroundToSelect;
        }
    }

    selectAvatarAndClose(avatar) {
        if (this.avatarIsTaken(avatar)) {
            this.soundService.denied.play();
            return;
        }

        this.soundService.tick.play();

        this.selectAvatar(avatar);
        this.ok();
    }

    cancel() {
        this.$uibModalInstance.close({
            cancel: true
        });
    }

    ok() {
        this.$uibModalInstance.close({
            avatar: this.vm.currentSelectedPlayer.avatar,
            name: this.vm.currentSelectedPlayer.name
        });
    }
}

module.exports = CharacterSelectionController;