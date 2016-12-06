import { TURN_PHASES } from './../gameConstants';

function balle() {
    console.log('balle');
}

export default class GameAnnouncer {
    constructor(announcerType = 'UK English Male', pitch = 0.7) {
        this.announcerType = announcerType;
        this.pitch = pitch;
    }

    speak(text, onstartCallback, onendCallback) {
        responsiveVoice.speak(text, this.announcerType, {
            pitch: this.pitch,
            onstart: onstartCallback,
            onend: onendCallback
        });
    }

    kuk() {
        console.log('kuk');
    }

    stateTurn(turn, onstartCallback, onendCallback) {
        const parameters = {
            pitch: this.pitch,
            onstart: onstartCallback,
            onend: onendCallback
        };

        responsiveVoice.speak(turn.newPlayer ? (turn.player.name + 's turn') : '', this.announcerType, {
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
