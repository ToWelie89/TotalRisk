class Sound {
    constructor(reference, gameEngine) {
        this.reference = reference;
        this.audio = new Audio(this.reference);
        this.gameEngine = gameEngine;
    }

    play() {
        if (this.gameEngine && this.gameEngine.playSound) {
            if (!this.audio.paused) {
                // If the current audio is currently playing then instantiate a new audio with the same sound reference and play that
                // This way the same sound can be played many times and overlap each other
                new Audio(this.reference).play();
            }
            this.audio.play();
        }
    }
}

module.exports = Sound;