import {PLAYER_COLORS} from './../player/playerConstants';

export function ColorPopoverController($scope, $log, $sce) {
    var vm = this;

    vm.init = init;

    function init(player) {
        vm.colors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));
        vm.player = player;
        vm.templateUrl = 'src/popoverTemplate.html';
    }
}
