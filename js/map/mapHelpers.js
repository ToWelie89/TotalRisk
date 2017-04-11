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

export {getTerritoryByName, getAdjacentApplicableTerritories};
