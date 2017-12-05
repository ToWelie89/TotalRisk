export default class SettingsController {

    constructor($scope, $timeout, settings, aiHandler, soundService) {
        this.vm = this;
        this.vm.settings = settings;
        this.aiHandler = aiHandler;
        this.soundService = soundService;

        // PUBLIC FIELDS
        this.vm.movementSliderOptions = {
            showTicks: true,
            stepsArray: Object.keys(this.vm.settings.aiSpeedValues),
            onChange: () => {
                this.vm.settings.aiSpeed = this.vm.aiSpeed;
                this.aiHandler.update();
                this.soundService.changeColor.play();
            }
        };
        this.vm.aiSpeed = this.settings.aiSpeed;

        // PUBLIC FUNCTIONS
        this.vm.toggleSound = this.toggleSound;
        this.vm.toggleAnnouncer = this.toggleAnnouncer;
    }

    toggleSound() {
        if (this.settings.playSound) {
            this.soundService.changeColor.play();
            this.vm.settings.toggleSound();
        } else {
            this.vm.settings.toggleSound();
            this.soundService.changeColor.play();
        }
    }

    toggleAnnouncer() {
        this.vm.settings.showAnnouncer = !this.vm.settings.showAnnouncer;
        this.soundService.changeColor.play();
    }

}
