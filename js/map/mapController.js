export default class MapController {
    constructor(players) {
        this.svg = document.getElementById('svgMap');
        this.doc = this.svg.ownerDocument;
        this.hilite = this.doc.getElementById('hilite');
        this.players = players;

        this.initEvents();
        this.clearWholeMap();
    }

    updateMap(map) {
        console.log('Update map');
        map.regions.forEach(region => {
            region.territories.forEach(territory => {
                this.updateColorOfTerritory(territory, this.players.get(territory.owner).color);
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
    }

    mouseoverCountry(evt) {
        var country = evt.target;
        var outline = country.getAttribute('d');
        hilite.setAttribute('d', outline);
    }
}