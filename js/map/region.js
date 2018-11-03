const Territory = require('./territory');

class Region {
    constructor(region) {
        this.name = region.name;
        this.bonusTroops = region.bonusTroops;
        this.territories = new Map();
        this.color = region.color;

        region.territories.forEach(territory => this.initializeTerritory(territory));
    }

    initializeTerritory(territory) {
        this.territories.set(territory.name, (new Territory(territory)));
    }
}

module.exports = Region;