const { MAPS } = require('./../gameConstants');
const { loadMapSvgIntoDiv } = require('./../helpers');

class HostNewGameModalController {

    constructor($scope, $uibModalInstance, soundService) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.soundService = soundService;

        // PUBLIC FUNCTIONS
        this.vm.createLobby = this.createLobby;
        this.vm.cancel = this.cancel;

        this.vm.gameName = '';
        this.vm.password = '';

        this.vm.maps = MAPS;
        this.vm.currentlySelectedMap = this.vm.maps[0];

        loadMapSvgIntoDiv(this.vm.currentlySelectedMap.mainMap, '#currentlySelectedMapPreview');
    }

    createLobby() {
        this.soundService.tick.play();
        this.$uibModalInstance.close({
            gameName: this.vm.gameName,
            password: this.vm.password,
            map: this.vm.currentlySelectedMap
        });
    }

    selectMap(map) {
        this.soundService.tick.play();
        this.currentlySelectedMap = map;
        loadMapSvgIntoDiv(this.vm.currentlySelectedMap.mainMap, '#currentlySelectedMapPreview');
    }

    cancel() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }
}

module.exports = HostNewGameModalController;