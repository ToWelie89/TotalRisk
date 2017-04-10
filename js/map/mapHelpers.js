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

const getApplicableTerritoriesForMovement = (map, territory, applicableTerritories = []) => {
    const adjacentApplicableTerritories = territory.adjacentTerritories.filter(currentTerritory => getTerritoryByName(map, currentTerritory).owner === territory.owner &&
                                                                                                         !applicableTerritories.includes(currentTerritory));
    if (adjacentApplicableTerritories) {
        const newApplicableTerritories = applicableTerritories.concat(adjacentApplicableTerritories);
        getApplicableTerritoriesForMovement(map, territory, newApplicableTerritories);
    }

    return applicableTerritories;
};

export {getTerritoryByName, getApplicableTerritoriesForMovement};
