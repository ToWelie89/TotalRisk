import { TURN_PHASES } from './../gameConstants';

export default class GameAnnouncer {
    constructor(announcerType = 'UK English Male', pitch = 0.7) {
        this.announcerType = announcerType;
        this.pitch = pitch;
    }

    speak(text) {
        responsiveVoice.speak(text, this.announcerType, {pitch: this.pitch});
    }

    stateTurn(turn) {
        if (turn.newPlayer) {
            responsiveVoice.speak(turn.player.name + 's turn', this.announcerType, {pitch: this.pitch});
        }
        if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            responsiveVoice.speak('Deployment phase', this.announcerType, {pitch: this.pitch});
        } else if (turn.turnPhase === TURN_PHASES.ATTACK) {
            responsiveVoice.speak('Attack phase', this.announcerType, {pitch: this.pitch});
        } else if (turn.turnPhase === TURN_PHASES.MOVEMENT) {
            responsiveVoice.speak('Movement phase', this.announcerType, {pitch: this.pitch});
        }
    }
}