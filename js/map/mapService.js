const { getTerritoryByName, getTerritoriesForMovement } = require('./mapHelpers');
const { TURN_PHASES } = require('./../gameConstants');
const { PLAYER_TYPES } = require('./../player/playerConstants');

class MapService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    init(parentId, multiplayer = false, userUid = undefined) {
        this.svg = document.querySelector(`#${parentId} #svgMap`);

        this.initEvents();
        this.clearWholeMap();
        if (multiplayer) {
            this.updateMapForMultiplayer(this.gameEngine.map, userUid);
        } else {
            this.updateMap(this.gameEngine.map);
        }
    }

    updateMap(filter = 'byOwner') {
        console.log('Update map');

        this.gameEngine.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                const color = (filter === 'byOwner') ? this.gameEngine.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                this.svg.getElementById(territory.name).classList.remove('attackCursor', 'movementCursor', 'highlighted', 'addTroopCursor');

                this.svg.querySelectorAll(`.troopCounter[for="${territory.name}"], .troopCounterText[for="${territory.name}"]`).forEach(el => {
                    el.classList.remove('attackCursor', 'movementCursor', 'addTroopCursor');
                });

                if (this.gameEngine.turn && this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.turn.player.name === territory.owner
                    && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                    this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                    this.svg.querySelector(`.troopCounter[for="${territory.name}"]`).classList.add('addTroopCursor');
                    this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`).classList.add('addTroopCursor');
                }
            });
        });
    }

    updateMapForMultiplayer(filter = 'byOwner', userUid) {
        console.log('Update map');

        this.gameEngine.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                const color = (filter === 'byOwner') ? this.gameEngine.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                this.svg.getElementById(territory.name).classList.remove('attackCursor', 'movementCursor', 'highlighted', 'addTroopCursor');

                this.svg.querySelectorAll(`.troopCounter[for="${territory.name}"], .troopCounterText[for="${territory.name}"]`).forEach(el => {
                    el.classList.remove('attackCursor', 'movementCursor', 'addTroopCursor');
                });
            });
        });

        if (userUid === this.gameEngine.turn.player.userUid) {
            this.gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    if (this.gameEngine.turn && this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.turn.player.name === territory.owner
                        && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                        this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                        this.svg.querySelector(`.troopCounter[for="${territory.name}"]`).classList.add('addTroopCursor');
                        this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`).classList.add('addTroopCursor');
                    }
                });
            });
        }
    }

    hightlightTerritory(target) {
        const country = this.svg.getElementById(target);
        const territory = getTerritoryByName(this.gameEngine.map, country.getAttribute('id'));
        console.log(territory);

        if (territory.owner === this.gameEngine.turn.player.name) {
            if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
                country.classList.add('highlighted');
                territory.adjacentTerritories.forEach(currentTerritory => {
                    if (this.gameEngine.turn.player.name !== getTerritoryByName(this.gameEngine.map, currentTerritory).owner && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                        this.svg.getElementById(currentTerritory).classList.add('attackCursor', 'highlighted');
                        this.svg.querySelector(`.troopCounter[for="${currentTerritory}"]`).classList.add('attackCursor');
                        this.svg.querySelector(`.troopCounterText[for="${currentTerritory}"]`).classList.add('attackCursor');
                    } else {
                        this.svg.getElementById(currentTerritory).classList.remove('attackCursor');
                        this.svg.querySelector(`.troopCounterText[for="${currentTerritory}"]`).classList.remove('attackCursor');
                        this.svg.querySelector(`.troopCounter[for="${currentTerritory}"]`).classList.remove('attackCursor');
                    }
                });
            } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
                this.gameEngine.map.regions.forEach(region => {
                    region.territories.forEach(currentTerritory => {
                        this.svg.getElementById(currentTerritory.name).classList.remove('movementCursor');
                        this.svg.querySelector(`.troopCounter[for="${currentTerritory.name}"]`).classList.remove('movementCursor');
                        this.svg.querySelector(`.troopCounterText[for="${currentTerritory.name}"]`).classList.remove('movementCursor');
                    });
                });

                const adjacentApplicableTerritories = getTerritoriesForMovement(territory, this.gameEngine.map);
                console.log('Territories for movement ', adjacentApplicableTerritories);

                if (this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                    adjacentApplicableTerritories.forEach(territory => {
                        territory = getTerritoryByName(this.gameEngine.map, territory);
                        this.svg.getElementById(territory.name).classList.add('movementCursor', 'highlighted');
                        this.svg.querySelector(`.troopCounter[for="${territory.name}"]`).classList.add('movementCursor');
                        this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`).classList.add('movementCursor');
                    });
                }
            }
        }
    }

    updateColorOfTerritory(territory, color) {
        const country = this.svg.getElementById(territory.name);
        if (country) {
            country.setAttribute('country-color', color.name.toUpperCase());
        } else {
            console.error(`Country ${territory.name} not found!`);
        }
    }

    updateTroopIndicator(territory, color) {
        const troopIndicatorEllipse = this.svg.querySelector(`.troopCounter[for="${territory.name}"]`);
        troopIndicatorEllipse.setAttribute('country-color', color.name.toUpperCase());

        const troopIndicatorText = this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`);
        if (troopIndicatorText) {
            troopIndicatorText.innerHTML = territory.numberOfTroops;
        } else {
            console.error(`Troop indicator text for ${territory.name} not found!`);
        }
    }

    initEvents() {
        const countries = this.svg.getElementsByClassName('country');
        for (let i = 0; i < countries.length; i++) {
            countries[i].addEventListener('mouseover', (e) => {
                this.mouseoverCountry(e);
            });
        }
        const seas = this.svg.getElementsByClassName('sea');
        for (let i = 0; i < seas.length; i++) {
            seas[i].addEventListener('mouseover', (e) => {
                this.mouseoverSea(e);
            });
        }
    }

    clearWholeMap() {
        const countries = this.svg.getElementsByClassName('country');
        for (let i = 0; i < countries.length; i++) {
            this.clearCountry(countries[i]);
        }
    }

    clearCountry(country) {
        country.setAttribute('fill', '#FFFFFF');
        country.setAttribute('stroke', 'gainsboro');
    }

    mouseoverSea(evt) {
        document.getElementById('currentTerritoryInfo').innerHTML = ' ';
    }

    mouseoverCountry(evt) {
        const country = evt.target;
        const territory = getTerritoryByName(this.gameEngine.map, country.getAttribute('id'));
        document.getElementById('currentTerritoryInfo').innerHTML = `${territory.name}<br>Owner: ${territory.owner}<br>Troops: ${territory.numberOfTroops}`;
    }
}

module.exports = MapService;