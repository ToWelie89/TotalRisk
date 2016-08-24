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
                let color = (filter === 'byOwner') ? this.players.get(territory.owner).color : { name: region.name.toUpperCase() };
                this.updateColorOfTerritory(territory, color);
                this.updateTroopIndicator(territory, color);

                this.svg.getElementById(territory.name).classList.remove('attackCursor');
                this.svg.getElementById(territory.name).classList.remove('highlighted');
                this.svg.getElementById(territory.name).classList.remove('addTroopCursor');

                if (turn && turn.turnPhase === TURN_PHASES.DEPLOYMENT && turn.player.name === territory.owner) {
                    this.svg.getElementById(territory.name).classList.add('addTroopCursor');
                }
            });
        });
    }

    hightlightTerritory(target, currentPlayerName) {
        let country = this.svg.getElementById(target);
        let territory = getTerritoryByName(this.map, country.getAttribute('id'));
        country.classList.add('highlighted');
        console.log(territory);

        territory.adjacentTerritories.forEach(territory => {
            if (currentPlayerName !== getTerritoryByName(this.map, territory).owner) {
                this.svg.getElementById(territory).classList.add('attackCursor');
                this.svg.getElementById(territory).classList.add('highlighted');
            } else {
                this.svg.getElementById(territory).classList.remove('attackCursor');
            }
        });
    }

    updateColorOfTerritory(territory, color) {
        let country = this.svg.getElementById(territory.name);
        if (country) {
            country.setAttribute('country-color', color.name.toUpperCase());
        } else {
            console.error('Country '+ territory.name +' not found!');
        }
    }

    updateTroopIndicator(territory, color) {
        let troopIndicatorEllipse = this.svg.querySelector('.troopCounter[for="' + territory.name + '"]');
        troopIndicatorEllipse.setAttribute('country-color', color.name.toUpperCase());

        let troopIndicatorText = this.svg.querySelector('.troopCounterText[for="' + territory.name + '"]');
        if (troopIndicatorText) {
            troopIndicatorText.innerHTML = territory.numberOfTroops;
        } else {
            console.error('Troop indicator text for '+ territory.name +' not found!');
        }
    }

    initEvents() {
        let countries = this.svg.getElementsByClassName('country');
        for (let i = 0; i < countries.length; i++) {
            countries[i].addEventListener('mouseover', (e) => { this.mouseoverCountry(e); });
        }
        let seas = this.svg.getElementsByClassName('sea');
        for (let i = 0; i < seas.length; i++) {
            seas[i].addEventListener('mouseover', (e) => { this.mouseoverSea(e); });
        }
    }

    clearWholeMap () {
        let countries = this.svg.getElementsByClassName('country');
        for (let i = 0; i < countries.length; i++) {
            this.clearCountry(countries[i]);
        }
    }

    clearCountry(country) {
        country.setAttribute('fill', '#FFFFFF')
        country.setAttribute('stroke', 'gainsboro')
    }

    mouseoverSea(evt) {
        document.getElementById('currentTerritoryInfo').innerHTML = ' ';
    }

    mouseoverCountry(evt) {
        var country = evt.target;
        let territory = getTerritoryByName(this.map, country.getAttribute('id'));
        document.getElementById('currentTerritoryInfo').innerHTML = `${territory.name} | Owner: ${territory.owner} | Troops: ${territory.numberOfTroops}`;
    }
}