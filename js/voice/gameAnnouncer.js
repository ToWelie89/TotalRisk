import { TURN_PHASES } from './../gameConstants';

export default class GameAnnouncer {
    constructor() {
        this.announcerType = 'UK English Male';
        this.pitch = 0.7;
    }

    speak(text, onstartCallback, onendCallback) {
        responsiveVoice.speak(text, this.announcerType, {
            pitch: this.pitch,
            onstart: onstartCallback,
            onend: onendCallback
        });
    }

    speakAsPromise(text, onstartCallback, onendCallback) {
        return new Promise((resolve, reject) => {
            responsiveVoice.speak(text, this.announcerType, {
                pitch: this.pitch,
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
        const parameters = {
            pitch: this.pitch,
            onstart: onstartCallback,
            onend: onendCallback
        };

        responsiveVoice.speak(turn.newPlayer ? (`${turn.player.avatar.pronounciation ? turn.player.avatar.pronounciation : turn.player.name}'s turn`) : ' ', this.announcerType, {
            pitch: this.pitch,
            onstart: onstartCallback,
            onend: () => {
                if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
                    responsiveVoice.speak('Deployment phase', this.announcerType, parameters);
                } else if (turn.turnPhase === TURN_PHASES.ATTACK) {
                    responsiveVoice.speak('Attack phase', this.announcerType, parameters);
                } else if (turn.turnPhase === TURN_PHASES.MOVEMENT) {
                    responsiveVoice.speak('Movement phase', this.announcerType, parameters);
                }
            }
        });
    }
}
