import {settings} from './defaultSettings';
import {runningElectron} from './../helpers';

const Store = require('./electronStoreTwo.js');

export default class Settings {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        let savedSettings;

        if (runningElectron()) {
            this.store = new Store({
              configName: 'user-preferences',
              defaults: settings
            });

            savedSettings = this.store.get('riskSettings');
            console.log(savedSettings);
        } else {
            savedSettings = localStorage.getItem('riskSettings');
            if (savedSettings) {
                savedSettings = JSON.parse(savedSettings);
            }
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
        if (runningElectron()) {
            this.store.set('riskSettings', {
                playSound:     this.playSound,
                aiSpeed:       this.aiSpeed,
                showAnnouncer: this.showAnnouncer
            });
        } else {
            localStorage.setItem('riskSettings', JSON.stringify({
                playSound:     this.playSound,
                aiSpeed:       this.aiSpeed,
                showAnnouncer: this.showAnnouncer
            }));
        }
    }
}