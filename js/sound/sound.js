class Sound {
    constructor(reference, settings) {
        this.settings = settings;
        this.audio = new Audio(reference)
        this.audio.volume = (this.settings.sfxVolume / 100);
    }

    play() {
        if (this.settings && this.settings.playSound) {
            this.audio.play();
        }
    }
}

module.exports = Sound;