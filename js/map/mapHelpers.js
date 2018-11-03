const { allValuesInArrayAreEqual } = require('./../helpers');

const getTerritoryByName = (map, name) => {
    let terr;
    map.regions.forEach(region => {
        region.territories.forEach(territory => {
            if (territory.name === name) {
                terr = territory;
            }
        });
    });
    return terr;
};

const getTerritoriesByOwner = (map, ownerName) => {
    let territories = [];
    map.regions.forEach(region => {
        region.territories.forEach(territory => {
            if (territory.owner === ownerName) {
                territories.push(territory);
            }
        });
    });
    return territories;
};

const getTerritoriesInRegionByOwner = (map, regionName, ownerName) => {
    let territories = [];
    map.regions.forEach(region => {
        if (region.name === regionName) {
            region.territories.forEach(territory => {
                if (territory.owner === ownerName) {
                    territories.push(territory);
                }
            });
        }
    });
    return territories;
};

const getAdjacentApplicableTerritories = (map, adjacentApplicableTerritories, fromTerritory) => {
    let newTerrirories = new Set([]);
    adjacentApplicableTerritories.forEach(currentTerritory => {
        currentTerritory = getTerritoryByName(map, currentTerritory);
        const territories = currentTerritory.adjacentTerritories.filter(terr => getTerritoryByName(map, terr).owner === fromTerritory.owner &&
                                                                                                !adjacentApplicableTerritories.includes(terr));
        const territoriesAsSet = new Set(territories);
        newTerrirories = new Set([...newTerrirories, ...territoriesAsSet]);
    });
    return Array.from(newTerrirories);
};

const getCurrentOwnershipStandings = (map, players) => {
    const playersArray = Array.from(players.values());
    let standings = playersArray.map(x => {
        return {
            name: x.name,
            totalTroops: 0,
            regionsOwned: [],
            totalTerritories: 0,
            cardsOwned: x.cards.length
        };
    });

    map.regions.forEach(region => {
        const territoriesInRegionAsArray = Array.from(region.territories.values());
        if (allValuesInArrayAreEqual(territoriesInRegionAsArray.map(x => x.owner))) {
            const player = standings.find(x => x.name === territoriesInRegionAsArray[0].owner);
            player.regionsOwned.push(region.name);
        }

        region.territories.forEach(territory => {
            const player = standings.find(x => x.name === territory.owner);
            player.totalTroops += territory.numberOfTroops;
            player.totalTerritories++;
        });
    });
    return standings;
}

module.exports = {getTerritoryByName, getAdjacentApplicableTerritories, getTerritoriesByOwner, getTerritoriesInRegionByOwner, getCurrentOwnershipStandings};
