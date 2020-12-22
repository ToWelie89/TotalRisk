const { TURN_PHASES } = require('./../gameConstants');
const { PLAYER_TYPES } = require('./../player/playerConstants');

class GameAnnouncer {
    constructor(settings) {
        this.settings = settings;
        this.announcerType = 'UK English Male';
        this.pitch = 0.7;
    }

    speak(text, onstartCallback, onendCallback) {
        if (this.settings.playSound) {
            responsiveVoice.speak(text, this.announcerType, {
                pitch: this.pitch,
                //volume: (this.settings.musicVolume / 100),
                volume: 1,
                onstart: onstartCallback,
                onend: onendCallback
            });
        }
    }

    speakTutorialMessage(text, onstartCallback, onendCallback) {
        responsiveVoice.speak(text, this.announcerType, {
            pitch: this.pitch,
            volume: 1,
            onstart: onstartCallback,
            onend: onendCallback
        });
    }

    speakAsPromise(text, onstartCallback, onendCallback) {
        return new Promise(resolve => {
            responsiveVoice.speak(text, this.announcerType, {
                pitch: this.pitch,
                //volume: (this.settings.musicVolume / 100),
                volume: 1,
                onstart: onstartCallback,
                onend: () => {
                    if (onendCallback) {
                        onendCallback();
                    }
                    resolve();
                }
            });
        });
    }

    mute() {
        responsiveVoice.cancel();
    }

    stateTurn(turn, onstartCallback, onendCallback) {
        /* const parameters = {
            pitch: this.pitch,
            //volume: (this.settings.musicVolume / 100),
            volume: 1,
            onstart: onstartCallback,
            onend: onendCallback
        }; */

        let text;
        if (turn.player.type === PLAYER_TYPES.HUMAN) {
            text = `${turn.player.color.name} player ${turn.player.avatar.pronounciation ? turn.player.avatar.pronounciation : turn.player.name}'s turn`;
        } else {
            text = `AI player ${turn.player.avatar.pronounciation ? turn.player.avatar.pronounciation : turn.player.name}'s turn`;
        }

        responsiveVoice.speak(turn.newPlayer ? text : ' ', this.announcerType, {
            pitch: this.pitch,
            //volume: (this.settings.musicVolume / 100),
            volume: 1,
            onstart: onstartCallback ,
            onend: () => {
                onendCallback();
                /*
                if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                    responsiveVoice.speak('Deployment phase', this.announcerType, parameters);
                } else if (turn.turnPhase === TURN_PHASES.ATTACK) {
                    responsiveVoice.speak('Attack phase', this.announcerType, parameters);
                } else if (turn.turnPhase === TURN_PHASES.MOVEMENT) {
                    responsiveVoice.speak('Movement phase', this.announcerType, parameters);
                }*/
            }
        });
    }
}

module.exports = GameAnnouncer;