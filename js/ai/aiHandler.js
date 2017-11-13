import { getBestPossibleCombination } from './../card/cardHelpers';
import { TURN_PHASES } from './../gameConstants';
import { getTerritoriesInRegionByOwner, getTerritoryByName } from './../map/mapHelpers';
import {delay} from './../helpers';

export default class AiHandler {
    constructor(gameEngine, soundService, mapService) {
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.mapService = mapService;

        this.DELAY_BETWEEN_EACH_TROOP_DEPLOY = 200;
    }

    turnInCards() {
        return new Promise((resolve, reject) => {
            const bestCombo = getBestPossibleCombination(this.gameEngine.turn.player.cards);
            if (bestCombo) {
                this.gameEngine.turn.player.cards.map(card => {
                    card.isSelected = false;
                });

                bestCombo.combination.forEach(item => {
                    const card = this.gameEngine.turn.player.cards.find(card => !card.isSelected && card.cardType === item);
                    if (card) {
                        card.isSelected = true;
                    }
                });

                this.gameEngine.turn.player.cards = this.gameEngine.turn.player.cards.filter(card => !card.isSelected);

                console.log(`Cards turned in for ${bestCombo.value} new troops`);
                $('#mainTroopIndicator').addClass('animated infinite bounce');
                this.soundService.cardTurnIn.play();
                this.gameEngine.troopsToDeploy += bestCombo.value;
                setTimeout(() => {
                    resolve();
                    $('#mainTroopIndicator').removeClass('animated infinite bounce');
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    deployTroops(callback) {
        const createPromise = (territoryName, index) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.gameEngine.addTroopToTerritory(territoryName);
                    this.mapService.updateMap(this.gameEngine.filter);
                    this.soundService.addTroopSound.play();
                    callback();
                    resolve();
                }, (this.DELAY_BETWEEN_EACH_TROOP_DEPLOY * (index + 1)));
            });
        };

        const regionOwnership = this.calculatePlayerOwnershipForEachRegion();
        console.log(regionOwnership);

        const controlledRegions = regionOwnership.filter(x => x.ownership === 1);
        const uncontrolledRegions = regionOwnership.filter(x => x.ownership !== 1);

        if (controlledRegions && controlledRegions.length > 0) {
            controlledRegions.forEach(region => {
                const currentRegion = this.gameEngine.map.regions.get(region.regionName);
                const territoriesWithDangerousBorders = Array.from(currentRegion.territories.values()).filter(territory => {
                    const adjacentTerritoryOwnedByEnemy = territory.adjacentTerritories.find(t => {
                        return getTerritoryByName(this.gameEngine.map, t).owner !== this.gameEngine.turn.player.name;
                    });
                    return adjacentTerritoryOwnedByEnemy && territory.owner === this.gameEngine.turn.player.name;
                });
                region.territoriesWithDangerousBorders = territoriesWithDangerousBorders;
                console.log(region);

            });
            const territoriesToReinforce = [].concat(controlledRegions.map(x => x.territoriesWithDangerousBorders));
            const amountToDeploy = this.gameEngine.troopsToDeploy / Math.floor(territoriesToReinforce.length);

            let territoryIndex = 0;
            const promises = [];
            for (let i = 0; i < this.gameEngine.troopsToDeploy; i++) {
                if (!territoriesToReinforce[territoryIndex]) {
                    territoryIndex = 0;
                }
                const currentIndex = territoryIndex;
                promises.push(createPromise(territoriesToReinforce[currentIndex].name, i));
                territoryIndex++;
            }
            return Promise.all(promises);
        } else {
            const currentRegion = this.gameEngine.map.regions.get(uncontrolledRegions[0].regionName);
            const territoriesWithDangerousBorders = Array.from(currentRegion.territories.values()).filter(territory => {
                const adjacentTerritoryOwnedByEnemy = territory.adjacentTerritories.find(t => {
                    return getTerritoryByName(this.gameEngine.map, t).owner !== this.gameEngine.turn.player.name;
                });
                return adjacentTerritoryOwnedByEnemy && territory.owner === this.gameEngine.turn.player.name;
            });
            console.log(territoriesWithDangerousBorders);
            const promises = [];
            for (let i = 0; i < this.gameEngine.troopsToDeploy; i++) {
                promises.push(createPromise(territoriesWithDangerousBorders[0].name, i));
            }
            return Promise.all(promises);
        }
    }

    calculatePlayerOwnershipForEachRegion() {
        const regionOwnership = [];
        this.gameEngine.map.regions.forEach(region => {
            const numberOfTerritoriesInRegion = Array.from(region.territories.keys()).length;
            const territoriesOwnedByPlayerInRegion = getTerritoriesInRegionByOwner(this.gameEngine.map, region.name, this.gameEngine.turn.player.name);

            regionOwnership.push({
                regionName: region.name,
                ownership: (territoriesOwnedByPlayerInRegion.length / numberOfTerritoriesInRegion)
            });
        });

        regionOwnership.sort((a, b) => {
            return b.ownership - a.ownership;
        });

        return regionOwnership;
    }
}
