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

const getAllTerritories = (map) => {
    let territories = [];
    map.regions.forEach(region => {
        region.territories.forEach(territory => {
            territories.push(territory);
        });
    });
    return territories;
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

export {getTerritoryByName, getAdjacentApplicableTerritories, getTerritoriesByOwner, getTerritoriesInRegionByOwner, getAllTerritories};
