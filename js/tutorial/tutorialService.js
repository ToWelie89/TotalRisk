const {getTerritoryByName, getTerritoriesByOwner} = require('./../map/mapHelpers');
const {MUSIC_VOLUME_DURING_TUTORIAL, GAME_PHASES} = require('./../gameConstants');

class TutorialService {
    constructor(gameEngine, $uibModal, soundService, $rootScope) {
        this.gameEngine = gameEngine;
        this.$uibModal = $uibModal;
        this.soundService = soundService;
        this.$rootScope = $rootScope;
    }

    initTutorialData() {
        this.currentPlayerName = this.gameEngine.turn.player.name;
        this.currentPlayerPronunciation = this.gameEngine.turn.player.avatar.pronounciation ? this.gameEngine.turn.player.avatar.pronounciation : this.gameEngine.turn.player.name;
        this.currentPlayerColor = this.gameEngine.turn.player.color.mainColor

        const territories = getTerritoriesByOwner(this.gameEngine.map, this.gameEngine.turn.player.name);
        const territory = territories.find(terr => {
            return terr.adjacentTerritories.some(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== this.currentPlayerName);
        });
        this.territoryToAttackFrom = territory;

        let territoryToAttack = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner !== this.currentPlayerName);
        territoryToAttack = getTerritoryByName(this.gameEngine.map, territoryToAttack);
        this.territoryToAttack = territoryToAttack;

        let territoryToMoveTo = territory.adjacentTerritories.find(adjTerr => getTerritoryByName(this.gameEngine.map, adjTerr).owner === this.currentPlayerName);
        territoryToMoveTo = getTerritoryByName(this.gameEngine.map, territoryToAttack);
        this.territoryToMoveTo = territoryToMoveTo;

