const { worldMap } = require('./worldMapConfiguration');
const Region = require('./region');
const { shuffle } = require('./../helpers');

class WorldMap {
    constructor() {
        this.regions = new Map();

        worldMap.regions.forEach(region => this.initializeRegion(region));
        console.log('World map regions: ');
        console.log(this.regions);
    }

    initializeRegion(region) {
        this.regions.set(region.name, (new Region(region)));
    }

    getTotalNumberOfTerritories() {
        let count = 0;
        this.regions.forEach(region => {
            region.territories.forEach(() => {
                count++;
            });
        });
        return count;
    }

    getAllTerritoriesAsList() {
        const arr = [];
        this.regions.forEach(region => {
            region.territories.forEach(territory => {
                arr.push(territory);
            });
        });
        return arr;
    }

    getNumberOfTerritoriesByOwner(owner) {
        return this.getAllTerritoriesAsList().filter(territory => (territory.owner === owner)).length;
    }

    calculateRegionBonusesForPlayer(owner) {
        const regionBonuses = [];
        this.regions.forEach(region => {
            if (this.allTerritoriesOwnedByPlayer(owner, region.territories)) {
                regionBonuses.push(region);
            }
        });
        return regionBonuses;
    }

    allTerritoriesOwnedByPlayer(owner, territories) {
        let returnValue = true;
        territories.forEach(territory => {
            if (territory.owner !== owner) {
                returnValue = false;
            }
        });
        return returnValue;
    }

    shuffleMap(map) {
        shuffle(map.regions); // First shuffle regions
        map.regions.forEach(region => shuffle(region.territories)); // Shuffle every territory in every region
    }
}

module.exports = WorldMap;