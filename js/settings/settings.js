const {settings} = require('./defaultSettings');
const {runningElectron} = require('./../helpers');

class Settings {
    constructor() {
        this.runningElectron = runningElectron();
        let savedSettings;

        if (this.runningElectron) {
            const Store = require('./electronStoreTwo.js');
            const ElectronSettings = require('./electronDefaultSettings.js');

            this.store = new Store({
                configName: 'user-preferences',
                defaults: ElectronSettings
            });

            savedSettings = this.store.get('');
            this.proxySettings = this.store.get('proxySettings');
            console.log('Saved settings from JSON file: ', savedSettings);
        } else {
            savedSettings = localStorage.getItem('riskSettings');
            if (savedSettings) {
                savedSettings = JSON.parse(savedSettings);
                console.log('Saved settings from local storage: ', savedSettings);
            }
        }

        this.playSound     = savedSettings ? savedSettings.playSound     : settings.playSound;
        this.aiSpeed       = savedSettings ? savedSettings.aiSpeed       : settings.aiSpeed;
        this.showAnnouncer = savedSettings ? savedSettings.showAnnouncer : settings.showAnnouncer;
        this.fullScreen    = savedSettings ? savedSettings.fullScreen    : settings.fullScreen;
        this.enable3d      = savedSettings ? savedSettings.enable3d      : settings.enable3d;
        this.musicVolume   = savedSettings ? savedSettings.musicVolume   : settings.musicVolume;
        this.sfxVolume     = savedSettings ? savedSettings.sfxVolume     : settings.sfxVolume;
        this.aiSpeedValues = {
            'Slow': 1000,
            'Medium': 600,
            'Fast': 200,
            'Superspeed': 40
        };
    }

    toggleSound() {
        this.playSound = !this.playSound;
        this.saveSettings();
    }

    saveSettings() {
        const settingsToSave = {
            playSound:     this.playSound,
            aiSpeed:       this.aiSpeed,
            showAnnouncer: this.showAnnouncer,
            fullScreen:    this.fullScreen,
            musicVolume:   this.musicVolume,
            sfxVolume:     this.sfxVolume,
            enable3d:      this.enable3d
        };

        if (this.runningElectron) {
            this.store.set('riskSettings', settingsToSave);
            if (this.proxySettings) {
                this.store.set('proxySettings', this.proxySettings);
            }
        } else {
            localStorage.setItem('riskSettings', JSON.stringify(settingsToSave));
        }
    }
}

module.exports = Settings;