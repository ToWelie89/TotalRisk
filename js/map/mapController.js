import { getTerritoryByName } from './mapHelpers';
import { TURN_PHASES } from './../gameConstants';

export default class MapController {
    constructor(players, map) {
        this.svg = document.getElementById('svgMap');
        this.doc = this.svg.ownerDocument;
        this.players = players;
        this.map = map;

        this.initEvents();
        this.clearWholeMap();
        this.updateMap(this.map);
    }

    updateMap(map, filter = 'byOwner', turn = undefined) {
        console.log('Update map');
        this.map = map;

        this.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                const color = (filter === 'byOwner') ? this.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                this.svg.getElementById(territory.name).classList.remove('attackCursor');
                this.svg.querySelector(`.troopCounter[for="${territory.name}"]`).classList.remove('attackCursor');
                this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`).classList.remove('attackCursor');

                this.svg.getElementById(territory.name).classList.remove('movementCursor');
                this.svg.querySelector(`.troopCounter[for="${territory.name}"]`).classList.remove('movementCursor');
                this.svg.querySelector(`.troopCounterText[for="${territory.name}"]`).classList.remove('movementCursor');

                this.svg.getElementById(territory.name).classList.remove('highlighted');
                this.svg.getElementById(territory.name).classList.remove('addTroopCursor');

                if (turn && turn.turnPhase === TURN_PHASES.DEPLOYMENT && turn.player.name === territory.owner) {
                    this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                }
            });
        });
    }

    hightlightTerritory(target, turn) {
        const country = this.svg.getElementById(target);
        const territory = getTerritoryByName(this.map, country.getAttribute('id'));
        console.log(territory);

        if (turn.turnPhase === TURN_PHASES.ATTACK) {
            country.classList.add('highlighted');
            territory.adjacentTerritories.forEach(territory => {
                if (turn.player.name !== getTerritoryByName(this.map, territory).owner) {
                    this.svg.getElementById(territory).classList.add('attackCursor');
                    this.svg.querySelector(`.troopCounter[for="${territory}"]`).classList.add('attackCursor');
                    this.svg.querySelector(`.troopCounterText[for="${territory}"]`).classList.add('attackCursor');
                    this.svg.getElementById(territory).classList.add('highlighted');
                } else {
                    this.svg.getElementById(territory).classList.remove('attackCursor');
                    this.svg.querySelector(`.troopCounterText[for="${territory}"]`).classList.remove('attackCursor');
                    this.svg.querySelector(`.troopCounter[for="${territory}"]`).classList.remove('attackCursor');
                }
            });
        } else if (turn.turnPhase === TURN_PHASES.MOVEMENT) {
            this.map.regions.forEach(region => {
                region.territories.forEach(currentTerritory => {
                    if (currentTerritory.owner === turn.player.name && currentTerritory.name !== territory.name) {
                        this.svg.getElementById(currentTerritory.name).classList.add('movementCursor');
                        this.svg.querySelector(`.troopCounter[for="${currentTerritory.name}"]`).classList.add('movementCursor');
                        this.svg.querySelector(`.troopCounterText[for="${currentTerritory.name}"]`).classList.add('movementCursor');
                        this.svg.getElementById(currentTerritory.name).classList.add('highlighted');
                    } else {
                        this.svg.getElementById(currentTerritory.name).classList.remove('movementCursor');
                        this.svg.querySelector(`.troopCounter[for="${currentTerritory.name}"]`).classList.remove('movementCursor');
                        this.svg.querySelector(`.troopCounterText[for="${currentTerritory.name}"]`).classList.remove('movementCursor');
                    }
                });
            });
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
        const territory = getTerritoryByName(this.map, country.getAttribute('id'));
        document.getElementById('currentTerritoryInfo').innerHTML = `${territory.name} | Owner: ${territory.owner} | Troops: ${territory.numberOfTroops}`;
    }
}
