import {GAME_PHASES} from './../gameConstants';

export default class CharacterCreatorController {

    constructor($scope, $rootScope, settings, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.vm.settings = settings;
        this.soundService = soundService;

        this.vm.characters = settings.characters;
        this.vm.name = '';
        this.vm.selectedCharacterId = undefined;
        this.vm.showEditor = false;

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

        $(document).ready(() => {
            this.vm.currentSelection.forEach(part => {
                if (part.type === 'skinTone') {
                    part.maxChoices = this.skinTones.length;
                    this.applySkinTone();
                } else {
                    part.maxChoices = $(`#editorSvgContainer svg g[category=${part.type}] > g`).length;
                    $(`#editorSvgContainer svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                    $(`#editorSvgContainer svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
                }
            });

            this.loadSavedCharacterPortraits();
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
    }

    loadSavedCharacterPortraits() {
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

                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="hat"] > g:nth-child(${character.hat})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="head"] > g:nth-child(${character.head})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyebrows"] > g:nth-child(${character.eyebrows})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="eyes"] > g:nth-child(${character.eyes})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="nose"] > g:nth-child(${character.nose})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="mouth"] > g:nth-child(${character.mouth})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="torso"] > g:nth-child(${character.torso})`).css('visibility', 'visible');
                $(`.existingCharactersContainer__item__inner[character="${id}"] svg g[category="legs"] > g:nth-child(${character.legs})`).css('visibility', 'visible');

                $(`.existingCharactersContainer__item__inner[character="${id}"] svg .skinTone`).css('fill', this.skinTones[character.skinTone - 1]);
            }
        });
    }

    applySkinTone() {
        $('#editorSvgContainer svg .skinTone').css('fill', this.skinTones[this.vm.currentSelection.find(x => x.type === 'skinTone').selection - 1]);
    }

    previousPart(type) {
        this.soundService.tick.play();

        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection--;
        if (part.selection === 0) {
            part.selection = part.maxChoices;
        }

        if (type === 'skinTone') {
            this.applySkinTone();
        } else {
            $(`#editorSvgContainer svg g[category="${type}"] > g`).css('visibility', 'hidden');
            $(`#editorSvgContainer svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
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
            this.applySkinTone();
        } else {
            $(`#editorSvgContainer svg g[category="${type}"] > g`).css('visibility', 'hidden');
            $(`#editorSvgContainer svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        }

        this.adjustSvgOffset();
    }

    randomize() {
        this.soundService.tick.play();

        this.vm.currentSelection.forEach(part => {
            part.selection = Math.floor(Math.random() * part.maxChoices) + 1 ;

            if (part.type === 'skinTone') {
                this.applySkinTone();
            } else {
                $(`#editorSvgContainer svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`#editorSvgContainer svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
            }
        });
        this.adjustSvgOffset();
    }

    saveCharacter() {
        this.soundService.tick.play();

        if (!this.vm.selectedCharacterId) {
            // Create new character
            const id = this.generateId();
            this.vm.settings.characters.push({
                id,
                name: this.vm.name,
                hat: this.vm.currentSelection.find(x => x.type === 'hat').selection,
                head: this.vm.currentSelection.find(x => x.type === 'head').selection,
                eyebrows: this.vm.currentSelection.find(x => x.type === 'eyebrows').selection,
                eyes: this.vm.currentSelection.find(x => x.type === 'eyes').selection,
                nose: this.vm.currentSelection.find(x => x.type === 'nose').selection,
                mouth: this.vm.currentSelection.find(x => x.type === 'mouth').selection,
                torso: this.vm.currentSelection.find(x => x.type === 'torso').selection,
                legs: this.vm.currentSelection.find(x => x.type === 'legs').selection,
                skinTone: this.vm.currentSelection.find(x => x.type === 'skinTone').selection
            });
            this.vm.selectedCharacterId = id;
        } else {
            // Update existing character
            const character = this.vm.characters.find(x => x.id === this.vm.selectedCharacterId);
            character.name = this.vm.name;
            character.hat = this.vm.currentSelection.find(x => x.type === 'hat').selection;
            character.head = this.vm.currentSelection.find(x => x.type === 'head').selection;
            character.eyebrows = this.vm.currentSelection.find(x => x.type === 'eyebrows').selection;
            character.eyes = this.vm.currentSelection.find(x => x.type === 'eyes').selection;
            character.nose = this.vm.currentSelection.find(x => x.type === 'nose').selection;
            character.mouth = this.vm.currentSelection.find(x => x.type === 'mouth').selection;
            character.torso = this.vm.currentSelection.find(x => x.type === 'torso').selection;
            character.legs = this.vm.currentSelection.find(x => x.type === 'legs').selection;
            character.skinTone = this.vm.currentSelection.find(x => x.type === 'skinTone').selection;
        }

        this.vm.settings.saveSettings();
        this.vm.characters = this.vm.settings.characters;

        setTimeout(() => {
            this.loadSavedCharacterPortraits();
        }, 50);
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    selectCharacter(character) {
        this.soundService.tick.play();

        this.vm.selectedCharacterId = character.id;
        this.vm.name = character.name;
        this.vm.currentSelection.find(x => x.type === 'hat').selection = character.hat;
        this.vm.currentSelection.find(x => x.type === 'head').selection = character.head;
        this.vm.currentSelection.find(x => x.type === 'eyebrows').selection = character.eyebrows;
        this.vm.currentSelection.find(x => x.type === 'eyes').selection = character.eyes;
        this.vm.currentSelection.find(x => x.type === 'nose').selection = character.nose;
        this.vm.currentSelection.find(x => x.type === 'mouth').selection = character.mouth;
        this.vm.currentSelection.find(x => x.type === 'torso').selection = character.torso;
        this.vm.currentSelection.find(x => x.type === 'legs').selection = character.legs;
        this.vm.currentSelection.find(x => x.type === 'skinTone').selection = character.skinTone;

        this.vm.currentSelection.forEach(part => {
            if (part.type !== 'skinTone') {
                part.maxChoices = $(`#editorSvgContainer svg g[category=${part.type}] > g`).length;
                $(`#editorSvgContainer svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`#editorSvgContainer svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
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
        this.vm.currentSelection.forEach(part => {
            part.selection = 1;
            if (part.type !== 'skinTone') {
                part.maxChoices = $(`#editorSvgContainer svg g[category=${part.type}] > g`).length;
                $(`#editorSvgContainer svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`#editorSvgContainer svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
            } else {
                part.maxChoices = this.skinTones.length;
                this.applySkinTone();
            }
        });
        this.vm.name = '';
        this.vm.selectedCharacterId = undefined;
        this.adjustSvgOffset();
    }

    deleteCharacter() {
        this.soundService.tick.play();

        this.vm.settings.characters = this.vm.settings.characters.filter(x => x.id !== this.vm.selectedCharacterId);
        this.vm.characters = this.vm.settings.characters;
        this.vm.settings.saveSettings();
        this.createNewCharacter();

        setTimeout(() => {
            this.loadSavedCharacterPortraits();
        }, 50);
    }

    adjustSvgOffset() {
        /*$('#editorSvgContainer').css('margin-top', '0px');

        const mainDiv = document.querySelector('#characterEditor #mainDiv').getBoundingClientRect();
        const mainDivTopOffset = mainDiv.top;

        const currentHatIndex = this.vm.currentSelection.find(x => x.type === 'hat').selection;
        const hatElementTopOffset = document.querySelector(`svg g[category="hat"] > g:nth-child(${currentHatIndex})`).getBoundingClientRect().top;

        const offset = Math.round(mainDivTopOffset - hatElementTopOffset);

        $('#editorSvgContainer').css('margin-top', `${offset}px`);*/
    }
}
