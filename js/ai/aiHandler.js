import { getBestPossibleCombination } from './../card/cardHelpers';
import { TURN_PHASES } from './../gameConstants';
import { getTerritoriesInRegionByOwner, getTerritoryByName, getTerritoriesByOwner, getCurrentOwnershipStandings } from './../map/mapHelpers';
import { delay, allValuesInArrayAreEqual, removeDuplicates, chancePercentage, shuffle } from './../helpers';
import BattleHandler from './../battleHandler';
import { PLAYER_TYPES } from './../player/playerConstants';

export default class AiHandler {
    constructor(gameEngine, soundService, mapService, settings) {
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.mapService = mapService;
        this.settings = settings;
    }

    update() {
        this.DELAY_BETWEEN_EACH_TROOP_DEPLOY = this.settings.aiSpeedValues[this.settings.aiSpeed];
        this.DELAY_BETWEEN_EACH_BATTLE = this.settings.aiSpeedValues[this.settings.aiSpeed];
        this.DELAY_BEFORE_MOVE = this.settings.aiSpeedValues[this.settings.aiSpeed];
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

                this.updateCallback();

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
            const standings = this.calculateStandingsWithThreatPoints();

            let possibleTerritoriesToAttack = [];
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
                territory.valuePoints += territory.closeToCaptureRegion ? 7 : 0;
                territory.valuePoints += territory.canBeAttackedToBreakUpRegion ? 3 : 0;
                territory.valuePoints += territory.lastTerritoryLeftInRegion ? 5: 0

                if (territory.mostTroopsInThisRegion || territory.closeToCaptureRegion) {
                    territory.valuePoints += Math.floor(region.bonusTroops / 2);
                }

                const ownerThreatPoints = standings.find(x => x.name === territory.territory.owner).threatPoints;
                const playerThreatPoints = standings.find(x => x.name === this.gameEngine.turn.player.name).threatPoints;

                if (ownerThreatPoints >= (playerThreatPoints * 1.5)) {
                    territory.valuePoints += territory.canBeAttackedToBreakUpRegion ? 6 : 0;
                }

                if (this.gameEngine.turn.player.type === PLAYER_TYPES.AI_NORMAL) {
                    if (chancePercentage(50)) {
                        territory.valuePoints += Math.floor((Math.random() * 3) + 1);
                    } else {
                        territory.valuePoints -= Math.floor((Math.random() * 3) + 1);
                    }
                }
            });

            if (this.gameEngine.troopsToDeploy === 0) {
                // Deployment is already done, player is attacking again
                possibleTerritoriesToAttack = possibleTerritoriesToAttack.filter(x => {
                    return x.territory.adjacentTerritories.find(y => {
                        const t = getTerritoryByName(this.gameEngine.map, y);
                        return t.owner === this.gameEngine.turn.player.name && t.numberOfTroops > 3;
                    });
                });
            }

            possibleTerritoriesToAttack.sort((a, b) => b.valuePoints - a.valuePoints);

            if (possibleTerritoriesToAttack.filter(x => x.valuePoints > 0).length >= 2) {
                possibleTerritoriesToAttack = possibleTerritoriesToAttack.filter(x => x.valuePoints > 0);
            }

            if (this.gameEngine.turn.player.type === PLAYER_TYPES.AI_NORMAL) {
                let bestOptions = possibleTerritoriesToAttack.filter(x => x.valuePoints >= 8);
                const worstOptions = possibleTerritoriesToAttack.filter(x => x.valuePoints < 8);

                shuffle(bestOptions);

                possibleTerritoriesToAttack = bestOptions.concat(worstOptions);
            }

            console.log('Possible attack alternatives for AI', possibleTerritoriesToAttack);
            this.possibleTerritoriesToAttack = possibleTerritoriesToAttack;
            resolve();
        });
    }

    deployTroops(callback) {
        callback();

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
            console.log('territoryIndex', territoryIndex);

            const lastOption = territoryIndex >= this.possibleTerritoriesToAttack.length;

            territoryIndex = !lastOption ? territoryIndex : (this.possibleTerritoriesToAttack.length - 1);

            if (lastOption && chancePercentage(50)) {
                territoryIndex = 0; // Chance to reset index of deploy territories to start
            }

            const currentTerritoryToAttack = this.possibleTerritoriesToAttack[territoryIndex].territory;
            const playerControlledAdjacentTerritories = currentTerritoryToAttack.adjacentTerritories.map(x => getTerritoryByName(this.gameEngine.map, x))
                                                      .filter(x => x.owner === this.gameEngine.turn.player.name);
            playerControlledAdjacentTerritories.sort((a, b) => b.numberOfTroops - a.numberOfTroops);

            const selectedAdjacentTerritory = playerControlledAdjacentTerritories[0];
            const predictedAmountOfTroops = (selectedAdjacentTerritory.numberOfTroops + (selectedAdjacentTerritory.troopsToDeploy ? selectedAdjacentTerritory.troopsToDeploy : 0));

            if (predictedAmountOfTroops >= (currentTerritoryToAttack.numberOfTroops * 2)
                && predictedAmountOfTroops > 3) {

                if (!territoriesToDeploy.includes(selectedAdjacentTerritory)) {
                    selectedAdjacentTerritory.troopsToDeploy = 0;
                    selectedAdjacentTerritory.territoryToAttack = this.possibleTerritoriesToAttack[territoryIndex].territory;
                    territoriesToDeploy.push(selectedAdjacentTerritory);
                }

                if (troopsToDeploy < 3 || lastOption) {
                    territoriesToDeploy.find(x => x.name === selectedAdjacentTerritory.name).troopsToDeploy += troopsToDeploy;
                    troopsToDeploy = 0;
                } else {
                    territoryIndex++;
                }
            } else {
                if (!territoriesToDeploy.find(x => x.name === selectedAdjacentTerritory.name)) {
                    selectedAdjacentTerritory.troopsToDeploy = 1;
                    selectedAdjacentTerritory.territoryToAttack = this.possibleTerritoriesToAttack[territoryIndex].territory;
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
            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    $(`#svgMap .country[id="${territory.name}"]`).addClass('blink_me');
                    resolve();
                }, this.DELAY_BETWEEN_EACH_TROOP_DEPLOY * (promises.length + 1));
            }));

            totalIndex++;

            for (let i = 0; i < territory.troopsToDeploy; i++) {
                promises.push(createPromise(territory.name, totalIndex));
                totalIndex++;
            }

            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    $(`#svgMap .country[id="${territory.name}"]`).removeClass('blink_me');
                    resolve();
                }, this.DELAY_BETWEEN_EACH_TROOP_DEPLOY * (promises.length + 1));
            }));
        });
        this.territoriesToDeploy = territoriesToDeploy;
        return Promise.all(promises);
    }

    attackTerritories() {
        console.log('territoriesToDeploy', this.territoriesToDeploy);
        const battleHandler = new BattleHandler();

        const promises = [];
        let battleIndex = 0;

        this.territoriesToDeploy.forEach(territoryToDeploy => {

            const currentInvasion = {
                startingPosition: {
                    attackFrom: territoryToDeploy.name,
                    attackTo: territoryToDeploy.territoryToAttack.name,
                    attackingTroops: (territoryToDeploy.numberOfTroops - 1),
                    defendingTroops: territoryToDeploy.territoryToAttack.numberOfTroops
                },
                battles: []
            };

            while(currentInvasion.battles.length === 0 ||
                  (currentInvasion.battles[currentInvasion.battles.length - 1].attackingTroops > 0 &&
                   currentInvasion.battles[currentInvasion.battles.length - 1].defendingTroops > 0)) {

                const currentAttackingTroops = currentInvasion.battles.length > 0 ? currentInvasion.battles[currentInvasion.battles.length - 1].attackingTroops
                                                                                  : currentInvasion.startingPosition.attackingTroops;
                const currentDefendingTroops = currentInvasion.battles.length > 0 ? currentInvasion.battles[currentInvasion.battles.length - 1].defendingTroops
                                                                                  : currentInvasion.startingPosition.defendingTroops;

                const response = battleHandler.handleAttack({numberOfTroops: currentAttackingTroops}, {numberOfTroops: currentDefendingTroops});

                currentInvasion.battles.push({
                    response,
                    attackingTroops: currentAttackingTroops - response.attackerCasualties,
                    defendingTroops: currentDefendingTroops - response.defenderCasualties
                });
            }

            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    $(`#svgMap .country[id="${currentInvasion.startingPosition.attackFrom}"]`).addClass('blink_me');
                    $(`#svgMap .country[id="${currentInvasion.startingPosition.attackTo}"]`).addClass('blink_me');
                    resolve();
                }, this.DELAY_BETWEEN_EACH_BATTLE * (battleIndex + 1));
            }));

            battleIndex++;

            currentInvasion.battles.forEach(battle => {
                console.log(`AI Battle`);
                console.log(battle);

                const promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const attacker = getTerritoryByName(this.gameEngine.map, currentInvasion.startingPosition.attackFrom);
                        const defender = getTerritoryByName(this.gameEngine.map, currentInvasion.startingPosition.attackTo);

                        if (battle.defendingTroops === 0) {
                            const defeatedPlayer = defender.owner;
                            defender.owner = attacker.owner;
                            defender.numberOfTroops = battle.attackingTroops;
                            attacker.numberOfTroops = 1; // as of now, always move all troops

                            if (!this.gameEngine.turn.playerHasWonAnAttackThisTurn) {
                                this.soundService.cardSelect.play();
                            }
                            this.gameEngine.takeCard(attacker.owner);
                            this.updateCallback();

                            $(`#svgMap .country[id="${attacker.name}"]`).removeClass('blink_me');
                            $(`#svgMap .country[id="${defender.name}"]`).removeClass('blink_me');

                            const territories = getTerritoriesByOwner(this.gameEngine.map, defeatedPlayer);
                            if (territories.length === 0) {
                                // The losing player was defeated entirely
                                const resp = this.gameEngine.handleDefeatedPlayer(defeatedPlayer, attacker.owner, false);
                                if (resp.length > 0) {
                                    this.soundService.cardSelect.play();
                                }
                            }

                            const resp = this.gameEngine.checkIfPlayerWonTheGame();
                            if (resp.playerWon) {
                                reject('playerWon');
                            }
                        } else if (battle.attackingTroops === 0) {
                            defender.numberOfTroops = battle.defendingTroops;
                            attacker.numberOfTroops = 1;

                            $(`#svgMap .country[id="${attacker.name}"]`).removeClass('blink_me');
                            $(`#svgMap .country[id="${defender.name}"]`).removeClass('blink_me');
                        } else {
                            defender.numberOfTroops = battle.defendingTroops;
                            attacker.numberOfTroops = battle.attackingTroops + 1;
                        }

                        this.mapService.updateMap(this.gameEngine.filter);
                        this.soundService.diceRoll.play();

                        resolve();
                    }, (this.DELAY_BETWEEN_EACH_BATTLE * (battleIndex + 1)));
                });

                promises.push(promise);

                battleIndex++;
            });
        });

        return Promise.all(promises).then(() => {
            return this.contemplateAlternativesForAttack()
                    .then(() => {
                        // Determine if AI player should keep attacking
                        this.territoriesToDeploy = [];
                        this.possibleTerritoriesToAttack.forEach(t => {
                            let terr = t.territory.adjacentTerritories.find(y => {
                                const t = getTerritoryByName(this.gameEngine.map, y);
                                return t.owner === this.gameEngine.turn.player.name && t.numberOfTroops > 3;
                            });
                            if (terr) {
                                terr = getTerritoryByName(this.gameEngine.map, terr);
                                terr.territoryToAttack = t.territory;

                                if (!this.territoriesToDeploy.find(x => terr.name)) {
                                    this.territoriesToDeploy.push(terr);
                                }
                            }
                        });
                        if (this.territoriesToDeploy.length) {
                            return this.attackTerritories();
                        }
                    });
        });
    }

    movementPhase() {
        return new Promise((resolve, reject) => {
            // GET ALL TERRITORIES WITH MORE THAN ONE TROOP FROM WHICH THE PLAYER CAN MOVE TROOPS
            let territoriesByOwner = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
            territoriesByOwner = territoriesByOwner.filter(t => t.numberOfTroops > 1);

            if (!territoriesByOwner.length) {
                // IF NO TROOPS WITH MORE THAN ONE TROOP, NO MOVEMENT CAN BE DONE
                resolve();
            }

            let applicableMovements = [];

            // GET ALL POSSIBLE MOVEMENT COMBINATIONS FOR EACH TERRITORY
            territoriesByOwner.forEach(t => {
                const applicableTerritoriesForMovement = this.mapService.getTerritoriesForMovement(t);
                applicableTerritoriesForMovement.forEach(at => {
                    const to = getTerritoryByName(this.gameEngine.map ,at);
                    applicableMovements.push({
                        from: t,
                        to
                    })
                });
            });

            // DETERMINE WHICH MOVEMENTS TO TERRITORIES THAT DOES NOT HAVE BORDERS WITH AN ENEMY
            applicableMovements.forEach(m => {
                const territoryHasBorderWithEnemy = m.to.adjacentTerritories.find(x => {
                    const terr = getTerritoryByName(this.gameEngine.map, x);
                    return terr.owner !== this.gameEngine.turn.player.name;
                });
                m.territoryHasBorderWithEnemy = !!territoryHasBorderWithEnemy;
            });

            // DETERMINE HOW MANY ENEMY TROOPS BORDERS WITH EACH TO-TERRITORY
            applicableMovements.forEach(x => {
                const borderingTerritories = x.to.adjacentTerritories.map(y => getTerritoryByName(this.gameEngine.map, y))
                                                .filter(z => z.owner !== this.gameEngine.turn.player.name);
                const borderingTerritoriesWithMoreThanOneTroop = borderingTerritories.filter(x => x.numberOfTroops > 1).length;

                 x.totalBorderingTroops = borderingTerritories.length;
                 x.borderingTerritoriesWithMoreThanOneTroop = borderingTerritoriesWithMoreThanOneTroop;
            });

            // DETERMINE IF THE TO-TERRITORY IS IMPORTANT FOR HOLDING A REGION
            applicableMovements.forEach(x => {
                const territoriesInRegionAsArray = (region) => Array.from(region.territories.values());
                const regionsAsArray = Array.from(this.gameEngine.map.regions.values());
                const region = regionsAsArray.find(region => territoriesInRegionAsArray(region).find(t => t.name === x.to.name));

                const allTerritoriesInRegionBelongsToPlayer = territoriesInRegionAsArray(region).every(t => t.owner === this.gameEngine.turn.player.name);

                let territoryCanBeUsedToDefendControlledRegion = false;
                const adjacentTerritoriesControlledByPlayer = x.to.adjacentTerritories.map(y => getTerritoryByName(this.gameEngine.map, y))
                                                                .filter(at => at.owner === this.gameEngine.turn.player.name);

                let controlledRegion = allTerritoriesInRegionBelongsToPlayer ? region : undefined;

                adjacentTerritoriesControlledByPlayer.forEach(t => {
                    const currentRegion = regionsAsArray.find(region => territoriesInRegionAsArray(region).find(x => x.name === t.name));
                    const allTerritoriesInRegionBelongsToPlayer = territoriesInRegionAsArray(currentRegion).every(t => t.owner === this.gameEngine.turn.player.name);

                    if (allTerritoriesInRegionBelongsToPlayer) {
                        territoryCanBeUsedToDefendControlledRegion = true;
                        controlledRegion = currentRegion;
                    }
                });

                x.territoryIsFrontlineForControlledRegion = (allTerritoriesInRegionBelongsToPlayer || territoryCanBeUsedToDefendControlledRegion) && x.territoryHasBorderWithEnemy;
                x.controlledRegion = controlledRegion;
            });

            // DETERMINE IF A BORDERING ENEMY TERRITORY BELONGS TO A BIG THREAT
            const standings = this.calculateStandingsWithThreatPoints();

            applicableMovements.forEach(t => {
                if (t.territoryHasBorderWithEnemy) {
                    let totalBorderingThreat = 0;
                    let enemiesAtBorder = t.to.adjacentTerritories.map(x => getTerritoryByName(this.gameEngine.map, x))
                                            .filter(y => y.owner !== this.gameEngine.turn.player.name)
                                            .map(z => z.owner);
                    enemiesAtBorder = removeDuplicates(enemiesAtBorder);
                    enemiesAtBorder.forEach(x => {
                        totalBorderingThreat += standings.find(y => y.name === x).threatPoints;
                    });

                    t.totalBorderingThreat = totalBorderingThreat;
                } else {
                    t.totalBorderingThreat = 0;
                }
            });

            // DETERMINE IMPORTANCE SCORES BASED ON PREVIOUS DATA
            applicableMovements.forEach(x => {
                x.importance = 0;
                x.importance += x.territoryIsFrontlineForControlledRegion ? 5 : 0;
                x.importance += x.territoryHasBorderWithEnemy ? 3 : 0;
                x.importance += Math.floor(x.totalBorderingTroops / 2);
                x.importance += x.from.numberOfTroops;

                if (x.territoryIsFrontlineForControlledRegion) {
                    x.importance += Math.floor(x.controlledRegion.bonusTroops * 1.5);
                }

                if (x.territoryHasBorderWithEnemy) {
                    const playerThreatPoints = standings.find(x => x.name === this.gameEngine.turn.player.name).threatPoints;
                    x.importance += playerThreatPoints <= x.totalBorderingThreat ? 2 : 0;

                    if (playerThreatPoints <= x.totalBorderingThreat) {
                        x.importance += Math.floor(x.totalBorderingTroops / 3);
                    }
                }

                if (!x.territoryHasBorderWithEnemy && x.from.numberOfTroops >= 5) {
                    x.importance += 4;
                }
            });

            applicableMovements.sort((a, b) => b.importance - a.importance);
            console.log('applicableMovements', applicableMovements);

            let movementIndex = 0;

            if(this.gameEngine.turn.player.type === PLAYER_TYPES.AI_NORMAL) {
                const rnd = Math.floor((Math.random() * 4) + 1);
                movementIndex = applicableMovements[rnd] ? rnd : (applicableMovements.length - 1);
            }

            const movement = applicableMovements[movementIndex];

            const playerIsWeak = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name).length <= 3;
            const playerHasCard = this.gameEngine.turn.playerHasWonAnAttackThisTurn;
            const doNotKeepAttacking = playerIsWeak && playerHasCard;

            if (movement && movement.importance > 0 && !doNotKeepAttacking) {
                // Move
                setTimeout(() => {
                    const from = getTerritoryByName(this.gameEngine.map, movement.from.name);
                    const to = getTerritoryByName(this.gameEngine.map, movement.to.name);
                    to.numberOfTroops += (from.numberOfTroops - 1);
                    from.numberOfTroops = 1;

                    this.mapService.updateMap(this.gameEngine.filter);
                    this.soundService.movement.play();
                    resolve();
                }, this.DELAY_BEFORE_MOVE);
            } else {
                // No movement if only bad options exists
                resolve();
            }
        });
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
