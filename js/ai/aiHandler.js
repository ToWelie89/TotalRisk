const { getBestPossibleCombination } = require('./../card/cardHelpers');
const { getTerritoriesInRegionByOwner, getTerritoryByName, getTerritoriesByOwner, getCurrentOwnershipStandings, getTerritoriesForMovement } = require('./../map/mapHelpers');
const { allValuesInArrayAreEqual, removeDuplicates, chancePercentage, shuffle } = require('./../helpers');
const BattleHandler = require('./../attack/battleHandler');
const { PLAYER_TYPES } = require('./../player/playerConstants');
const { displayDamageNumbers, displayReinforcementNumbers } = require('./../animations/animations');
const { clearArrow, setArrowBetweenTerritories } = require('./../map/mapArrow');
const { GAME_PHASES } = require('./../gameConstants');

class AiHandler {
    constructor($rootScope, gameEngine, soundService, mapService, settings) {
        this.$rootScope = $rootScope;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.mapService = mapService;
        this.settings = settings;
    }

    update() {
        if (this.gameEngine.aiTesting) {
            this.DELAY_BETWEEN_EACH_TROOP_DEPLOY = 1;
            this.DELAY_BETWEEN_EACH_BATTLE = 1;
            this.DELAY_BEFORE_MOVE = 1;
        } else {
            this.DELAY_BETWEEN_EACH_TROOP_DEPLOY = this.settings.aiSpeedValues[this.settings.aiSpeed];
            this.DELAY_BETWEEN_EACH_BATTLE = this.settings.aiSpeedValues[this.settings.aiSpeed];
            this.DELAY_BEFORE_MOVE = this.settings.aiSpeedValues[this.settings.aiSpeed];
        }
    }

