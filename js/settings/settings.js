import {settings} from './defaultSettings';

export default class Settings {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        let savedSettings = localStorage.getItem('riskSettings');
        if (savedSettings) {
            savedSettings = JSON.parse(savedSettings);
        }

        this.playSound     = savedSettings ? savedSettings.playSound     : settings.playSound;
        this.aiSpeed       = savedSettings ? savedSettings.aiSpeed       : settings.aiSpeed;
        this.showAnnouncer = savedSettings ? savedSettings.showAnnouncer : settings.showAnnouncer;
        this.aiSpeedValues = settings.aiSpeedValues;

        this.gameEngine.toggleSound(this.playSound);
    }

    toggleSound() {
        this.playSound = !this.playSound;
        this.gameEngine.toggleSound(this.playSound);

        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('riskSettings', JSON.stringify({
            playSound:     this.playSound,
            aiSpeed:       this.aiSpeed,
            showAnnouncer: this.showAnnouncer
        }));
    }
}