export default class CharacterCreatorController {

    constructor($scope) {
        this.vm = this;
        this.$scope = $scope;

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

        this.vm.previousPart = this.previousPart;
        this.vm.nextPart = this.nextPart;
        this.vm.randomize = this.randomize;
    }

    previousPart(type) {
        $(`svg g[category="${type}"] > g`).css('visibility', 'hidden');
        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection--;
        if (part.selection === 0) {
            part.selection = part.maxChoices;
        }
        $(`svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
    }

    nextPart(type) {
        $(`svg g[category="${type}"] > g`).css('visibility', 'hidden');
        const part = this.vm.currentSelection.find(x => x.type === type);
        part.selection++;
        if (part.selection > part.maxChoices) {
            part.selection = 1;
        }
        $(`svg g[category="${type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
    }

    randomize() {
        this.vm.currentSelection.forEach(part => {
            part.selection = Math.floor(Math.random() * part.maxChoices) + 1 ;
            $(`svg g[category="${part.type}"] > g`).css('visibility', 'hidden');
            $(`svg g[category="${part.type}"] > g:nth-child(${part.selection})`).css('visibility', 'visible');
        });
    }
}
