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
        this.players.set('Örjan', new Player('Örjan', PLAYER_COLORS.RED));
        this.players.set('Johan', new Player('Johan', PLAYER_COLORS.BLUE));

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
    }

    nextTurn() {
        console.log('New turn!');
        this.iterator.next();
        this.turn = this.iterator.getCurrent();
        this.gameAnnouncer.stateTurn(this.turn);
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