/*********************
 * IMPORTS
 *********************/

import WorldMap from './map/worldMap';
import Player from './player/player';
import { playerColors } from './player/playerConstants';
import { turnPhases } from './gameConstants';
import MapController from './map/mapController';
import { shuffle } from './helpers';

export default class GameEngine {

    constructor() {
        // Initialize world map
        this.map = new WorldMap();
        // Initialize player list
        this.players = new Map();
        this.players.set('Martin', new Player('Martin', playerColors.BLACK));
        this.players.set('Pelle', new Player('Pelle', playerColors.RED));
        console.log('Players: ');
        console.log(this.players);
        // Setup map controller
        this.mapController = new MapController(this.players);
        // Setup game table
        this.setupInitDeployment();
        this.mapController.updateMap(this.map);

        this.printCurrentDeployment();

        //
        this.indexOfCurrentPlayersTurn = 0;
        this.currentTurnPhase = turnPhases.DEPLOYMENT;
    }

    startGame() {
        console.log('game started!');
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
            console.log(territory);
        });
    }

    printCurrentDeployment() {
        let html = "<table>";
        html += `   <thead>
                        <tr>
                            <td>Index</td>
                            <td>Territory</td>
                            <td>Owner</td>
                            <td>Troops</td>
                            <td>Player color</td>
                        </tr>
                    </thead>
                `;
        html += "<tbody>";
        let count = 1;
        this.map.getAllTerritoriesAsList().sort(this.sortByName).forEach((territory) => {
            let color = this.players.get(territory.owner).color.name.toLowerCase();
            html += `
                        <tr class="${color}">
                            <td>${count}</td>
                            <td>${territory.name}</td>
                            <td>${territory.owner}</td>
                            <td>${territory.numberOfTroops}</td>
                            <td>${color}</td>
                        </tr>
                    `;
            count++;
        });
        html += "</tbody>";
        html += '</table>';
        document.getElementById("currentDeployment").innerHTML = html;
    }

    sortByName (a, b) {
        if(a.owner < b.owner) return -1;
        if(a.owner > b.owner) return 1;
        return 0;
    }
}