/*********************
 * IMPORTS
 *********************/

import WorldMap from './map/worldMap';
import Player from './player/player';
import { PLAYER_COLORS, playerIterator } from './player/playerConstants';
import { TURN_PHASES } from './gameConstants';
import { shuffle } from './helpers';
import GameAnnouncer from './voice/gameAnnouncer';

export default class GameEngine {

    constructor() {
        // Initialize game announcer voice
        this.gameAnnouncer = new GameAnnouncer();
        // Initialize world map
        this.map = new WorldMap();
        // Initialize player list
        this.players = new Map();
        this.players.set('Martin', new Player('Martin', PLAYER_COLORS.GREEN));
        this.players.set('Johan', new Player('Johan', PLAYER_COLORS.BLUE));
        this.players.set('Napoleon', new Player('Napoleon', PLAYER_COLORS.RED));

        this.iterator = playerIterator(Array.from(this.players), [ TURN_PHASES.DEPLOYMENT, TURN_PHASES.ATTACK, TURN_PHASES.MOVEMENT ]);
        this.turn = this.iterator.getCurrent();

        // Setup game table
        this.setupInitDeployment();

        this.currentTurnPhase = TURN_PHASES.DEPLOYMENT;
    }

    startGame() {
        console.log('game started!');
        this.gameAnnouncer.speak("Game started");

        this.turn = this.iterator.getCurrent();
        this.gameAnnouncer.stateTurn(this.turn);

        console.log(this.turn);
        this.handleTurnPhase();
    }

    nextTurn() {
        console.log('New turn!');
        this.iterator.next();
        this.turn = this.iterator.getCurrent();
        this.gameAnnouncer.stateTurn(this.turn);
        this.handleTurnPhase();
        return this.turn;
    }

    handleTurnPhase(turn) {
        if (this.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            this.troopsToDeploy = this.calculateReinforcements();
        }
    }

    setupInitDeployment() {
        let totalNumberOfPlayers = this.players.size;
        let names = Array.from(this.players.keys());

        let currentPlayerIndex = 0;
        let territories = this.map.getAllTerritoriesAsList();
        shuffle(territories);

        territories.forEach(territory => {
            currentPlayerIndex = ((totalNumberOfPlayers - 1) === currentPlayerIndex) ? 0 : (currentPlayerIndex + 1);
            territory.owner = names[currentPlayerIndex];
            territory.numberOfTroops = 1;
        });
    }

    calculateReinforcements() {
        let numberOfReinforcements = 0;
        let currentPlayer = this.players.get(this.turn.player.name);
        let numberOfTerritories = this.map.getNumberOfTerritoriesByOwner(currentPlayer.name);
        console.log(numberOfTerritories + ' territories owned by ' + currentPlayer.name);
        numberOfReinforcements += Math.floor(numberOfTerritories / 3);

        let regionBonuses = this.map.calculateRegionBonusesForPlayer(currentPlayer.name);
        console.log('Region bonuses: ');
        console.log(regionBonuses);

        regionBonuses.forEach(region => {
            numberOfReinforcements += region.bonusTroops;
        });

        console.log('Total number of reinforcements: ' + numberOfReinforcements);
        return numberOfReinforcements;
    }
}