import { CONSTANTS } from './gameConstants';

export default class DeploymentHandler {
    calculateReinforcements(players, map, turn) {
        let numberOfReinforcements = 0;
        const currentPlayer = players.get(turn.player.name);
        const numberOfTerritories = map.getNumberOfTerritoriesByOwner(currentPlayer.name);
        console.log(`${numberOfTerritories} territories owned by ${currentPlayer.name}`);
        numberOfReinforcements += Math.floor(numberOfTerritories / 3);
        numberOfReinforcements = numberOfReinforcements < 3 ? 3 : numberOfReinforcements;

        const regionBonuses = map.calculateRegionBonusesForPlayer(currentPlayer.name);
        console.log('Region bonuses: ');
        console.log(regionBonuses);

        regionBonuses.forEach(region => {
            numberOfReinforcements += region.bonusTroops;
        });

        console.log(`Total number of reinforcements: ${numberOfReinforcements}`);
        return (numberOfReinforcements > CONSTANTS.MIN_REINFORCEMENTS) ? numberOfReinforcements : CONSTANTS.MIN_REINFORCEMENTS;
    }
}
