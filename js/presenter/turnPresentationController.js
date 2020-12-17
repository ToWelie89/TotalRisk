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
                this.gameEngine.setMusicVolume(this.settings.musicVolume);
            }
            if (this.data.afterSpeech) {
                this.data.afterSpeech();
            }
        }
    }

    presentTurnSilently() {
        setTimeout(() => {
            this.close();
        }, 3500);
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

            this.vm.reinforcementData = this.gameEngine.reinforcementData;

            this.vm.reinforcementData.reinforcementsFromTerritoriesAsList = new Array(this.vm.reinforcementData.reinforcementsFromTerritories);
            this.vm.reinforcementData.regionBonuses.forEach(r => {
                r.bonusTroopsAsList = new Array(r.bonusTroops);
            });

            if (this.settings.playSound) {
                this.gameAnnouncerService.speak('Game started', () => {
                    if (this.settings.musicVolume > MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING) {
                        this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }
                }, () => {
                    this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                        if (this.settings.musicVolume > MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING) {
                            this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                        }
                    }, () => {
                        this.gameEngine.setMusicVolume(this.settings.musicVolume);
                        setTimeout(() => {
                            this.close();
                        }, 2500);
                    });
                });
            } else {
                this.presentTurnSilently();
            }
        } else if (this.data.type === 'newTurn') {
            this.vm.turn = this.gameEngine.turn;
            if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                this.vm.reinforcementData = this.gameEngine.reinforcementData;

                this.vm.reinforcementData.reinforcementsFromTerritoriesAsList = new Array(this.vm.reinforcementData.reinforcementsFromTerritories);
                this.vm.reinforcementData.regionBonuses.forEach(r => {
                    r.bonusTroopsAsList = new Array(r.bonusTroops).fill(1);
                    r.shortenedName = r.name.replace(' ', '');
                });
            }

            if (this.settings.playSound) {
                this.gameAnnouncerService.stateTurn(this.vm.turn, () => {
                    if (this.settings.musicVolume > MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING) {
                        this.gameEngine.setMusicVolume(MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING);
                    }
                }, () => {
                    this.gameEngine.setMusicVolume(this.settings.musicVolume);
                    setTimeout(() => {
                        this.close();
                    }, 2500);
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
        this.gameAnnouncerService.speakTutorialMessage(this.data.messages[this.currentMessageIndex].message, () => {}, () => {
            if ((this.data.messages.length - 1) === this.currentMessageIndex) {
                // Last message was spoken
                if (this.data.afterSpeech) {
                    this.data.afterSpeech();
                }
                setTimeout(() => {
                    this.close();
                }, this.data.delayAfter ? this.data.delayAfter : 0);
            } else {
                this.currentMessageIndex++;
                this.speakTutorialMessages();
            }
        });
    }
}

module.exports = TurnPresentationController;