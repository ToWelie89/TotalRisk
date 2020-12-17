const { getTerritoryByName, getTerritoriesForMovement } = require('./mapHelpers');
const {setArrowBetweenTerritories, clearArrow} = require('./mapArrow');
const { TURN_PHASES } = require('./../gameConstants');
const { PLAYER_TYPES } = require('./../player/playerConstants');

class MapService {
    constructor(gameEngine, soundService) {
        this.gameEngine = gameEngine;
        this.soundService = soundService;
    }

    init(parentId, multiplayer = false, userUid = undefined) {
        this.parentId = parentId;
        this.svg = document.querySelector(`#${this.parentId} #svgMap`);

        this.initEvents();
        this.clearWholeMap();
        if (multiplayer) {
            this.updateMapForMultiplayer(this.gameEngine.map, userUid);
        } else {
            this.updateMap(this.gameEngine.map);
        }
    }

    updateMap(filter = 'byOwner', doNotRemoveHighlightClass = false) {
        console.log('Update map');

        this.gameEngine.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                const color = (filter === 'byOwner') ? this.gameEngine.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                if (!doNotRemoveHighlightClass) {
                    this.svg.getElementById(territory.name).classList.remove('highlighted');
                }
                this.svg.getElementById(territory.name).classList.remove('attackCursor', 'movementCursor', 'addTroopCursor');

                if (this.gameEngine.turn && this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.turn.player.name === territory.owner
                    && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                    this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                }
            });
        });

        if (filter === 'byRegion') {
            if (this.svg.querySelector('#regionTexts')) {
                this.svg.querySelector('#regionTexts').style.display = 'block';
            }
            if (this.svg.querySelector('#troopCounters')) {
                this.svg.querySelector('#troopCounters').style.display = 'none';
            }
        } else {
            if (this.svg.querySelector('#regionTexts')) {
                this.svg.querySelector('#regionTexts').style.display = 'none';
            }
            if (this.svg.querySelector('#troopCounters')) {
                this.svg.querySelector('#troopCounters').style.display = 'block';
            }
        }
    }

    updateMapForMultiplayer(filter = 'byOwner', userUid, doNotRemoveHighlightClass = false) {
        console.log('Update map for multiplayer', filter, userUid, doNotRemoveHighlightClass);

        this.gameEngine.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                const color = (filter === 'byOwner') ? this.gameEngine.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                if (!doNotRemoveHighlightClass) {
                    this.svg.getElementById(territory.name).classList.remove('highlighted');
                }
                this.svg.getElementById(territory.name).classList.remove('attackCursor', 'movementCursor', 'addTroopCursor');
            });
        });

        if (userUid === this.gameEngine.turn.player.userUid) {
            this.gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    if (this.gameEngine.turn && this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.turn.player.name === territory.owner
                        && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                        this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                    }
                });
            });
        }
    }

    hightlightTerritory(target) {
        const country = this.svg.getElementById(target);
        const territory = getTerritoryByName(this.gameEngine.map, country.getAttribute('id'));

        if (territory.owner === this.gameEngine.turn.player.name) {
            if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
                country.classList.add('highlighted');
                territory.adjacentTerritories.forEach(currentTerritory => {
                    const adjacentTerritory = this.svg.getElementById(currentTerritory);

                    if (this.gameEngine.turn.player.name !== getTerritoryByName(this.gameEngine.map, currentTerritory).owner && this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                        adjacentTerritory.classList.add('attackCursor', 'highlighted');
                    } else {
                        adjacentTerritory.classList.remove('attackCursor');
                    }
                });
            } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
                this.gameEngine.map.regions.forEach(region => {
                    region.territories.forEach(currentTerritory => {
                        this.svg.getElementById(currentTerritory.name).classList.remove('movementCursor');
                    });
                });

                const adjacentApplicableTerritories = getTerritoriesForMovement(territory, this.gameEngine.map);
                console.log('Territories for movement ', adjacentApplicableTerritories);

                if (this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                    adjacentApplicableTerritories.forEach(territory => {
                        territory = getTerritoryByName(this.gameEngine.map, territory);
                        this.svg.getElementById(territory.name).classList.add('movementCursor', 'highlighted');
                    });
                }
            }
        } else {
            this.soundService.denied.play();
            clearArrow(`#${this.parentId}`);
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
        let troopIndicatorEllipse;
        let troopIndicatorText;

        if (this.svg.querySelector(`#troopCounters g[for="${territory.name}"]`)) {
            troopIndicatorEllipse = this.svg.querySelector(`#troopCounters g[for="${territory.name}"] .troopCounter`);
            troopIndicatorText = this.svg.querySelector(`#troopCounters g[for="${territory.name}"] .troopCounterText`);
        } else {
            troopIndicatorEllipse = this.svg.querySelector(`.troopCounter[for="${territory.name}"]`);
            troopIndicatorText = this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`);
        }

        troopIndicatorEllipse.setAttribute('country-color', color.name.toUpperCase());
    
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
            countries[i].addEventListener('mouseout', (e) => {
                clearArrow(`#${this.parentId}`);
            });
        }
        /* const seas = this.svg.getElementsByClassName('sea');
        for (let i = 0; i < seas.length; i++) {
            seas[i].addEventListener('mouseover', (e) => {
                this.mouseoverSea(e);
            });
        } */
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

    mouseoverSea() {
        //document.getElementById('currentTerritoryInfo').innerHTML = ' ';
    }

    mouseoverCountry(evt) {
        clearArrow(`#${this.parentId}`);

        if (evt.srcElement.classList.contains('attackCursor') && this.gameEngine.selectedTerritory) {
            setArrowBetweenTerritories(`#${this.parentId}`, this.gameEngine.selectedTerritory.name, evt.srcElement.id, 'attackArrow');
        } else if (evt.srcElement.classList.contains('movementCursor') && this.gameEngine.selectedTerritory) {
            setArrowBetweenTerritories(`#${this.parentId}`, this.gameEngine.selectedTerritory.name, evt.srcElement.id, 'movementArrow');
        }

        /* if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            if (this.gameEngine.selectedTerritory) {
                if (this.gameEngine.selectedTerritory.owner === this.gameEngine.turn.player.name) {
                    if (this.gameEngine.selectedTerritory.name !== evt.srcElement.id) {
                        const territory = getTerritoryByName(this.gameEngine.map, this.gameEngine.selectedTerritory.name);
                        if (territory.owner === this.gameEngine.turn.player.name) {
                            if (territory.adjacentTerritories.includes(evt.srcElement.id)) {
                                const hoveredTerritory = getTerritoryByName(this.gameEngine.map, evt.srcElement.id);
                                if (hoveredTerritory.owner !== territory.owner) {
                                    setArrowBetweenTerritories(`#${this.parentId}`, this.gameEngine.selectedTerritory.name, evt.srcElement.id, 'attackArrow');
                                }
                            }
                        }
                    }
                }
            }
        } */
        // TODO
        /* const country = evt.target;
        const territory = getTerritoryByName(this.gameEngine.map, country.getAttribute('id'));
        document.getElementById('currentTerritoryInfo').innerHTML = `${territory.name}<br>Owner: ${territory.owner}<br>Troops: ${territory.numberOfTroops}`; */
    }
}

module.exports = MapService;