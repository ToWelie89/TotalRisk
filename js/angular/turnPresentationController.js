import {TURN_PHASES} from './../gameConstants';
import { MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING } from './../gameConstants';

export default class TurnPresentationController {

    constructor($scope, $uibModalInstance, gameAnnouncerService, gameEngine, presentType) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.gameAnnouncerService = gameAnnouncerService;
        this.gameEngine = gameEngine;
        this.presentType = presentType;

        this.init();
    }

    presentTurnSilently() {
        setTimeout(() => {
            this.$uibModalInstance.close();
        }, 2000);
    }

    init() {
        if (this.presentType === 'startGame') {
            this.vm.turn = this.gameEngine.turn;
            this.vm.troopsToDeploy = new Array(this.gameEngine.troopsToDeploy);

            if (this.gameEngine.playSound) {
                this.gameAnnouncerService.speak('Game started', () => {
                    this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                        this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }, () => {
                        this.gameEngine.setMusicVolume(1.0);
                        this.$uibModalInstance.close();
                    });
                });
            } else {
                this.presentTurnSilently();
            }
        } else if (this.presentType === 'newTurn') {
            this.vm.turn = this.gameEngine.turn;
            if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                this.vm.troopsToDeploy = new Array(this.gameEngine.troopsToDeploy);
            }

            if (this.gameEngine.playSound) {
                this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                    this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    this.gameEngine.setMusicVolume(1.0);
                    this.$uibModalInstance.close();
                });
            } else {
                this.presentTurnSilently();
            }
        }
    }
}
