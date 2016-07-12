/*********************
 * IMPORTS
 *********************/

import WorldMap from './map/worldMap';
import Player from './player/player';
import { PLAYER_COLORS, playerIterator } from './player/playerConstants';
import { TURN_PHASES } from './gameConstants';
import { shuffle } from './helpers';

export default class GameEngine {

    constructor() {
        // Initialize world map
        this.map = new WorldMap();
        // Initialize player list
        this.players = new Map();
        this.players.set('Martin', new Player('Martin', PLAYER_COLORS.GREEN));
        this.players.set('Pelle', new Player('Pelle', PLAYER_COLORS.RED));

        this.iterator = playerIterator(Array.from(this.players), [ TURN_PHASES.DEPLOYMENT, TURN_PHASES.ATTACK, TURN_PHASES.MOVEMENT ]);
        this.turn = this.iterator.getCurrent();

        // Setup game table
        this.setupInitDeployment();

        this.currentTurnPhase = TURN_PHASES.DEPLOYMENT;
    }

    startGame() {
        console.log('game started!');
    }

    nextTurn() {
        console.log('New turn!');
        this.iterator.next();
        this.turn = this.iterator.getCurrent();
        return this.turn;
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

    sortByName (a, b) {
        if(a.owner < b.owner) return -1;
        if(a.owner > b.owner) return 1;
        return 0;
    }
}