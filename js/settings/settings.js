import {settings} from './defaultSettings';

export default class Settings {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        // Default values
        this.playSound = settings.playSound;
        this.aiSpeed = settings.aiSpeed;
        this.showAnnouncer = settings.showAnnouncer;

        this.aiSpeedValues = settings.aiSpeedValues;
    }

    toggleSound() {
        this.playSound = !this.playSound;
        this.gameEngine.toggleSound(this.playSound);
    }
}