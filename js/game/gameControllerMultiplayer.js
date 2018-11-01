import {
    GAME_PHASES
} from './../gameConstants';
import { displayReinforcementNumbers } from './../animations/animations';

import GameController from './gameController';

export default class GameControllerMultiplayer extends GameController {
    constructor($scope, $rootScope, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService) {
        super($scope, $rootScope, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService);
    }

    setCurrentGamePhaseWatcher() {
        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.GAME_MULTIPLAYER) {
                this.mapService.init('multiplayerMap');
                this.setListeners();
                this.startGame(this.$rootScope.players, this.$rootScope.chosenGoal);
                this.setSocketListeners();
            }
        });
    }

    setSocketListeners() {
        this.socketService.socket.on('troopAddedToTerritoryNotifier', (territoryName) => {
            this.gameEngine.addTroopToTerritory(territoryName);
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.$scope.$apply();

            this.soundService.addTroopSound.play();
            displayReinforcementNumbers(territoryName);

            this.mapService.updateMap(this.gameEngine.filter);
        });
    }

    emit(functionName, args) {
        if (!this.gameEngine.currentGameIsMultiplayer) {
            return;
        }
        this.socketService[functionName](...args);
    }

}