        this.defenderColor = this.gameEngine.players.get(territoryToAttack.owner).color.mainColor;
    }

    /*
        TUTORIAL STEPS
     */

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
        return this.openTutorialPresenter(
            [{
                message: `Right now it's ${this.currentPlayerPronunciation}s turn, whose name is presented here. The first phase is the deployment phase in which the player can reinforce his territories with fresh troops.`,
                markup: `Right now it's <strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}s</strong> turn, whose name is presented here. The first phase is the <strong>deployment phase</strong> in which the player can reinforce his territories with fresh troops.`
            }],
            () => {
                $('#tutorialContainer #playerName').addClass('animated infinite bounce');
                /*zoom.to({
                    x: 350,
                    y: 200,
                    scale: 3
                });*/
            },
            () => {},
            1000
        );
    }

    deploymentIndicatorExplanation() {
        $('#tutorialContainer #playerName').removeClass('animated infinite bounce');
        //zoom.out();

        return this.openTutorialPresenter(
            [{
                message: `Here you can see the amount of troops that ${this.currentPlayerPronunciation} have to distribute between the different territories that he controls.`,
                markup: `Here you can see the amount of troops that <strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> have to distribute between the different territories that he controls.`
            }],
            () => {
                $('#tutorialContainer #currentPhaseIndicator').addClass('animated infinite bounce');
            },
            () => {},
            1000
        );
    }

    reinforcementRulesExplanation() {
        $('#tutorialContainer #currentPhaseIndicator').removeClass('animated infinite bounce');

        return this.openTutorialPresenter(
            [{
                message: `${this.currentPlayerPronunciation} have ${this.gameEngine.troopsToDeploy} reinforcing troops to deploy.`,
                markup: `<strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> have ${this.gameEngine.troopsToDeploy} reinforcing troops to deploy.`
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
                $('#tutorialContainer #showByRegion').addClass('blink_me');
            },
            () => {
                $('#tutorialContainer #showByRegion').removeClass('blink_me');
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
                $('#tutorialContainer #showByOwner').addClass('blink_me');
            },
            () => {
                $('#tutorialContainer #showByOwner').removeClass('blink_me');
                this.soundService.click.play();
            }
        );
    }

    reinforcementIntoTerritoryDemonstration() {
        return this.openTutorialPresenter(
            [{
                message: `${this.currentPlayerPronunciation} decides he wants to put all his reinforcements in ${this.territoryToAttackFrom.name}.`,
                markup: `<strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> decides he wants to put all his reinforcements in ${this.territoryToAttackFrom.name}.`
            }],
            () => {
                $(`#tutorialContainer #svgMap .country[id="${this.territoryToAttackFrom.name}"]`).addClass('blink_me');
            },
            () => {
                $(`#tutorialContainer #svgMap .country[id="${this.territoryToAttackFrom.name}"]`).removeClass('blink_me');
            },
            1000
        );
    }

    goingForwardToAttackPhase() {
        return this.openTutorialPresenter(
            [{
                message: `${this.territoryToAttackFrom.name} is now inhabited by ${this.territoryToAttackFrom.numberOfTroops} troops. Given he has no additional troops to deploy he can now skip to the next phase by pressing the next button.`,
                markup: `<strong>${this.territoryToAttackFrom.name}</strong> is now inhabited by <strong>${this.territoryToAttackFrom.numberOfTroops}</strong> troops. Given he has no additional troops to deploy he can now skip to the next phase by pressing the <strong>NEXT</strong> button.`
            }],
            () => {
                $('#tutorialContainer #nextButton').addClass('blink_me');
            },
            () => {
                $('#tutorialContainer #nextButton').removeClass('blink_me');
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
        return this.openTutorialPresenter(
            [{
                message: `Since ${this.currentPlayerPronunciation} have reinforced ${this.territoryToAttackFrom.name} with additional troops he is now ready to invade. Let's say he wants to invade ${this.territoryToAttack.name} which is currently owned by ${this.territoryToAttack.owner}. First click the region from where to attack to select it.`,
                markup: `Since <strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> have reinforced ${this.territoryToAttackFrom.name} with additional troops he is now ready to invade. Let's say he wants to invade ${this.territoryToAttack.name} which is currently owned by <strong style="color: ${this.defenderColor};">${this.territoryToAttack.owner}</strong>. First click the region from where to attack to select it.`
            }],
            () => {},
            () => {},
            0,
            1000
        );
    }

    hightlightExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `As you can see, all of the adjacent territories that the player can attack from here are now highlighted. To invade ${this.territoryToAttack.name} from ${this.territoryToAttackFrom.name} simply click it.`,
                markup: `As you can see, all of the adjacent territories that the player can attack from here are now highlighted. To invade <strong>${this.territoryToAttack.name}</strong> from <strong>${this.territoryToAttackFrom.name}</strong> simply click it.`
            }],
            () => {},
            () => {
                this.soundService.click.play();
                this.gameEngine.setMusic('./audio/bgmusic_attack.mp3');
                this.gameEngine.setMusicVolume(MUSIC_VOLUME_DURING_TUTORIAL);
            }
        );
    }

    attackModalStart() {
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'src/modals/attackModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'attackModalController',
                controllerAs: 'attack',
                keyboard: false,
                resolve: {
                    attackData: () => {
                        return {
                            territoryAttacked: this.territoryToAttack,
                            attackFrom: this.gameEngine.selectedTerritory,
                            attacker: this.gameEngine.players.get(this.gameEngine.selectedTerritory.owner),
                            defender: this.gameEngine.players.get(this.territoryToAttack.owner),
                            tutorialMode: true
                        }
                    }
                }
            }).result.then(closeResponse => {
                this.territoryToAttackFrom.numberOfTroops = 1;
                this.territoryToAttack.owner = this.territoryToAttackFrom.owner;
                this.territoryToAttack.numberOfTroops = 3;
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
                message: `Now that ${attackData.attacker.name} has won he can choose how many troops he wishes to transfer to the newly conquered territory. You must always transfer a minimum of 3 troops though. Since ${attackData.attacker.name} only has 3 troops in this invasion all three are automatically moved after the battle.`,
                markup: `Now that <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> has won he can choose how many troops he wishes to transfer to the newly conquered territory. You must always transfer a minimum of 3 troops though. Since <strong style="color: ${attackData.attacker.color.mainColor}">${attackData.attacker.name}</strong> only has 3 troops in this invasion all three are automatically moved after the battle.`,
            }]
        );
    }

    cardExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `Now that ${this.currentPlayerPronunciation} has won an invasion he has recieved a card. To view the cards that the current player has on hand simply click this button.`,
                markup: `Now that <strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> has won an invasion he has recieved a card. To view the cards that the current player has on hand simply click this button.`
            }],
            () => {
                $('#tutorialContainer #cardButton').addClass('blink_me');
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
                $('#tutorialContainer #cardButton').removeClass('blink_me');
            }
        );
    }

    openCardModal() {
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'src/modals/cardTurnInModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'cardTurnInModalController',
                controllerAs: 'cardTurnIn',
                keyboard: false,
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
                    $('.mainTroopIndicator').addClass('animated infinite bounce');
                    this.soundService.cardTurnIn.play();
                    this.gameEngine.troopsToDeploy += closeResponse.newTroops;
                    this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                    setTimeout(() => {
                        this.$scope.$apply();
                    }, 100);
                    setTimeout(() => {
                        $('#tutorialContainer .mainTroopIndicator').removeClass('animated infinite bounce');
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

    endOfAttackPhase() {
        return this.openTutorialPresenter(
            [{
                message: `During the attack phase a player can keep attacking for as long as he wants. Now that ${this.currentPlayerPronunciation} has taken over ${this.territoryToAttack.name} and moved forces there he can keep invading new territories from there if he wants. When the player feels he is done he can end the attack phase by pressing the next-button.`,
                markup: `During the attack phase a player can keep attacking for as long as he wants. Now that <strong style="color: ${this.currentPlayerColor};">${this.currentPlayerName}</strong> has taken over ${this.territoryToAttack.name} and moved forces there he can keep invading new territories from there if he wants. When the player feels he is done he can end the attack phase by pressing the <strong>NEXT</strong> button.`,
            }],
            () => {
                $('#tutorialContainer #nextButton').addClass('blink_me');
            },
            () => {
                $('#tutorialContainer #nextButton').removeClass('blink_me');
                this.soundService.click.play();
            }
        );
    }

    startOfMovementPhase() {
        return this.openTutorialPresenter(
            [{
                message: `This is the last phase of a players turn, the movement phase. In this phase the players get to make one strategic movement of troops from one territory to another. Both territories must be connected but not necessarily directly adjacent.`
            }]
        );
    }

    startOfMovementPhase2() {
        return this.openTutorialPresenter(
            [{
                message: `Let's say the player changes his mind and wants to move 1 troop back from ${this.territoryToAttack.name} to ${this.territoryToAttackFrom.name}. To perform a movement, first select the territory to move from.`,
                markup: `Let's say the player changes his mind and wants to move 1 troop back from <strong>${this.territoryToAttack.name}</strong> to <strong>${this.territoryToAttackFrom.name}</strong>. To perform a movement, first select the territory to move from.`
            }]
        );
    }

    startOfMovementPhase3() {
        return this.openTutorialPresenter(
            [{
                message: `Now that you have selected a territory to move from, click a connected territory to move to. In this case the player will move back forces to ${this.territoryToAttackFrom.name}`,
                markup: `Now that you have selected a territory to move FROM, click a connected territory to move TO. In this case the player will move back forces to ${this.territoryToAttackFrom.name}`
            }],
            () => {},
            () => {
                this.soundService.click.play();
            }
        );
    }

    openMovementModal() {
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'src/modals/movementModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'movementModalController',
                controllerAs: 'movement',
                keyboard: false,
                resolve: {
                    data: () => {
                        return {
                            moveTo: this.territoryToAttackFrom,
                            moveFrom: this.gameEngine.selectedTerritory,
                            tutorial: true
                        };
                    }
                }
            }).result.then(closeResponse => {
                this.gameEngine.setMusic();
                resolve(closeResponse);
            });
        });
    }

    movementModalExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `This is the movement modal. Here you get to choose how many troops to move from one territory to another by adjusting the slider. In this case the player wants to move 1 troop back from ${this.territoryToAttack.name} to ${this.territoryToAttackFrom.name}.`,
                markup: `This is the movement modal. Here you get to choose how many troops to move from one territory to another by adjusting the slider. In this case the player wants to move 1 troop back from <strong>${this.territoryToAttack.name}</strong> to <strong>${this.territoryToAttackFrom.name}</strong>.`
            }]
        );
    }

    movementModalExplanation2() {
        return this.openTutorialPresenter(
            [{
                message: `When you are done simply click the move button to perform the move.`,
                markup: `When you are done simply click the <strong>MOVE</strong>-button to perform the move.`,
            }],
            () => {
                $('#moveButton').addClass('blink_me');
            },
            () => {
                $('#moveButton').removeClass('blink_me');
                this.soundService.click.play();
            }
        );
    }

    endOfTurnExplanation() {
        return this.openTutorialPresenter(
            [{
                message: `Now that the movement phase is complete this is the end of the players turn. After this it would be the next players turn. The game will go on until one player meets the terms for victory.`
            }]
        );
    }

    openTutorialPresenter(messages, beforeSpeech = null, afterSpeech = null, delayBefore = null, delayAfter = null) {
        if (!this.gameEngine.isTutorialMode) {
            throw new Error('tutorial cancelled');
        }
        return new Promise((resolve, reject) => {
            return this.$uibModal.open({
                templateUrl: 'src/modals/turnPresentationModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'turnPresentationController',
                controllerAs: 'turnPresentation',
                keyboard: false,
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

module.exports = TutorialService;