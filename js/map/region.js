import Territory from './territory';

export default class Region {
    constructor(region) {
        this.name = region.name;
        this.bonusTroops = region.bonusTroops;
        this.territories = new Map();

        region.territories.forEach(territory => this.initializeTerritory(territory));
    }

    initializeTerritory(territory) {
        this.territories.set(territory.name, (new Territory(territory)));
    }
}