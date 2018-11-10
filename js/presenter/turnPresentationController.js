const {TURN_PHASES, GAME_PHASES} = require('./../gameConstants');
const { MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING } = require('./../gameConstants');

class TurnPresentationController {

    constructor($scope, $rootScope, $uibModalInstance, $sce, gameAnnouncerService, gameEngine, settings, data) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.$rootScope = $rootScope;
        this.gameAnnouncerService = gameAnnouncerService;
        this.gameEngine = gameEngine;
        this.settings = settings;
        this.data = data;

        this.vm.messages = this.data.messages ? this.data.messages : [];
        this.vm.tutorial = this.data.type === 'tutorial';

        this.boundListener = evt => this.keyupEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        this.$sce = $sce;

        this.init();
    }

    keyupEventListener(e) {

        if (e.keyCode === 27) { // Escape
            if (this.$rootScope.currentGamePhase === GAME_PHASES.TUTORIAL) {
                return;
            }

            this.$uibModalInstance.close();
            this.close({presenterWasCancelled: true});
            document.removeEventListener('keyup', this.boundListener);
            this.gameAnnouncerService.mute();
        } else if ((e.keyCode === 0 || e.keyCode === 32) && this.data) { // Space
            e.preventDefault();
            this.$uibModalInstance.close();
            this.close({presenterWasCancelled: true});
            document.removeEventListener('keyup', this.boundListener);
            this.gameAnnouncerService.mute();
            if (!this.vm.tutorial) {
                this.gameEngine.setMusicVolume(0.8);
            }
            if (this.data.afterSpeech) {
                this.data.afterSpeech();
            }
        }
    }

    presentTurnSilently() {
        setTimeout(() => {
            this.close();
        }, 2000);
    }

    close(closingResponse = null) {
        if (closingResponse) {
            this.$uibModalInstance.close(closingResponse);
        } else {
            this.$uibModalInstance.close();
        }
        document.removeEventListener('keypress', this.boundListener);
    }

    init() {
        if (this.data.type === 'startGame') {
            this.vm.turn = this.gameEngine.turn;
            this.vm.troopsToDeploy = new Array(this.gameEngine.troopsToDeploy);

            if (this.settings.playSound) {
                this.gameAnnouncerService.speak('Game started', () => {
                    this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                        this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }, () => {
                        this.gameEngine.setMusicVolume(0.8);
                        this.close();
                    });
                });
            } else {
                this.presentTurnSilently();
            }
        } else if (this.data.type === 'newTurn') {
            this.vm.turn = this.gameEngine.turn;
            if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                this.vm.troopsToDeploy = new Array(this.gameEngine.troopsToDeploy);
            }

            if (this.settings.playSound) {
                this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                    this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                }, () => {
                    this.gameEngine.setMusicVolume(0.8);
                    this.close();
                });
            } else {
                this.presentTurnSilently();
            }
        } else if (this.data.type === 'tutorial') {
            this.data.messages.forEach(message => {
                if (message.markup) {
                    message.markup = this.$sce.trustAsHtml(message.markup);
                }
            });

            if (this.data.beforeSpeech) {
                setTimeout(this.data.beforeSpeech, 50);
            }

            setTimeout(() => {
                this.currentMessageIndex = 0;
                this.speakTutorialMessages();
            }, this.data.delayBefore ? this.data.delayBefore : 50);
        }
    }

    speakTutorialMessages() {
        this.gameAnnouncerService.speak(this.data.messages[this.currentMessageIndex].message, () => {}, () => {
            if ((this.data.messages.length - 1) === this.currentMessageIndex) {
                // Last message was spoken
                if (this.data.afterSpeech) {
                    this.data.afterSpeech();
                }
                setTimeout(() => {
                    this.close();
                }, this.data.delayAfter ? this.data.delayAfter : 0)
            } else {
                this.currentMessageIndex++;
                this.speakTutorialMessages();
            }
        });
    }
}

module.exports = TurnPresentationController;