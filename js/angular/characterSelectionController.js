import {avatars} from './../player/playerConstants';

export default class CharacterSelectionController {
    constructor($scope, $uibModalInstance, currentSelectedPlayer, selectedPlayers) {
        this.vm = this;

        this.vm.currentSelectedPlayer = currentSelectedPlayer;
        this.vm.selectedPlayers = selectedPlayers;
        this.vm.avatars = avatars;

        console.log('current selected player', this.vm.currentSelectedPlayer);

        // PUBLIC FIELDS

        $('.mainWrapper').css('filter', 'blur(5px)');
        $('.mainWrapper').css('-webkit-filter', 'blur(5px)');
    }
}
