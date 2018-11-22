const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const {GAME_PHASES} = require('./../gameConstants');
const {startGlobalLoading, stopGlobalLoading, getRandomInteger} = require('./../helpers');
const {flags} = require('./editorConstants');

class CharacterCreatorController {

    constructor($scope, $rootScope, soundService, toastService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.soundService = soundService;
        this.toastService = toastService;

        this.vm.name = '';
        this.vm.selectedCharacterId = undefined;
        this.vm.showEditor = false;

        this.vm.flags = flags;
        this.vm.selectedFlag = flags[0];

        this.vm.currentSelection = [{
            type: 'hat',
            displayName: 'Headgear',
            selection: 1
        },{
            type: 'head',
            displayName: 'Head',
            selection: 1
        },{
            type: 'eyebrows',
            displayName: 'Eyebrows',
            selection: 1
        },{
            type: 'eyes',
            displayName: 'Eyes',
            selection: 1
        },{
            type: 'nose',
            displayName: 'Nose',
            selection: 1
        },{
            type: 'mouth',
            displayName: 'Mouth',
            selection: 1
        },{
            type: 'torso',
            displayName: 'Torso',
            selection: 1
        },{
            type: 'legs',
            displayName: 'Legs',
            selection: 1
        },{
            type: 'skinTone',
            displayName: 'Skintone',
            selection: 1
        }];

        this.skinTones = [
            '#facdd0',
            '#fee2e3',
            '#ecafb3',
            '#d79b78',
            '#a6775b',
            '#7d5137'
        ];

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.vm.isAuthenticated = true;
                this.vm.showEditor = false;
                const user = firebase.auth().currentUser;

                firebase.database().ref('users/' + user.uid).on('value', snapshot => {
                    const user = snapshot.val();
                    if (user && user.characters) {
                        this.vm.characters = snapshot.val().characters;
                        setTimeout(() => {
                            this.$scope.$apply();
                            this.loadSavedCharacterPortraits();
                        }, 200);
                    } else {
                        this.vm.characters = [];
                    }
                });
            } else {
                this.vm.isAuthenticated = false;
                this.vm.showEditor = false;
                this.vm.characters = [];
            }
        });

        $(document).ready(() => {
            this.vm.currentSelection.forEach(part => {
                if (part.type === 'skinTone') {
                    part.maxChoices = this.skinTones.length;
                    this.applySkinTone();
                } else {
                    part.maxChoices = $(`#editorCustomCharacterMain svg g[category=${part.type}] > g`).length;
                    part.selectedPartId = $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).first().attr('name');

                    $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                    $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g[name="${part.selectedPartId}"]`).first().css('visibility', 'visible');
                }
            });
        });

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.CHARACTER_CREATOR) {
                this.vm.selectedCharacterId = undefined;
                this.vm.showEditor = false;
            }
        });

        this.vm.previousPart = this.previousPart;
        this.vm.nextPart = this.nextPart;
        this.vm.randomize = this.randomize;
        this.vm.saveCharacter = this.saveCharacter;
        this.vm.createNewCharacter = this.createNewCharacter;
        this.vm.selectFlag = this.selectFlag;
    }

    selectFlag(flag) {
        this.soundService.tick.play();
        this.vm.selectedFlag = flag;
    }

    loadSavedCharacterPortraits() {
        setTimeout(() => {
            document.querySelectorAll('.existingCharactersContainer__item__inner').forEach(characterBox => {
                const id = characterBox.getAttribute('character');

                if (characterBox.querySelector('svg')) {
                    characterBox.querySelector('svg').setAttribute('viewBox', '120 20 400 400');

                    const character = this.vm.characters.find(x => x.id === id);

                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="hat"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="head"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyebrows"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyes"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="nose"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="mouth"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="torso"] > g`).css('visibility', 'hidden');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="legs"] > g`).css('visibility', 'hidden');

                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="hat"] > g[name="${character.hat}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="head"] > g[name="${character.head}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyebrows"] > g[name="${character.eyebrows}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyes"] > g[name="${character.eyes}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="nose"] > g[name="${character.nose}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="mouth"] > g[name="${character.mouth}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="torso"] > g[name="${character.torso}"]`).css('visibility', 'visible');
                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="legs"] > g[name="${character.legs}"]`).css('visibility', 'visible');

                    $(`.existingCharactersContainer__item__inner[character="${id}"] svg .skinTone`).css('fill', character.skinTone);

                    this.vm.selectedFlag = character.flag;
                }
            });
        }, 10);
    }

    applySkinTone() {
        $('#editorCustomCharacterMain svg .skinTone').css('fill', this.vm.currentSelection.find(x => x.type === 'skinTone').selectedPartId);
    }

    previousPart(type) {
        this.soundService.tick.play();

        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection--;
        if (part.selection === 0) {
            part.selection = part.maxChoices;
        }

        if (type === 'skinTone') {
            part.selectedPartId = this.skinTones[part.selection - 1];
            this.applySkinTone();
        } else {
            part.selectedPartId = $(`#editorCustomCharacterMain svg g[category="${type}"] > g`).get(part.selection - 1).getAttribute('name');
            $(`#editorCustomCharacterMain svg g[category="${type}"] > g`).css('visibility', 'hidden');
            $(`#editorCustomCharacterMain svg g[category="${type}"] > g[name="${part.selectedPartId}"]`).css('visibility', 'visible');
        }

        this.adjustSvgOffset();
    }

    nextPart(type) {
        this.soundService.tick.play();

        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection++;
        if (part.selection > part.maxChoices) {
            part.selection = 1;
        }

        if (type === 'skinTone') {
            part.selectedPartId = this.skinTones[part.selection - 1];
            this.applySkinTone();
        } else {
            part.selectedPartId = $(`#editorCustomCharacterMain svg g[category="${type}"] > g`).get(part.selection - 1).getAttribute('name');
            $(`#editorCustomCharacterMain svg g[category="${type}"] > g`).css('visibility', 'hidden');
            $(`#editorCustomCharacterMain svg g[category="${type}"] > g[name="${part.selectedPartId}"]`).css('visibility', 'visible');
        }

        this.adjustSvgOffset();
    }

    randomize() {
        this.soundService.tick.play();
        this.vm.selectedFlag = flags[getRandomInteger(0, (flags.length - 1))];
        this.vm.currentSelection.forEach(part => {
            part.selection = Math.floor(Math.random() * part.maxChoices) + 1 ;

            if (part.type === 'skinTone') {
                part.selectedPartId = this.skinTones[part.selection - 1];
                this.applySkinTone();
            } else {
                part.selectedPartId = $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).get(part.selection - 1).getAttribute('name');
                $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g[name="${part.selectedPartId}"]`).css('visibility', 'visible');
            }
        });
        this.adjustSvgOffset();
    }

    saveCharacter() {
        this.soundService.tick.play();

        let userCharacters;

        const user = firebase.auth().currentUser;

        startGlobalLoading();

        firebase.database().ref('/users/' + user.uid).once('value').then(snapshot => {
            const user = snapshot.val();
            userCharacters = user && user.characters ? user.characters : [];
        })
        .then(() => {
            if (!this.vm.selectedCharacterId) {
                const id = this.generateId();
                this.vm.selectedCharacterId = id;
                userCharacters.push({
                    id,
                    name: this.vm.name,
                    hat: this.vm.currentSelection.find(x => x.type === 'hat').selectedPartId,
                    head: this.vm.currentSelection.find(x => x.type === 'head').selectedPartId,
                    eyebrows: this.vm.currentSelection.find(x => x.type === 'eyebrows').selectedPartId,
                    eyes: this.vm.currentSelection.find(x => x.type === 'eyes').selectedPartId,
                    nose: this.vm.currentSelection.find(x => x.type === 'nose').selectedPartId,
                    mouth: this.vm.currentSelection.find(x => x.type === 'mouth').selectedPartId,
                    torso: this.vm.currentSelection.find(x => x.type === 'torso').selectedPartId,
                    legs: this.vm.currentSelection.find(x => x.type === 'legs').selectedPartId,
                    skinTone: this.vm.currentSelection.find(x => x.type === 'skinTone').selectedPartId,
                    flag: this.vm.selectedFlag
                });
            } else {
                const character = userCharacters.find(x => x.id === this.vm.selectedCharacterId);
                character.name = this.vm.name;
                character.hat = this.vm.currentSelection.find(x => x.type === 'hat').selectedPartId;
                character.head = this.vm.currentSelection.find(x => x.type === 'head').selectedPartId;
                character.eyebrows = this.vm.currentSelection.find(x => x.type === 'eyebrows').selectedPartId;
                character.eyes = this.vm.currentSelection.find(x => x.type === 'eyes').selectedPartId;
                character.nose = this.vm.currentSelection.find(x => x.type === 'nose').selectedPartId;
                character.mouth = this.vm.currentSelection.find(x => x.type === 'mouth').selectedPartId;
                character.torso = this.vm.currentSelection.find(x => x.type === 'torso').selectedPartId;
                character.legs = this.vm.currentSelection.find(x => x.type === 'legs').selectedPartId;
                character.skinTone = this.vm.currentSelection.find(x => x.type === 'skinTone').selectedPartId;
                character.flag = this.vm.selectedFlag;
            }
        })
        .then(() => {
            return firebase.database().ref('users/' + user.uid).set({
                characters: userCharacters
            });
        })
        .then(() => {
            stopGlobalLoading();
            this.toastService.successToast(
                'Character saved!',
                ' '
            );
            this.vm.characters = userCharacters;
            setTimeout(() => {
                this.selectCharacter(this.vm.characters.find(x => x.id === this.vm.selectedCharacterId));
                this.loadSavedCharacterPortraits();
            }, 200);
        })
        .catch(err => {
            stopGlobalLoading();
            this.toastService.errorToast(
                'Save failed',
                ' '
            );
        });
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    selectCharacter(character) {
        this.soundService.tick.play();

        this.vm.selectedCharacterId = character.id;
        this.vm.name = character.name;
        this.vm.selectedFlag = character.flag;
        this.vm.currentSelection.find(x => x.type === 'hat').selectedPartId = character.hat;
        this.vm.currentSelection.find(x => x.type === 'head').selectedPartId = character.head;
        this.vm.currentSelection.find(x => x.type === 'eyebrows').selectedPartId = character.eyebrows;
        this.vm.currentSelection.find(x => x.type === 'eyes').selectedPartId = character.eyes;
        this.vm.currentSelection.find(x => x.type === 'nose').selectedPartId = character.nose;
        this.vm.currentSelection.find(x => x.type === 'mouth').selectedPartId = character.mouth;
        this.vm.currentSelection.find(x => x.type === 'torso').selectedPartId = character.torso;
        this.vm.currentSelection.find(x => x.type === 'legs').selectedPartId = character.legs;
        this.vm.currentSelection.find(x => x.type === 'skinTone').selectedPartId = character.skinTone;

        this.vm.currentSelection.forEach(part => {
            if (part.type !== 'skinTone') {
                const selectedPart = $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g[name="${part.selectedPartId}"]`);
                part.maxChoices = $(`#editorCustomCharacterMain svg g[category=${part.type}] > g`).length;
                part.selection = $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).index(selectedPart) + 1;
                $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                selectedPart.css('visibility', 'visible');
            } else {
                part.maxChoices = this.skinTones.length;
                this.applySkinTone();
            }
        });

        this.vm.showEditor = true;

        this.adjustSvgOffset();
    }

    createNewCharacter() {
        this.soundService.tick.play();

        this.vm.showEditor = true;
        this.vm.name = '';
        this.vm.currentSelection.forEach(part => {
            part.selection = 1;
            if (part.type !== 'skinTone') {
                part.maxChoices = $(`#editorCustomCharacterMain svg g[category=${part.type}] > g`).length;
                part.selectedPartId = $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).first().attr('name');
                $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`#editorCustomCharacterMain svg g[category="${part.type}"] > g[name="${part.selectedPartId}"]`).css('visibility', 'visible');
            } else {
                part.maxChoices = this.skinTones.length;
                part.selectedPartId = this.skinTones[part.selection];
                this.applySkinTone();
            }
        });
        this.vm.name = '';
        this.vm.selectedCharacterId = undefined;
        this.vm.selectedFlag = flags[0];
        setTimeout(() => {
            this.$scope.$apply();
        }, 1);
        this.adjustSvgOffset();
    }

    deleteCharacter() {
        this.soundService.tick.play();

        startGlobalLoading();

        let userCharacters;

        const user = firebase.auth().currentUser;

        firebase.database().ref('/users/' + user.uid).once('value').then(snapshot => {
            const user = snapshot.val();
            userCharacters = user && user.characters ? user.characters : [];
            userCharacters = userCharacters.filter(x => x.id !== this.vm.selectedCharacterId);
        })
        .then(() => {
            return firebase.database().ref('users/' + user.uid).set({
                characters: userCharacters
            });
        })
        .then(() => {
            stopGlobalLoading();
            this.toastService.successToast(
                'Character deleted!',
                ' '
            );
            this.vm.characters = userCharacters;
            setTimeout(() => {
                if (this.vm.characters.length > 0) {
                    this.createNewCharacter();
                    this.loadSavedCharacterPortraits();
                } else {
                    this.vm.showEditor = false;
                    this.$scope.$apply();
                }
            }, 200);
        })
        .catch(err => {
            stopGlobalLoading();
            this.toastService.errorToast(
                'Deletion failed',
                ' '
            );
        });
    }

    adjustSvgOffset() {
        /*$('#editorCustomCharacterMain').css('margin-top', '0px');

        const mainDiv = document.querySelector('#characterEditor #mainDiv').getBoundingClientRect();
        const mainDivTopOffset = mainDiv.top;

        const currentHatIndex = this.vm.currentSelection.find(x => x.type === 'hat').selection;
        const hatElementTopOffset = document.querySelector(`svg g[category="hat"] > g:nth-child(${currentHatIndex})`).getBoundingClientRect().top;

        const offset = Math.round(mainDivTopOffset - hatElementTopOffset);

        $('#editorCustomCharacterMain').css('margin-top', `${offset}px`);*/
    }
}

module.exports = CharacterCreatorController;