    turnInCards(callback = () => {}) {
        return new Promise(resolve => {
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

                if (this.gameEngine.aiTesting) {
                    if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                        this.soundService.cardTurnIn.play();
                    }

                    this.gameEngine.troopsToDeploy += bestCombo.value;
                    this.updateCallback();
                    resolve();
                } else {
                    if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                        $('.mainTroopIndicator').addClass('animated infinite bounce');
                        this.soundService.cardTurnIn.play();
                    }
                    this.gameEngine.troopsToDeploy += bestCombo.value;

                    this.updateCallback();

                    if (this.multiplayerMode) {
                        callback(
                            this.gameEngine.turn.player.userUid,
                            this.gameEngine.turn.player.cards.map(c => ({
                                territoryName: c.territoryName,
                                cardType: c.cardType,
                                regionName: c.regionName})),
                            bestCombo.value
                        );
                    }

                    setTimeout(() => {
                        resolve();
                        if (!this.multiplayerMode) {
                            $('.mainTroopIndicator').removeClass('animated infinite bounce');
                        }
                    }, 1000);
                }

                // Update stats
                this.gameEngine.players.get(this.gameEngine.turn.player.name).statistics.cardCombinationsUsed += 1;
            } else {
                resolve();
            }
        });
    }

    contemplateAlternativesForAttack() {
        return new Promise(resolve => {
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
                territory.closeToCaptureRegion = ((totalTerritoriesInRegionOwnedByPlayer.length / totalTerritoriesInRegion.length * 100) >= this.gameEngine.turn.player.aiValues.closeToCaptureRegionPercentage);

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
                territory.valuePoints += territory.opportunityToEliminatePlayer ? this.gameEngine.turn.player.aiValues.opportunityToEliminatePlayer : 0;
                territory.valuePoints += territory.belongsToBigThreat ? this.gameEngine.turn.player.aiValues.belongsToBigThreat : 0;
                territory.valuePoints += territory.mostTroopsInThisRegion ? this.gameEngine.turn.player.aiValues.mostTroopsInThisRegion : 0;
                territory.valuePoints += territory.closeToCaptureRegion ? this.gameEngine.turn.player.aiValues.closeToCaptureRegion : 0;
                territory.valuePoints += territory.canBeAttackedToBreakUpRegion ? this.gameEngine.turn.player.aiValues.canBeAttackedToBreakUpRegion : 0;
                territory.valuePoints += territory.lastTerritoryLeftInRegion ? this.gameEngine.turn.player.aiValues.lastTerritoryLeftInRegion : 0;

                if (territory.mostTroopsInThisRegion || territory.closeToCaptureRegion) {
                    territory.valuePoints += Math.floor(region.bonusTroops * this.gameEngine.turn.player.aiValues.bonusTroopsForRegionMultiplier);
                }

                const ownerThreatPoints = standings.find(x => x.name === territory.territory.owner).threatPoints;
                const playerThreatPoints = standings.find(x => x.name === this.gameEngine.turn.player.name).threatPoints;

                if (ownerThreatPoints >= (playerThreatPoints * this.gameEngine.turn.player.aiValues.bigThreatMultiplier)) {
                    territory.valuePoints += territory.canBeAttackedToBreakUpRegion ? this.gameEngine.turn.player.aiValues.extraPointsForBreakUpRegionForBigThreat : 0;
                }

                /*if (this.gameEngine.turn.player.type === PLAYER_TYPES.AI_NORMAL) {
                    if (chancePercentage(50)) {
                        territory.valuePoints += Math.floor((Math.random() * 3) + 1);
                    } else {
                        territory.valuePoints -= Math.floor((Math.random() * 3) + 1);
                    }
                }*/
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

            // console.log('Possible attack alternatives for AI', possibleTerritoriesToAttack);
            this.possibleTerritoriesToAttack = possibleTerritoriesToAttack;
            resolve();
        });
    }

    deployTroops(callback) {
        if (!this.multiplayerMode) {
            callback();
        }

        // Update stats
        this.gameEngine.players.get(this.gameEngine.turn.player.name).statistics.totalReinforcements += this.gameEngine.troopsToDeploy;

        let delay = this.DELAY_BETWEEN_EACH_TROOP_DEPLOY;
        if (delay >= 600 && this.gameEngine.troopsToDeploy >= 12) {
            delay = 200;
        }

        const createPromise = (territoryName, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.gameEngine.addTroopToTerritory(territoryName);
                    
                    if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                        this.mapService.updateMap(this.gameEngine.filter, true);
                        this.soundService.addTroopSound.play();
                        displayReinforcementNumbers(this.gameEngine.mapSelector, territoryName);
                    }

                    if (this.multiplayerMode) {
                        callback(territoryName);
                    } else {
                        callback();
                    }
                    resolve();
                }, (delay * (index + 1)));
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

            if (playerControlledAdjacentTerritories.length > 0) {
                const selectedAdjacentTerritory = playerControlledAdjacentTerritories[0];
                const predictedAmountOfTroops = (selectedAdjacentTerritory.numberOfTroops + (selectedAdjacentTerritory.troopsToDeploy ? selectedAdjacentTerritory.troopsToDeploy : 0));

                if (predictedAmountOfTroops >= (currentTerritoryToAttack.numberOfTroops * 2)
                    && predictedAmountOfTroops > 3) {

                    if (!territoriesToDeploy.includes(selectedAdjacentTerritory)) {
                        selectedAdjacentTerritory.troopsToDeploy = 0;
                        selectedAdjacentTerritory.territoryToAttack = Object.assign({}, this.possibleTerritoriesToAttack[territoryIndex].territory);
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
                        selectedAdjacentTerritory.territoryToAttack = Object.assign({}, this.possibleTerritoriesToAttack[territoryIndex].territory);
                        territoriesToDeploy.push(selectedAdjacentTerritory);
                    } else {
                        territoriesToDeploy.find(x => x.name === selectedAdjacentTerritory.name).troopsToDeploy++;
                    }
                    troopsToDeploy--;
                }
            } else {
                territoryIndex = 0;
            }
        }

        console.log('Territories to be deployed to by AI', territoriesToDeploy);

        let totalIndex = 0;
        const promises = [];
        let lastTerritory;
        territoriesToDeploy.forEach(territory => {
            if (lastTerritory !== territory) {
                promises.push(new Promise(resolve => {
                    setTimeout(() => {
                        if (!this.multiplayerMode) {
                            if (territory.troopsToDeploy > 0) {
                                $(`#svgMap .country[id="${territory.name}"]`).addClass('highlighted');
                            }
                        } else {
                            if (territory.troopsToDeploy > 0) {
                                this.setHighlighted(territory.name);
                            }
                        }
                        resolve();
                    }, delay * (promises.length + 1));
                }));
                totalIndex++;
            }
            
            lastTerritory = territory;

            for (let i = 0; i < territory.troopsToDeploy; i++) {
                promises.push(createPromise(territory.name, totalIndex));
                totalIndex++;
            }

            promises.push(new Promise(resolve => {
                setTimeout(() => {
                    if (!this.multiplayerMode) {
                        $(`#svgMap .country[id="${territory.name}"]`).removeClass('highlighted');
                    } else {
                        this.removeHighlighted(territory.name);
                    }
                    resolve();
                }, delay * (promises.length + 1));
            }));
            totalIndex++;
        });
        this.territoriesToDeploy = territoriesToDeploy;
        return Promise.all(promises);
    }

    attackTerritories(callback = () => {}, takeCardCallback = () => {}) {
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

                const currentAttackingTroops = currentInvasion.battles.length > 0
                    ? currentInvasion.battles[currentInvasion.battles.length - 1].attackingTroops
                    : currentInvasion.startingPosition.attackingTroops;
                const currentDefendingTroops = currentInvasion.battles.length > 0
                    ? currentInvasion.battles[currentInvasion.battles.length - 1].defendingTroops
                    : currentInvasion.startingPosition.defendingTroops;

                const response = battleHandler.handleAttack({numberOfTroops: currentAttackingTroops}, {numberOfTroops: currentDefendingTroops});

                currentInvasion.battles.push({
                    response,
                    attackingTroops: currentAttackingTroops - response.attackerCasualties,
                    attackerCasualties: response.attackerCasualties,
                    defendingTroops: currentDefendingTroops - response.defenderCasualties,
                    defenderCasualties: response.defenderCasualties
                });
            }

            promises.push(new Promise(resolve => {
                setTimeout(() => {
                    if (!this.multiplayerMode) {
                        setArrowBetweenTerritories(this.gameEngine.mapSelector, territoryToDeploy.name, territoryToDeploy.territoryToAttack.name, 'attackArrow');
                        $(`#svgMap .country[id="${currentInvasion.startingPosition.attackFrom}"]`).addClass('highlighted');
                        $(`#svgMap .country[id="${currentInvasion.startingPosition.attackTo}"]`).addClass('highlighted');
                    } else {
                        this.setArrow(territoryToDeploy.name, territoryToDeploy.territoryToAttack.name, 'attackArrow');
                        this.setHighlighted(currentInvasion.startingPosition.attackFrom);
                        this.setHighlighted(currentInvasion.startingPosition.attackTo);
                    }
                    resolve();
                }, this.DELAY_BETWEEN_EACH_BATTLE * (battleIndex + 1));
            }));

            battleIndex++;

            currentInvasion.battles.forEach(battle => {
                console.log('AI Battle');
                console.log(battle);

                const promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const attacker = getTerritoryByName(this.gameEngine.map, currentInvasion.startingPosition.attackFrom);
                        const defender = getTerritoryByName(this.gameEngine.map, currentInvasion.startingPosition.attackTo);

                        if (!this.multiplayerMode) {
                            if (battle.attackerCasualties > 0) {
                                displayDamageNumbers(this.gameEngine.mapSelector, attacker.name, battle.attackerCasualties);
                            }
                            if (battle.defenderCasualties > 0) {
                                displayDamageNumbers(this.gameEngine.mapSelector, defender.name, battle.defenderCasualties);
                            }
                        }

                        if (battle.defendingTroops === 0) {
                            const defeatedPlayer = defender.owner;
                            defender.owner = attacker.owner;
                            defender.numberOfTroops = battle.attackingTroops;
                            attacker.numberOfTroops = 1; // as of now, always move all troops

                            if (!this.gameEngine.turn.playerHasWonAnAttackThisTurn) {
                                this.gameEngine.takeCard(attacker.owner);

                                if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                                    this.soundService.cardSelect.play();
                                } else {
                                    takeCardCallback(
                                        this.gameEngine.players.get(this.gameEngine.turn.player.name).userUid,
                                        this.gameEngine.players.get(this.gameEngine.turn.player.name).cards.map(c => ({
                                            territoryName: c.territoryName,
                                            cardType: c.cardType,
                                            regionName: c.regionName
                                        }))
                                    );
                                }
                            }
                            this.updateCallback();

                            if (!this.multiplayerMode) {
                                clearArrow(this.gameEngine.mapSelector);
                                $(`#svgMap .country[id="${attacker.name}"]`).removeClass('highlighted');
                                $(`#svgMap .country[id="${defender.name}"]`).removeClass('highlighted');
                            } else {
                                this.clearArrow();
                                this.removeHighlighted(attacker.name);
                                this.removeHighlighted(defender.name);
                            }

                            const territories = getTerritoriesByOwner(this.gameEngine.map, defeatedPlayer);
                            if (territories.length === 0) {
                                // The losing player was defeated entirely
                                const resp = this.gameEngine.handleDefeatedPlayer(defeatedPlayer, attacker.owner, false);
                                if (resp.length > 0 && !this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                                    this.soundService.cardSelect.play();
                                }
                            }

                            // Update stats
                            this.gameEngine.players.get(attacker.owner).statistics.battlesWon += 1;
                            this.gameEngine.players.get(defender.owner).statistics.battlesLost += 1;

                            const resp = this.gameEngine.checkIfPlayerWonTheGame();
                            if (resp.playerWon) {
                                reject('playerWon');
                            }
                        } else if (battle.attackingTroops === 0) {
                            defender.numberOfTroops = battle.defendingTroops;
                            attacker.numberOfTroops = 1;

                            if (!this.multiplayerMode) {
                                clearArrow(this.gameEngine.mapSelector);
                                $(`#svgMap .country[id="${attacker.name}"]`).removeClass('highlighted');
                                $(`#svgMap .country[id="${defender.name}"]`).removeClass('highlighted');
                            } else {
                                this.clearArrow();
                                this.removeHighlighted(attacker.name);
                                this.removeHighlighted(defender.name);
                            }

                            // Update stats
                            this.gameEngine.players.get(attacker.owner).statistics.battlesLost += 1;
                            this.gameEngine.players.get(defender.owner).statistics.battlesWon += 1;
                        } else {
                            defender.numberOfTroops = battle.defendingTroops;
                            attacker.numberOfTroops = battle.attackingTroops + 1;
                        }

                        this.mapService.updateMap(this.gameEngine.filter, true);
                        if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                            this.soundService.muskets.play();
                        }

                        // Update stats
                        this.gameEngine.players.get(attacker.owner).statistics.troopsKilled += battle.response.defenderCasualties;
                        this.gameEngine.players.get(attacker.owner).statistics.troopsLost += battle.response.attackerCasualties;
                        this.gameEngine.players.get(defender.owner).statistics.troopsKilled += battle.response.attackerCasualties;
                        this.gameEngine.players.get(attacker.owner).statistics.troopsLost += battle.response.defenderCasualties;

                        if (this.multiplayerMode) {
                            callback({
                                attackerTerritory: attacker.name,
                                defenderTerritory: defender.name,
                                attackerCasualties: battle.response.attackerCasualties,
                                defenderCasualties: battle.response.defenderCasualties,
                                attackerNumberOfTroops: battle.attackingTroops,
                                defenderNumberOfTroops: battle.defendingTroops,
                            });
                        } else {
                            callback();
                        }

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

                            if (!this.territoriesToDeploy.find(x => x.name === terr.name)) {
                                this.territoriesToDeploy.push(terr);
                            }
                        }
                    });
                    if (this.territoriesToDeploy.length) {
                        return this.attackTerritories(callback);
                    }
                });
        });
    }

    movementPhase() {
        return new Promise(resolve => {
            // GET ALL TERRITORIES WITH MORE THAN ONE TROOP = require(WHICH THE PLAYER CAN MOVE TROOPS
            let territoriesByOwner = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
            territoriesByOwner = territoriesByOwner.filter(t => t.numberOfTroops > 1);

            if (!territoriesByOwner.length) {
                // IF NO TROOPS WITH MORE THAN ONE TROOP, NO MOVEMENT CAN BE DONE
                resolve();
            }

            let applicableMovements = [];

            // GET ALL POSSIBLE MOVEMENT COMBINATIONS FOR EACH TERRITORY
            territoriesByOwner.forEach(t => {
                const applicableTerritoriesForMovement = getTerritoriesForMovement(t, this.gameEngine.map);
                applicableTerritoriesForMovement.forEach(at => {
                    const to = getTerritoryByName(this.gameEngine.map, at);
                    applicableMovements.push({
                        from: t,
                        to
                    });
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
                x.importance += x.territoryIsFrontlineForControlledRegion ? this.gameEngine.turn.player.aiValues.movementTerritoryIsFrontlineForControlledRegion : 0;
                x.importance += x.territoryHasBorderWithEnemy ? this.gameEngine.turn.player.aiValues.movementTerritoryHasBorderWithEnemy : 0;
                x.importance += Math.floor(x.totalBorderingTroops * this.gameEngine.turn.player.aiValues.movmentTotalBorderingTroopsMultiplier);
                x.importance += x.from.numberOfTroops;

                if (x.territoryIsFrontlineForControlledRegion) {
                    x.importance += Math.floor(x.controlledRegion.bonusTroops * this.gameEngine.turn.player.aiValues.movementTerritoryIsFrontlineRegionBonusTroopsMultiplier);
                }

                if (x.territoryHasBorderWithEnemy) {
                    const playerThreatPoints = standings.find(x => x.name === this.gameEngine.turn.player.name).threatPoints;
                    x.importance += playerThreatPoints <= x.totalBorderingThreat ? this.gameEngine.turn.player.aiValues.movementPlayerThreatPointsLessThanTotalBordering : 0;

                    if (playerThreatPoints <= x.totalBorderingThreat) {
                        x.importance += Math.floor(x.totalBorderingTroops * this.gameEngine.turn.player.aiValues.movementPlayerThreatPointsLessThanTotalBorderingTroopMultiplier);
                    }
                }

                if (!x.territoryHasBorderWithEnemy && x.from.numberOfTroops >= this.gameEngine.turn.player.aiValues.movementTerritoryWithSafeBordersAmountOfTroops) {
                    x.importance += this.gameEngine.turn.player.aiValues.movementTerritoryWithSafeBordersExtraTroops;
                }
            });

            applicableMovements.sort((a, b) => b.importance - a.importance);
            let movementIndex = 0;

            /*if(this.gameEngine.turn.player.type === PLAYER_TYPES.AI_NORMAL) {
                const rnd = Math.floor((Math.random() * 4) + 1);
                movementIndex = applicableMovements[rnd] ? rnd : (applicableMovements.length - 1);
            }*/

            const movement = applicableMovements[movementIndex];

            const playerIsWeak = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name).length <= 3;
            const playerHasCard = this.gameEngine.turn.playerHasWonAnAttackThisTurn;
            const doNotKeepAttacking = playerIsWeak && playerHasCard;

            if (movement && movement.importance > 0 && !doNotKeepAttacking) {
                if (!this.multiplayerMode) {
                    setArrowBetweenTerritories(this.gameEngine.mapSelector, movement.from.name, movement.to.name, 'movementArrow');
                } else {
                    this.setArrow(movement.from.name, movement.to.name, 'movementArrow');
                }
                // Move
                setTimeout(() => {
                    const from = getTerritoryByName(this.gameEngine.map, movement.from.name);
                    const to = getTerritoryByName(this.gameEngine.map, movement.to.name);
                    to.numberOfTroops += (from.numberOfTroops - 1);
                    from.numberOfTroops = 1;

                    this.mapService.updateMap(this.gameEngine.filter);
                    if (!this.multiplayerMode && this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                        this.soundService.movement.play();
                        clearArrow(this.gameEngine.mapSelector);
                    } else {
                        this.clearArrow();
                    }
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

module.exports = AiHandler;