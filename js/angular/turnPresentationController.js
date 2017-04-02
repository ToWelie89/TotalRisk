import { delay } from './../helpers';
import {TURN_PHASES} from './../gameConstants';
import { MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING } from './../gameConstants';

export function TurnPresentationController($scope, $rootScope, gameAnnouncerService, gameEngine) {
    var vm = this;

    // PUBLIC FIELDS
    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.turn;
    vm.troopsToDeploy;

    function show() {
        $('#turnPresentationModal').velocity('transition.bounceLeftIn');
        $('#turnPresentationModal').modal('toggle');
    }

    function hide() {
        $('#turnPresentationModal').modal('toggle');
    }

    function presentTurnSilently() {
        new Promise((resolve, reject) => {
            show(vm.turn);
            resolve();
        }).then(() => delay(2000))
        .then(() => {
            hide();
        });
    }

    function setupEvents() {
        $rootScope.$on('turnPresenterStartGame', function(event, data) {
            vm.turn = gameEngine.turn;
            vm.troopsToDeploy = new Array(gameEngine.troopsToDeploy);

            if (gameEngine.playSound) {
                show(vm.turn);
                gameAnnouncerService.speak('Game started', () => {
                    gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    gameAnnouncerService.stateTurn(vm.turn, () => {
                        gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }, () => {
                        gameEngine.setMusicVolume(1.0);
                        hide();
                    });
                });
            } else {
                presentTurnSilently();
            }
        });
        $rootScope.$on('turnPresenterNewTurn', function(event, data) {
            vm.turn = gameEngine.turn;
            if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                vm.troopsToDeploy = new Array(gameEngine.troopsToDeploy);
            }

            if (gameEngine.playSound) {
                show(vm.turn);
                gameAnnouncerService.stateTurn(vm.turn, () => {
                    gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    gameEngine.setMusicVolume(1.0);
                    hide();
                });
            } else {
                presentTurnSilently();
            }
        });
    }

    function init() {
        setupEvents();
    }
}
