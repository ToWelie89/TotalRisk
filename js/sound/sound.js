import { settings as defaultSettings } from './../settings/defaultSettings.js';

class Sound {
    constructor(reference, settings, volumeModifier = undefined) {
        this.settings = settings;
        this.audio = new Audio(reference);
        this.volumeModifier = volumeModifier;
        this.audio.volume = this.settings.sfxVolume ? (this.settings.sfxVolume / 100) : (defaultSettings.sfxVolume / 100);

        if (this.volumeModifier) {
            this.audio.volume = this.audio.volume * this.volumeModifier;
        }
    }

    play() {
        if (this.settings && this.settings.playSound && this.settings.sfxVolume > 0) {
            this.audio.volume = this.settings.sfxVolume / 100;

            if (this.volumeModifier) {
                this.audio.volume = this.audio.volume * this.volumeModifier;
            }

            this.audio.play();
        }
    }
}

module.exports = Sound;