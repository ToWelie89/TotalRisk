const {runningElectron} = require('./../helpers');
const {settings} = require('./defaultSettings');

class SettingsController {

    constructor($scope, $timeout, settings, aiHandler, soundService, gameEngine) {
        this.vm = this;
        this.vm.settings = settings;
        this.aiHandler = aiHandler;
        this.soundService = soundService;
        this.gameEngine = gameEngine;

        this.vm.runningElectron = runningElectron();

        this.vm.proxySettings = {
            username: this.vm.settings.proxySettings && this.vm.settings.proxySettings.username ? this.vm.settings.proxySettings.username : '',
            password: this.vm.settings.proxySettings && this.vm.settings.proxySettings.password ? this.vm.settings.proxySettings.password : '',
            host: this.vm.settings.proxySettings && this.vm.settings.proxySettings.host ? this.vm.settings.proxySettings.host : ''
        };

        // PUBLIC FIELDS
        this.vm.movementSliderOptions = {
            showTicks: true,
            stepsArray: Object.keys(this.vm.settings.aiSpeedValues),
            onChange: () => {
                this.vm.settings.aiSpeed = this.vm.aiSpeed;
                this.aiHandler.update();
                this.soundService.tick.play();

                this.vm.settings.saveSettings();
            }
        };
        this.vm.musicVolumeSliderOptions = {
            showTicks: false,
            stepsArray: Array.from(new Array(101), (x, i) => i),
            onChange: () => {
                this.vm.settings.musicVolume = this.vm.musicVolume;
                this.gameEngine.setMusicVolume(this.vm.settings.musicVolume);
                this.vm.settings.saveSettings();
            }
        };
        this.vm.sfxVolumeSliderOptions = {
            showTicks: false,
            stepsArray: Array.from(new Array(101), (x, i) => i),
            onChange: () => {
                this.vm.settings.sfxVolume = this.vm.sfxVolume;
                this.vm.settings.saveSettings();
                this.soundService.tick.play();
            }
        };
        this.vm.aiSpeed = this.vm.settings.aiSpeed;
        this.vm.musicVolume = this.vm.settings.musicVolume;
        this.vm.sfxVolume = this.vm.settings.sfxVolume;

        // PUBLIC FUNCTIONS
        this.vm.toggleSound = this.toggleSound;
        this.vm.toggleAnnouncer = this.toggleAnnouncer;
        this.vm.toggleFullScreen = this.toggleFullScreen;
        this.vm.toggle3d = this.toggle3d;
        this.vm.toggleFastDice = this.toggleFastDice;
        this.vm.updateProxySettings = this.updateProxySettings;
        this.vm.resetToDefault = this.resetToDefault;
    }

    updateProxySettings() {
        this.vm.settings.proxySettings = this.vm.proxySettings;
        this.vm.settings.saveSettings();
    }

    toggleSound() {
        if (this.vm.settings.playSound) {
            this.soundService.tick.play();
            this.vm.settings.toggleSound();
            this.gameEngine.toggleSound();
        } else {
            this.vm.settings.toggleSound();
            this.gameEngine.toggleSound();
            this.soundService.tick.play();
        }
    }

    resetToDefault() {
        Object.keys(settings).forEach(key => {
            this.vm.settings[key] = settings[key];
        });

        this.vm.settings.saveSettings();
        this.gameEngine.setMusicVolume(this.vm.settings.musicVolume);

        this.vm.aiSpeed = this.vm.settings.aiSpeed;
        this.vm.musicVolume = this.vm.settings.musicVolume;
        this.vm.sfxVolume = this.vm.settings.sfxVolume;

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    toggleFastDice() {
        this.vm.settings.fastDice = !this.vm.settings.fastDice;
        this.soundService.tick.play();
        this.vm.settings.saveSettings();
    }

    toggleFullScreen() {
        this.vm.settings.fullScreen = !this.vm.settings.fullScreen;

        const window = electron.remote.getCurrentWindow();
        window.setFullScreen(this.vm.settings.fullScreen);
        this.soundService.tick.play();

        this.vm.settings.saveSettings();
    }

    toggle3d() {
        this.vm.settings.toggle3d = !this.vm.settings.toggle3d;
        this.soundService.tick.play();
        this.vm.settings.saveSettings();
    }

    toggleAnnouncer() {
        this.vm.settings.showAnnouncer = !this.vm.settings.showAnnouncer;
        this.soundService.tick.play();

        this.vm.settings.saveSettings();
    }

}

module.exports = SettingsController;