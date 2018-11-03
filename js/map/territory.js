class Territory {
    constructor(territory) {
        this.name = territory.name;
        this.adjacentTerritories = territory.adjacentTerritories;
        this.owner = '';
        this.numberOfTroops = 0;
    }
}

module.exports = Territory;