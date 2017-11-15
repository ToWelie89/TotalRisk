import { getBestPossibleCombination } from './../card/cardHelpers';
import { TURN_PHASES } from './../gameConstants';
import { getTerritoriesInRegionByOwner, getTerritoryByName, getTerritoriesByOwner, getCurrentOwnershipStandings } from './../map/mapHelpers';
import { delay, allValuesInArrayAreEqual } from './../helpers';

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

    contemplateAlternativesForAttack() {
        return new Promise((resolve, reject) => {
            const territoriesInRegionAsArray = (region) => Array.from(region.territories.values());

            const possibleTerritoriesToAttack = [];
            const territoriesByOwner = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
            territoriesByOwner.forEach(territory => {
                territory.adjacentTerritories.forEach(adjacentTerritory => {
                    const terr = getTerritoryByName(this.gameEngine.map, adjacentTerritory);
                    if (terr.owner !== this.gameEngine.turn.player.name && !possibleTerritoriesToAttack.find(x => x.territory.name === terr.name)) {
                        possibleTerritoriesToAttack.push({
                            territory: terr
                        });
                    }
                });
            });

            possibleTerritoriesToAttack.forEach(territory => {
                const regionsAsArray = Array.from(this.gameEngine.map.regions.values());
                const region = regionsAsArray.find(region => territoriesInRegionAsArray(region).find(x => x.name === territory.territory.name));
                const standings = this.calculateStandingsWithThreatPoints();
                const owner = standings.find(x => x.name === territory.territory.owner);

                // CAN I BREAK UP A REGION BY CONQUERING THIS TERRITORY?
                // Check if territories in region have same owner
                territory.canBeAttackedToBreakUpRegion = allValuesInArrayAreEqual(territoriesInRegionAsArray(region).map(x => x.owner));

                // AM I CLOSE TO CAPTURING A REGION?
                const totalTerritoriesInRegion = territoriesInRegionAsArray(region);
                const totalTerritoriesInRegionOwnedByPlayer = totalTerritoriesInRegion.filter(x => x.owner === this.gameEngine.turn.player.name);
                territory.closeToCaptureRegion = ((totalTerritoriesInRegionOwnedByPlayer.length / totalTerritoriesInRegion.length * 100) >= 60);

                // IS THIS THE ONLY TERRITORY I NEED TO CAPTURE THE ENTIRE REGION?
                const territoriesInRegionNotOwnedByPlayer = territoriesInRegionAsArray(region).filter(x => x.owner !== this.gameEngine.turn.player.name);
                territory.lastTerritoryLeftInRegion = territoriesInRegionNotOwnedByPlayer.length === 1;

                // ARE MOST MY TROOPS IN THIS REGION?
                const ownership = this.calculatePlayerOwnershipForEachRegion();
                const currentRegionOwnership = ownership.find(x => x.regionName === region.name);
                territory.mostTroopsInThisRegion = (ownership.indexOf(currentRegionOwnership) === 0 || ownership.indexOf(currentRegionOwnership) === 1);

                // DOES TERRITORY BELONG TO A BIG TRHEAT?
                const playerThreatPoints = standings.find(x => x.name === this.gameEngine.turn.player.name).threatPoints;
                const currentTerritoryPlayerThreatPoints = owner.threatPoints;
                territory.belongsToBigThreat = currentTerritoryPlayerThreatPoints >= playerThreatPoints;

                // IS THERE ANY PLAYER NEARBY THAT I CAN ELIMINATE?
                territory.opportunityToEliminatePlayer = owner.totalTerritories === 1 && owner.cardsOwned > 0;
            });

            possibleTerritoriesToAttack.forEach(territory => {
                const regionsAsArray = Array.from(this.gameEngine.map.regions.values());
                const region = regionsAsArray.find(region => territoriesInRegionAsArray(region).find(x => x.name === territory.territory.name));

                territory.valuePoints = 0;
                territory.valuePoints += territory.opportunityToEliminatePlayer ? 4 : 0;
                territory.valuePoints += territory.belongsToBigThreat ? 2 : 0;
                territory.valuePoints += territory.mostTroopsInThisRegion ? 5 : 0;
                territory.valuePoints += territory.closeToCaptureRegion ? 5 : 0;
                territory.valuePoints += territory.canBeAttackedToBreakUpRegion ? 3 : 0;
                territory.valuePoints += territory.lastTerritoryLeftInRegion ? 5: 0

                if (territory.mostTroopsInThisRegion && territory.closeToCaptureRegion) {
                    territory.valuePoints += Math.floor(region.bonusTroops / 2);
                }
            });

            possibleTerritoriesToAttack.sort((a, b) => b.valuePoints - a.valuePoints);
            console.log('Possible attack alternatives for AI', possibleTerritoriesToAttack);
            resolve(possibleTerritoriesToAttack);
        });
    }

    deployTroops(response, callback) {
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

        let territoriesToDeploy = [];
        let territoryIndex = 0;
        let troopsToDeploy = this.gameEngine.troopsToDeploy;

        while (troopsToDeploy > 0) {
            const currentTerritoryToAttack = response[territoryIndex].territory;
            const playerControlledAdjacentTerritories = currentTerritoryToAttack.adjacentTerritories.map(x => getTerritoryByName(this.gameEngine.map, x))
                                                      .filter(x => x.owner === this.gameEngine.turn.player.name);
            playerControlledAdjacentTerritories.sort((a, b) => a.numberOfTroops > b.numberOfTroops);

            const selectedAdjacentTerritory = playerControlledAdjacentTerritories[0];

            const predictedAmountOfTroops = (selectedAdjacentTerritory.numberOfTroops + selectedAdjacentTerritory.troopsToDeploy);

            if (predictedAmountOfTroops >= (currentTerritoryToAttack.numberOfTroops * 2)
                && predictedAmountOfTroops > 3) {

                if (!territoriesToDeploy.includes(selectedAdjacentTerritory)) {
                    selectedAdjacentTerritory.troopsToDeploy = 0;
                    selectedAdjacentTerritory.territoryToAttack = response[territoryIndex].territory;
                    territoriesToDeploy.push(selectedAdjacentTerritory);
                }

                if (troopsToDeploy < 3) {
                    territoriesToDeploy.find(x => x.name === selectedAdjacentTerritory.name).troopsToDeploy += troopsToDeploy;
                    troopsToDeploy = 0;
                } else {
                    territoryIndex++;
                }
            } else {
                if (!territoriesToDeploy.includes(selectedAdjacentTerritory)) {
                    selectedAdjacentTerritory.troopsToDeploy = 1;
                    selectedAdjacentTerritory.territoryToAttack = response[territoryIndex].territory;
                    territoriesToDeploy.push(selectedAdjacentTerritory);
                } else {
                    territoriesToDeploy.find(x => x.name === selectedAdjacentTerritory.name).troopsToDeploy++;
                }
                troopsToDeploy--;
            }
        }

        console.log('Territories to be deployed to by AI', territoriesToDeploy);

        let totalIndex = 0;
        const promises = [];
        territoriesToDeploy.forEach(territory => {
            for (let i = 0; i < territory.troopsToDeploy; i++) {
                promises.push(createPromise(territory.name, totalIndex));
                totalIndex++;
            }
        });
        return Promise.all(promises).then(() => territoriesToDeploy);

        /*
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
        }*/
    }

    terrotoriesToAttack(terrotoriesToAttack) {

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

    calculateStandingsWithThreatPoints() {
        const currentStandings = getCurrentOwnershipStandings(this.gameEngine.map, this.gameEngine.players);
        currentStandings.forEach(standing => {
            standing.threatPoints = 0;
            standing.threatPoints += standing.totalTroops;
            standing.threatPoints += (Math.floor(standing.totalTerritories / 2));
            standing.threatPoints += (standing.cardsOwned * 2);

            standing.regionsOwned.forEach(region => {
                standing.threatPoints += (Math.floor(this.gameEngine.map.regions.get(region).bonusTroops * 1.5));
            });
        });

        currentStandings.sort((a, b) => a.threatPoints - b.threatPoints);
        return currentStandings;
    }
}
