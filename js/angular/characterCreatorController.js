import {GAME_PHASES} from './../gameConstants';

export default class CharacterCreatorController {

    constructor($scope, $rootScope, settings) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.vm.settings = settings;
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
        }];

        $(document).ready(() => {
            this.vm.currentSelection.forEach(part => {
                part.maxChoices = $(`svg g[category=${part.type}] > g`).length;
                $(`svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
                $(`svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
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
    }

    previousPart(type) {
        $(`svg g[category="${type}"] > g`).css('visibility', 'hidden');
        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection--;
        if (part.selection === 0) {
            part.selection = part.maxChoices;
        }
        $(`svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        this.adjustSvgOffset();
    }

    nextPart(type) {
        $(`svg g[category="${type}"] > g`).css('visibility', 'hidden');
        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection++;
        if (part.selection > part.maxChoices) {
            part.selection = 1;
        }
        $(`svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        this.adjustSvgOffset();
    }

    randomize() {
        this.vm.currentSelection.forEach(part => {
            part.selection = Math.floor(Math.random() * part.maxChoices) + 1 ;
            $(`svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
            $(`svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        });
        this.adjustSvgOffset();
    }

    saveCharacter() {
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
                torso: this.vm.currentSelection.find(x => x.type === 'torso').selection
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
        }

        this.vm.settings.saveSettings();
        this.vm.characters = this.vm.settings.characters;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    selectCharacter(character) {
        this.vm.selectedCharacterId = character.id;
        this.vm.name = character.name;
        this.vm.currentSelection.find(x => x.type === 'hat').selection = character.hat;
        this.vm.currentSelection.find(x => x.type === 'head').selection = character.head;
        this.vm.currentSelection.find(x => x.type === 'eyebrows').selection = character.eyebrows;
        this.vm.currentSelection.find(x => x.type === 'eyes').selection = character.eyes;
        this.vm.currentSelection.find(x => x.type === 'nose').selection = character.nose;
        this.vm.currentSelection.find(x => x.type === 'mouth').selection = character.mouth;
        this.vm.currentSelection.find(x => x.type === 'torso').selection = character.torso;

        this.vm.currentSelection.forEach(part => {
            part.maxChoices = $(`svg g[category=${part.type}] > g`).length;
            $(`svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
            $(`svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        });

        this.vm.showEditor = true;

        this.adjustSvgOffset();
    }

    createNewCharacter() {
        this.vm.showEditor = true;
        this.vm.currentSelection.forEach(part => {
            part.selection = 1;
            part.maxChoices = $(`svg g[category=${part.type}] > g`).length;
            $(`svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
            $(`svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        });
        this.vm.name = '';
        this.vm.selectedCharacterId = undefined;
        this.adjustSvgOffset();
    }

    deleteCharacter() {
        this.vm.settings.characters = this.vm.settings.characters.filter(x => x.id !== this.vm.selectedCharacterId);
        this.vm.characters = this.vm.settings.characters;
        this.vm.settings.saveSettings();
        this.createNewCharacter();
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
