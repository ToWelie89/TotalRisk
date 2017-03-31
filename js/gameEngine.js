/*
 * IMPORTS
 */

import WorldMap from './map/worldMap';
import { getTerritoryByName } from './map/mapHelpers';
import { playerIterator } from './player/playerConstants';
import { TURN_PHASES } from './gameConstants';
import { shuffle } from './helpers';
import GameAnnouncer from './voice/gameAnnouncer';
import DeploymentHandler from './deploymentHandler';

export default class GameEngine {

    constructor() {
        this.filter = 'byOwner';
        // Initialize game announcer voice
        this.gameAnnouncer = new GameAnnouncer();
        // Initialize world map
        this.map = new WorldMap();
        this.playSound = true;
        this.setMusic();
    }

    setMusicVolume(volume) {
        if (this.bgMusic && this.playSound) {
            this.bgMusic.volume = volume;
        }
    }

    toggleSound(playSound) {
        this.playSound = playSound;
        if (this.playSound) {
            if (this.bgmusic) {
                this.bgMusic.play();
            } else {
                this.setMusic();
            }
        } else {
            this.gameAnnouncer.mute();
            this.bgMusic.pause();
        }
    }

    setMusic(music = './audio/bgmusic.mp3') {
        if (this.playSound) {
            if (this.bgMusic) {
                this.bgMusic.pause();
                this.bgMusic.currentTime = 0;
            }

            this.bgMusic = new Audio(music);
            this.bgMusic.loop = true;
            this.bgMusic.play();
        }
    }

    startGame(players) {
        console.log('game started!');

        // Initialize player list
        this.players = new Map();
        players.forEach(player => {
            this.players.set(player.name, player);
        });

        this.iterator = playerIterator(Array.from(this.players), [TURN_PHASES.DEPLOYMENT, TURN_PHASES.ATTACK, TURN_PHASES.MOVEMENT]);
        this.turn = this.iterator.getCurrent();

        this.deploymentHandler = new DeploymentHandler();

        // Setup game table
        this.setupInitDeployment();

        if (this.playSound) {
            this.gameAnnouncer.speak('Game started', () => {
                this.setMusicVolume(0.3);
            }, () => {
                this.gameAnnouncer.stateTurn(this.turn, () => {
                    this.setMusicVolume(0.3);
                }, () => {
                    this.setMusicVolume(1.0);
                });
            });
        }

        console.log(this.turn);
        this.handleTurnPhase();
    }

    nextTurn() {
        console.log('New turn!');
        this.iterator.next();
        this.turn = this.iterator.getCurrent();
        if (this.playSound) {
            this.gameAnnouncer.stateTurn(this.turn, () => {
                this.setMusicVolume(0.3);
            }, () => {
                this.setMusicVolume(1.0);
            });
        }
        this.handleTurnPhase();
        return this.turn;
    }

    handleTurnPhase(turn) {
        if (this.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            this.troopsToDeploy = this.deploymentHandler.calculateReinforcements(this.players, this.map, this.turn);
        }
    }

    setupInitDeployment() {
        const totalNumberOfPlayers = this.players.size;
        const names = Array.from(this.players.keys());

        let currentPlayerIndex = 0;
        const territories = this.map.getAllTerritoriesAsList();
        shuffle(territories);

        territories.forEach(territory => {
            currentPlayerIndex = ((totalNumberOfPlayers - 1) === currentPlayerIndex) ? 0 : (currentPlayerIndex + 1);
            territory.owner = names[currentPlayerIndex];
            territory.numberOfTroops = 1;
        });
    }

    addTroopToTerritory(country) {
        const territory = getTerritoryByName(this.map, country);
        if (this.troopsToDeploy > 0 && territory.owner === this.turn.player.name) {
            this.troopsToDeploy--;
            territory.numberOfTroops++;
            console.log(territory);
        }
    }
}
