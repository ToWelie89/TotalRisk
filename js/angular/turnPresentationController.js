import { delay } from './../helpers';
import {TURN_PHASES} from './../gameConstants';
import { MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING } from './../gameConstants';

export function TurnPresentationController($scope, $rootScope, $uibModalInstance, gameAnnouncerService, gameEngine, presentType) {
    var vm = this;

    // PUBLIC FIELDS
    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.turn;
    vm.troopsToDeploy;

    function presentTurnSilently() {
        delay(2000)
        .then(() => {
            $uibModalInstance.close();
        });
    }

    function init() {
        // $('#turnPresentationModal').velocity('transition.bounceLeftIn');

        if (presentType === 'startGame') {
            vm.turn = gameEngine.turn;
            vm.troopsToDeploy = new Array(gameEngine.troopsToDeploy);

            if (gameEngine.playSound) {
                gameAnnouncerService.speak('Game started', () => {
                    gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    gameAnnouncerService.stateTurn(vm.turn, () => {
                        gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }, () => {
                        gameEngine.setMusicVolume(1.0);
                        $uibModalInstance.close();
                    });
                });
            } else {
                presentTurnSilently();
            }
        } else if (presentType === 'newTurn') {
            vm.turn = gameEngine.turn;
            if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                vm.troopsToDeploy = new Array(gameEngine.troopsToDeploy);
            }

            if (gameEngine.playSound) {
                gameAnnouncerService.stateTurn(vm.turn, () => {
                    gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    gameEngine.setMusicVolume(1.0);
                    $uibModalInstance.close();
                });
            } else {
                presentTurnSilently();
            }
        }
    }
}
