import {getTerritoryByName, getTerritoriesByOwner} from './../map/mapHelpers';

export default class TutorialService {
    constructor(gameEngine, $uibModal, soundService) {
        this.gameEngine = gameEngine;
        this.$uibModal = $uibModal;
        this.soundService = soundService;
    }

    openingMessage() {
        return this.openTutorialPresenter([
            {
                message: 'Welcome to Risk!'
            },
            {
                message: 'This is a strategy game based on a classic board game. The objective of the game is to eliminate your opponents and taking over the world.',
                markup: 'This is a strategy game based on a classic board game. The objective of the game is to <strong>eliminate</strong> your opponents and taking over the world.'
            }
        ]);
    }

    phasesAndMapExplanation() {
        return this.openTutorialPresenter([
            {
                message: 'Risk is a turn based game. Each players turn can be broken down into three separate phases. Deployment, attack and movement phase.',
                markup: 'Risk is a turn based game. Each players turn can be broken down into three separate phases. <strong>Deployment</strong>, <strong>attack</strong> and <strong>movement</strong> phase.'
            },
            {
                message: 'The game board consists of a world map. The map can be divided into regions, or continents, and each region can be divided into territories.',
                markup: 'The game board consists of a world map. The map can be divided into <strong>regions</strong>, or continents, and each region can be divided into <strong>territories</strong>.',
            }
        ]);
    }

