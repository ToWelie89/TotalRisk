import { getTerritoryByName } from './mapHelpers';

export default class MapController {
    constructor(players, map) {
        this.svg = document.getElementById('svgMap');
        this.doc = this.svg.ownerDocument;
        this.hilite = this.doc.getElementById('hilite');
        this.players = players;
        this.map = map;

        this.initEvents();
        this.clearWholeMap();
        this.updateMap(this.map);
    }

    updateMap(map) {
        console.log('Update map');
        this.map = map;
        this.map.regions.forEach(region => {
            region.territories.forEach(territory => {
                this.updateColorOfTerritory(territory, this.players.get(territory.owner).color);
                this.updateTroopIndicator(territory, this.players.get(territory.owner).color);
            });
        });
    }

    updateColorOfTerritory(territory, color) {
        let country = this.svg.getElementById(territory.name);
        if (country) {
            country.setAttribute('fill', color.mainColor);
            country.setAttribute('stroke', color.borderColor);
        } else {
            console.error('Country '+ territory.name +' not found!');
        }
    }

    updateTroopIndicator(territory, color) {
        let troopIndicatorEllipse = this.svg.querySelector('.troopCounter[for="' + territory.name + '"]');
        if (troopIndicatorEllipse) {
            troopIndicatorEllipse.setAttribute('fill', color.mainColor);
            troopIndicatorEllipse.setAttribute('stroke', color.borderColor);
        } else {
            console.error('Troop indicator ellipse for '+ territory.name +' not found!');
        }

        let troopIndicatorText = this.svg.querySelector('.troopCounterText[for="' + territory.name + '"]');
        if (troopIndicatorText) {
            troopIndicatorText.setAttribute('fill', 'black');
            troopIndicatorText.setAttribute('stroke', 'black');
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
        var sea = evt.target;
        hilite.setAttribute('d', 'm0 0');
        document.getElementById('currentTerritoryInfo').innerHTML = ' ';
    }

    mouseoverCountry(evt) {
        var country = evt.target;
        var outline = country.getAttribute('d');
        let territory = getTerritoryByName(this.map, country.getAttribute('id'));
        document.getElementById('currentTerritoryInfo').innerHTML = territory.name + ' | Owner: ' + territory.owner + ' | Troops: ' + territory.numberOfTroops;
        hilite.setAttribute('d', outline);
        hilite.setAttribute('country', country.id);
    }
}