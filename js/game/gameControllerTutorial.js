const {
    MUSIC_VOLUME_DURING_TUTORIAL,
    GAME_PHASES
} = require('./../gameConstants');
const Player = require('./../player/player');
const {delay} = require('./../helpers');
const {getTerritoryByName, getTerritoriesByOwner} = require('./../map/mapHelpers');
const {PLAYER_COLORS, avatars, PLAYER_TYPES} = require('./../player/playerConstants');

const GameController = require('./gameController');

class GameControllerTutorial extends GameController {

    constructor($scope, $rootScope, $sce, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService) {
        super($scope, $rootScope, $sce, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService);
    }

    setListeners() {
        this.boundListener = evt => this.escapeEventListener(evt);
        document.addEventListener('keyup', this.boundListener);
    }

    setCurrentGamePhaseWatcher() {
        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.TUTORIAL) {
                this.mapService.init('tutorialMap');
                this.setListeners();
                this.startTutorial();
            }
        });
    }

    openMenu() {
        return;
    }

    filterByOwner() {
        return;
    }

    filterByRegion() {
        return;
    }

    /*
     *  EVERYTHING BELOW THIS LINE IS FOR THE TUTORIAL MODE
     */

    startTutorial() {
        let playSoundSettingBeforeTutorial = this.settings.playSound;
        if (!playSoundSettingBeforeTutorial) {
            this.settings.toggleSound();
        }

        const players = Array.from(
            new Array(4), (x, i) =>
                new Player(Object.keys(avatars).map(key => key)[i],
                           Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                           Object.keys(avatars).map(key => avatars[key])[i],
                           PLAYER_TYPES.HUMAN)
        );
        this.gameEngine.startGame(players);

        this.gameEngine.isTutorialMode = true;
        this.vm.isTutorialMode = true;

        this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;

        this.vm.turn = this.gameEngine.turn;
        this.vm.filter = this.gameEngine.filter;
        this.mapService.updateMap(this.gameEngine.filter);

        this.gameEngine.setMusicVolume(MUSIC_VOLUME_DURING_TUTORIAL);

        this.tutorialService.initTutorialData();

        this.tutorialService.openingMessage()
        .then(() => this.tutorialService.phasesAndMapExplanation())
        .then(() => this.tutorialService.deploymentPhaseExplanation())
        .then(() => this.tutorialService.deploymentIndicatorExplanation())
        .then(() => this.tutorialService.reinforcementRulesExplanation())
        .then(() => this.tutorialService.regionFilterExplanation())
        .then(() => {
            this.vm.filter = 'byRegion';
            this.gameEngine.filter = 'byRegion';
            this.mapService.updateMap(this.gameEngine.filter);
        })
        .then(() => delay(1500))
        .then(() => this.tutorialService.ownerFilterExplanation())
        .then(() => {
            this.vm.filter = 'byOwner';
            this.gameEngine.filter = 'byOwner';
            this.mapService.updateMap(this.gameEngine.filter);
        })
        .then(() => delay(1500))
        .then(() => this.tutorialService.reinforcementIntoTerritoryDemonstration())
        .then(() => this.deployTroopsToTerritoryForTutorial())
        .then(() => this.tutorialService.goingForwardToAttackPhase())
        .then(() => { this.vm.turn = this.gameEngine.nextTurn() })
        .then(() => this.tutorialService.attackPhaseExplanation())
        .then(() => this.tutorialService.readyToInvadeExplanation())
        .then(() => this.selectTerritoryToAttackFromForTutorial())
        .then(() => this.tutorialService.hightlightExplanation())
        .then(() => this.tutorialService.attackModalStart())
        .then((closeResponse) => this.handleAttackModalResponseForTutorial(closeResponse))
        .then(() => this.tutorialService.cardExplanation())
        .then(() => this.tutorialService.cardExplanation2())
        .then(() => this.tutorialService.openCardModal())
        .then(() => this.tutorialService.endOfAttackPhase())
        .then(() => { this.vm.turn = this.gameEngine.nextTurn() })
        .then(() => this.tutorialService.startOfMovementPhase())
        .then(() => this.tutorialService.startOfMovementPhase2())
        .then(() => this.selectTerritoryToMoveFromForTutorial())
        .then(() => delay(1500))
        .then(() => this.tutorialService.startOfMovementPhase3())
        .then(() => this.tutorialService.openMovementModal())
        .then((resp) => this.updateGameAfterMovement(resp))
        .then(() => this.tutorialService.endOfTurnExplanation())
        .then(() => delay(1500))
        .then(() => {
            if (playSoundSettingBeforeTutorial) {
                this.gameEngine.setMusic();
            } else {
                this.settings.toggleSound();
            }

            this.gameEngine.setMusicVolume(this.settings.musicVolume);
            this.gameEngine.isTutorialMode = false;
            this.vm.isTutorialMode = false;
            this.$rootScope.currentGamePhase = GAME_PHASES.MAIN_MENU;
            this.$scope.$apply();
        })
        .catch(err => {
            console.log(err);
            this.gameAnnouncerService.mute();
            if (playSoundSettingBeforeTutorial) {
                this.gameEngine.setMusic();
            } else {
                this.settings.toggleSound();
            }
            this.gameEngine.setMusicVolume(this.settings.musicVolume);
            $(`#svgMap .country`).removeClass('blink_me');
        })
    }

    deployTroopsToTerritoryForTutorial() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });
        const promises = [];
        for (let i = 0; i < this.gameEngine.troopsToDeploy; i++) {
            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.simulateClickCountry(territory.name);
                    resolve();
                }, 700 * (i + 1));
            }));
        }
        return Promise.all(promises);
    }

    selectTerritoryToAttackFromForTutorial() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });

        let territoryToAttack = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        this.territoryToAttackFrom = territory;
        this.territoryToAttack = getTerritoryByName(this.gameEngine.map, territoryToAttack);

        return new Promise((resolve, reject) => {
            this.simulateClickCountry(territory.name);
            this.soundService.click.play();
            resolve();
        });
    }

    handleAttackModalResponseForTutorial(closeResponse) {
        return new Promise((resolve, reject) => {
            this.gameEngine.setMusic();
            this.gameEngine.setMusicVolume(MUSIC_VOLUME_DURING_TUTORIAL);
            this.updatePlayerDataAfterAttack(closeResponse);
            resolve();
        });
    }

    simulateClickCountry(territory) {
        this.clickCountry({
            target: {
                getAttribute: () => {
                    return territory;
                }
            }
        });
    }

    selectTerritoryToMoveFromForTutorial() {
        return new Promise((resolve, reject) => {
            this.simulateClickCountry(this.territoryToAttack.name);
            this.soundService.click.play();
            resolve();
        });
    }
}

module.exports = GameControllerTutorial;