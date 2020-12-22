const {runningElectron, throttle} = require('./../helpers');
const {settings} = require('./defaultSettings');

class SettingsController {

    constructor($scope, $timeout, settings, aiHandler, soundService, gameEngine, toastService) {
        this.vm = this;
        this.$scope = $scope;
        this.vm.settings = settings;
        this.aiHandler = aiHandler;
        this.soundService = soundService;
        this.gameEngine = gameEngine;
        this.toastService = toastService;

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

        this.setColorPickers();
    }

    setColorPickers() {
        const getPickrSettings = (color, selector) => ({
            el: selector,
            theme: 'nano',
            default: color,
            swatches: [
                'rgba(244, 67, 54, 1)',
                'rgba(233, 30, 99, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(103, 58, 183, 1)',
                'rgba(63, 81, 181, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(3, 169, 244, 1)',
                'rgba(0, 188, 212, 1)',
                'rgba(0, 150, 136, 1)',
                'rgba(76, 175, 80, 1)',
                'rgba(139, 195, 74, 1)',
                'rgba(205, 220, 57, 1)',
                'rgba(255, 235, 59, 1)',
                'rgba(255, 193, 7, 1)'
            ],
            components: {
                // Main components
                preview: true,
                opacity: false,
                hue: true,
                // Input / output Options
                interaction: {
                    hex: false,
                    rgba: false,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: false,
                    clear: false,
                    save: false
                }
            }
        });

        const backgroundPicker = Pickr.create(getPickrSettings(this.vm.settings.attackerDice, '#colorSelectorBackground'));
        const labelPicker = Pickr.create(getPickrSettings(this.vm.settings.attackerDiceLabel, '#colorSelectorLabel'));
        backgroundPicker.on('change', throttle(color => {
            const newColor = color.toHEXA().toString();
            if (chroma.deltaE(newColor, this.vm.settings.attackerDiceLabel) < 20) {
                this.toastService.errorToast('Not valid color', 'Your dice background color and label color cant be too similar');
                backgroundPicker.setColor(this.vm.settings.attackerDice);
            } else {
                document.querySelectorAll('.pickr button')[0].style.color = newColor;
                this.vm.settings.attackerDice = newColor;
                this.vm.settings.saveSettings();
                this.$scope.$apply();
            }
        }, 800));
        labelPicker.on('change', throttle(color => {
            const newColor = color.toHEXA().toString();
            if (chroma.deltaE(newColor, this.vm.settings.attackerDice) < 20) {
                this.toastService.errorToast('Not valid color', 'Your dice background color and label color cant be too similar');
                labelPicker.setColor(this.vm.settings.attackerDiceLabel);
            } else {
                document.querySelectorAll('.pickr button')[1].style.color = newColor;
                this.vm.settings.attackerDiceLabel = newColor;
                this.vm.settings.saveSettings();
                this.$scope.$apply();
            }
        }, 800));
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