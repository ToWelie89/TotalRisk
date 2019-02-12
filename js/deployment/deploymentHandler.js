const { CONSTANTS } = require('./../gameConstants');

class DeploymentHandler {
    calculateReinforcements(players, map, turn) {
        let reinforcementsFromTerritories = 0;
        const currentPlayer = players.get(turn.player.name);
        const numberOfTerritories = map.getNumberOfTerritoriesByOwner(currentPlayer.name);
        console.log(`${numberOfTerritories} territories owned by ${currentPlayer.name}`);
        reinforcementsFromTerritories += Math.floor(numberOfTerritories / 3);
        reinforcementsFromTerritories = reinforcementsFromTerritories < CONSTANTS.MIN_REINFORCEMENTS ? CONSTANTS.MIN_REINFORCEMENTS : reinforcementsFromTerritories;

        let totalReinforcements = reinforcementsFromTerritories;

        const regionBonuses = map.calculateRegionBonusesForPlayer(currentPlayer.name);
        console.log('Region bonuses: ', regionBonuses);

        regionBonuses.forEach(region => {
            totalReinforcements += region.bonusTroops;
        });

        console.log(`Total number of reinforcements: ${totalReinforcements}`);
        return {
            reinforcementsFromTerritories,
            totalReinforcements,
            regionBonuses
        };
    }
}

module.exports = DeploymentHandler;