    deploymentPhaseExplanation() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        return this.openTutorialPresenter(
            [{
                message: `Right now it's ${currentPlayer}s turn, whose name is presented here. The first phase is the deployment phase in which the player can reinforce his territories with fresh troops.`,
                markup: `Right now it's <strong style="color: ${currentPlayerColor};">${currentPlayer}s</strong> turn, whose name is presented here. The first phase is the <strong>deployment phase</strong> in which the player can reinforce his territories with fresh troops.`
            }],
            () => {
                $('#playerName').addClass('animated infinite bounce');
            },
            () => {},
            1000
        );
    }

    deploymentIndicatorExplanation() {
        $('#playerName').removeClass('animated infinite bounce');

        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        return this.openTutorialPresenter(
            [{
                message: `Here you can see the amount of troops that ${currentPlayer} have to distribute between the different territories that he controls.`,
                markup: `Here you can see the amount of troops that <strong style="color: ${currentPlayerColor};">${currentPlayer}</strong> have to distribute between the different territories that he controls.`
            }],
            () => {
                $('#currentPhaseIndicator').addClass('animated infinite bounce');
            },
            () => {},
            1000
        );
    }

    reinforcementRulesExplanation() {
        $('#currentPhaseIndicator').removeClass('animated infinite bounce');

        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });

        return this.openTutorialPresenter(
            [{
                message: `${currentPlayer} have ${this.gameEngine.troopsToDeploy} reinforcing troops to deploy.`,
                markup: `<strong style="color: ${currentPlayerColor};">${currentPlayer}</strong> have ${this.gameEngine.troopsToDeploy} reinforcing troops to deploy.`
            },{
                message: `The amount of reinforcements is determined by how many territories the player controls. Also, if a player has control over an entire region then he will gain additional troops as a region bonus.`
            }]
        );
    }

    regionFilterExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `By changing the filter to region you can switch the colors of the map to color by regions. This way you can more easily determine which territories make up each region.`,
                markup: `By changing the filter to <strong>region</strong> you can switch the colors of the map to color by regions. This way you can more easily determine which <strong>territories</strong> make up each <strong>region</strong>.`,
            }],
            () => {
                $('#showByRegion').addClass('blink_me');
            },
            () => {
                $('#showByRegion').removeClass('blink_me');
                this.soundService.click.play();
            }
        );
    }

    ownerFilterExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `To view the map by territorial ownership again just press this button.`
            }],
            () => {
                $('#showByOwner').addClass('blink_me');
            },
            () => {
                $('#showByOwner').removeClass('blink_me');
                this.soundService.click.play();
            }
        );
    }

    reinforcementIntoTerritoryDemonstration() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });

        return this.openTutorialPresenter(
            [{
                message: `${currentPlayer} decides he wants to put all his reinforcements in ${territory.name}.`,
                markup: `<strong style="color: ${currentPlayerColor};">${currentPlayer}</strong> decides he wants to put all his reinforcements in ${territory.name}.`
            }],
            () => {
                $(`#svgMap .country[id="${territory.name}"]`).addClass('blink_me');
            },
            () => {
                $(`#svgMap .country[id="${territory.name}"]`).removeClass('blink_me');
            },
            1000
        );
    }

    goingForwardToAttackPhase() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });
        return this.openTutorialPresenter(
            [{
                message: `${territory.name} is now inhabited by ${territory.numberOfTroops} troops. Given he has no additional troops to deploy he can now skip to the next phase by pressing the next button.`,
                markup: `<strong>${territory.name}</strong> is now inhabited by <strong>${territory.numberOfTroops}</strong> troops. Given he has no additional troops to deploy he can now skip to the next phase by pressing the <strong>NEXT</strong> button.`
            }],
            () => {
                $('#nextButton').addClass('blink_me');
            },
            () => {
                $('#nextButton').removeClass('blink_me');
                this.soundService.click.play();
            },
            1000
        );
    }

    attackPhaseExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `This is the attack phase. In this phase you can invade and try to take over other territories to expand your empire.`
            }]
        );
    }

    readyToInvadeExplanation() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });
        let territoryToAttack = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        territoryToAttack = getTerritoryByName(this.gameEngine.map, territoryToAttack);
        const defenderColor = this.gameEngine.players.get(territoryToAttack.owner).color.mainColor;
        return this.openTutorialPresenter(
            [{
                message: `Since ${currentPlayer} have reinforced ${territory.name} with additional troops he is now ready to invade. Let's say he wants to invade ${territoryToAttack.name} which is currently owned by ${territoryToAttack.owner}. First click the region from where to attack to select it.`,
                markup: `Since <strong style="color: ${currentPlayerColor};">${currentPlayer}</strong> have reinforced ${territory.name} with additional troops he is now ready to invade. Let's say he wants to invade ${territoryToAttack.name} which is currently owned by <strong style="color: ${defenderColor};">${territoryToAttack.owner}</strong>. First click the region from where to attack to select it.`
            }],
            () => {},
            () => {},
            0,
            1000
        );
    }

    hightlightExplanation() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });
        let territoryToAttack = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        territoryToAttack = getTerritoryByName(this.gameEngine.map, territoryToAttack);
        return this.openTutorialPresenter(
            [{
                message: `As you can see, all of the adjacent territories that the player can attack from here are now highlighted. To invade ${territoryToAttack.name} from ${territory.name} simply click it.`,
                markup: `As you can see, all of the adjacent territories that the player can attack from here are now highlighted. To invade <strong>${territoryToAttack.name}</strong> from <strong>${territory.name}</strong> simply click it.`
            }],
            () => {},
            () => {
                this.soundService.click.play();
                this.gameEngine.setMusic('./audio/bgmusic_attack.mp3');
                this.gameEngine.setMusicVolume(0.1);
            }
        );
    }

    attackModalStart() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        });
        let territoryToAttack = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== currentPlayer);
        const clickedTerritory = getTerritoryByName(this.gameEngine.map, territoryToAttack);

        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'attackModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'attackModalController',
                controllerAs: 'attack',
                resolve: {
                    attackData: () => {
                        return {
                            territoryAttacked: clickedTerritory,
                            attackFrom: this.gameEngine.selectedTerritory,
                            attacker: this.gameEngine.players.get(this.gameEngine.selectedTerritory.owner),
                            defender: this.gameEngine.players.get(clickedTerritory.owner),
                            tutorialMode: true
                        }
                    }
                }
            }).result.then(closeResponse => {
                resolve(closeResponse);
            });
        });
    }

    attackModalExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `This is the attack screen. Here you can see both players involved in the invasion, the attacker and the defender. An invasion is determined by one or more battles.`
            }]
        );
    }

    attackModalFightExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `To fight a battle simply click this button so that both players rolls their dies.`
            }],
            () => {
                $('#fightButton').addClass('blink_me');
            },
            () => {
                $('#fightButton').removeClass('blink_me');
            }
        );
    }

    attackModalRetreatExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `Remember, if an invasion isn't going your way you can always retreat back with your remaining forces by pressing this button.`
            }],
            () => {
                $('#retreatButton').addClass('blink_me');
            },
            () => {
                $('#retreatButton').removeClass('blink_me');
            }
        );
    }

    startAttack(attackData) {
        return this.openTutorialPresenter(
            [{
                message: `Now the player ${attackData.attacker.name} is ready to attack ${attackData.defender.name} so he presses the fight-button which will initiate a dice roll.`,
                markup: `Now the player <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> is ready to attack <strong style="color: ${attackData.defender.color.mainColor};">${attackData.defender.name}</strong> so he presses the <strong>Fight</strong>-button which will initiate a dice roll.`
            }]
        );
    }

    afterAttack(attackData) {
        return this.openTutorialPresenter(
            [{
                message: `${attackData.attacker.name} has defeated ${attackData.defender.name} since he had the better dice rolls. ${attackData.attacker.name}'s best die is matched against ${attackData.defender.name}'s best die, and 6 beats 3. Therefore one defending troop was destroyed, which was all that ${attackData.defender.name} had. Since ${attackData.defender.name} has lost his only defending troop he loses the invasion and ${attackData.attacker.name} wins!`,
                markup: `<strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> has defeated <strong style="color: ${attackData.defender.color.mainColor};">${attackData.defender.name}</strong> since he had the better dice rolls. <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}'s</strong> best die is matched against <strong style="color: ${attackData.defender.color.mainColor}">${attackData.defender.name}'s</strong> best die, and 6 beats 3. Therefore one defending troop was destroyed, which was all that <strong style="color: ${attackData.defender.color.mainColor}">${attackData.defender.name}</strong> had. Since <strong style="color: ${attackData.defender.color.mainColor}">${attackData.defender.name}</strong> has lost his only defending troop he loses the invasion and <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> wins!`,
            }]
        );
    }

    afterAttack2(attackData) {
        return this.openTutorialPresenter(
            [{
                message: `If the defender ${attackData.defender.name} would have had at least 2 troops in the territory he would have been allowed to defend with 2 dies, this increasing his chances. Also keep in mind that the defender has an advantage, if both the attacker and the defender rolls the same value on each of their best rolls the defender wins.`,
                markup: `If the defender <strong style="color: ${attackData.defender.color.mainColor};">${attackData.defender.name}</strong> would have had at least 2 troops in the territory he would have been allowed to defend with 2 dies, this increasing his chances. Also keep in mind that the defender has an advantage, if both the attacker and the defender rolls the same value on each of their best rolls the defender wins.`
            }]
        );
    }

    moveAfterAttackExplanation(attackData) {
        return this.openTutorialPresenter(
            [{
                message: `Now that ${attackData.attacker.name} has won he can choose how many troops he wishes to transfer to the newly conquered territory, ${attackData.territoryAttacked.name}, by adjusting this slider.`,
                markup: `Now that <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> has won he can choose how many troops he wishes to transfer to the newly conquered territory, <strong>${attackData.territoryAttacked.name}</strong>, by adjusting this slider.`,
            }],
            () => {
                $('#sliderContainer').addClass('blink_me');
            },
            () => {
                $('#sliderContainer').removeClass('blink_me');
            }
        );
    }

    performMoveAfterAttack(attackData, attackerNumberOfTroops) {
        return this.openTutorialPresenter(
            [{
                message: `${attackData.attacker.name} wants to move ${attackerNumberOfTroops} troops to the newly conquered territory.`,
                markup: `<strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> wants to move <strong>${attackerNumberOfTroops}</strong> troops to the newly conquered territory.`,
            }]
        );
    }

    moveButtonExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `Now you simply click this move button to perform the move.`
            }],
            () => {
                $('#moveButton').addClass('blink_me');
            },
            () => {
                $('#moveButton').removeClass('blink_me');
            }
        );
    }

    cardExplanation() {
        const currentPlayer = this.gameEngine.turn.player.name;
        const currentPlayerColor = this.gameEngine.turn.player.color.mainColor;
        return this.openTutorialPresenter(
            [{
                message: `Now that ${currentPlayer} has won an invasion he has recieved a card. To view the cards that the current player has on hand simply click this button.`,
                markup: `Now that <strong style="color: ${currentPlayerColor};">${currentPlayer}</strong> has won an invasion he has recieved a card. To view the cards that the current player has on hand simply click this button.`
            }],
            () => {
                $('#cardButton').addClass('blink_me');
            }
        );
    }

    cardExplanation2() {
        return this.openTutorialPresenter(
            [{
                message: `If a player wins an invasion in his turn he will always gain a card. The cards can be used in the deployment phase to turn in for extra troops. However a player can only obtain a maximum of one card per turn regardless of how many territories he's conquered. Let's look at the card screen shall we?`,
                markup: `If a player wins an invasion in his turn he will always gain a card. The cards can be used in the <strong>Deployment</strong> phase to turn in for extra troops. However a player can only obtain a maximum of one card per turn regardless of how many territories he's conquered. Let's look at the card screen shall we?`
            }],
            () => {},
            () => {
                $('#cardButton').removeClass('blink_me');
            }
        );
    }

    openCardModal() {
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'cardTurnInModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'cardTurnInModalController',
                controllerAs: 'cardTurnIn',
                resolve: {
                    data: () => {
                        return {
                            type: 'tutorial'
                        }
                    }
                }
            }).result.then(closeResponse => {
                if (closeResponse && closeResponse.newTroops) {
                    console.log(`Cards turned in for ${closeResponse.newTroops} new troops`);
                    $('#mainTroopIndicator').addClass('animated infinite bounce');
                    this.soundService.cardTurnIn.play();
                    this.gameEngine.troopsToDeploy += closeResponse.newTroops;
                    this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                    setTimeout(() => {
                        this.$scope.$apply();
                    }, 100);
                    setTimeout(() => {
                        $('#mainTroopIndicator').removeClass('animated infinite bounce');
                    }, 1000);
                }
                resolve();
            });
        });
    }

    cardModalOpenExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `In this screen we can see all the cards that the player has on hand at the moment. Since he won the previous invasion he now has one card.`
            }]
        );
    }

    cardModalOpenExplanation2() {
        return this.openTutorialPresenter(
            [{
                message: `Down here you can see the available combinations that you can turn in. Also remember that there are wild cards which can be used as a replacement as any other card type. Since our current player only has one card and since this isn't the deployment phase, he cannot do anything at the moment. Therefore we close the card screen instead.`
            }],
            () => {
                $('.cardTurnInCombinations').addClass('blink_me');
            },
            () => {
                $('.cardTurnInCombinations').removeClass('blink_me');
            }
        );
    }

    openTutorialPresenter(messages, beforeSpeech = null, afterSpeech = null, delayBefore = null, delayAfter = null) {
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'turnPresentationModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'turnPresentationController',
                controllerAs: 'turnPresentation',
                resolve: {
                    data: () => {
                        return {
                            type: 'tutorial',
                            messages,
                            beforeSpeech,
                            afterSpeech,
                            delayBefore,
                            delayAfter
                        };
                    }
                }
            }).result.then(closeResponse => {
                resolve();
            });
        });
    }
}
