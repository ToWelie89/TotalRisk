/*********************
 * IMPORTS
 *********************/

import WorldMap from './map/worldMap';
import Player from './player/player';
import {
    playerColors
}
from './player/playerConstants';
import {
    turnPhases
}
from './gameConstants';

export default class GameEngine {

    constructor() {
        // Initialize world map
        this.map = new WorldMap();
        // Initialize player list
        this.players = new Map();
        this.players.set(0, new Player('Martin', playerColors.BLACK));
        this.players.set(1, new Player('Pelle', playerColors.RED));
        console.log('Players: ');
        console.log(this.players);
        // Setup game table
        this.setupInitDeployment();

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

        let currentPlayerIndex = 0;

        this.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                currentPlayerIndex = ((totalNumberOfPlayers - 1) === currentPlayerIndex) ? 0 : (currentPlayerIndex + 1);
                territory.owner = this.players.get(currentPlayerIndex).name;
                territory.numberOfTroops = 1;
                console.log(territory);
            });
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
            let color = this.getPlayerByName(territory.owner).color;
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

    getPlayerByName(name) {
        for (let player of this.players.values()) {
            if (name === player.name) {
                return player;
            }
        }

        return null;
    }

    sortByName (a, b) {
        if(a.owner < b.owner) return -1;
        if(a.owner > b.owner) return 1;
        return 0;
    }
}