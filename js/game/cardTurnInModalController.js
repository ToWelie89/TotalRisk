const {MAX_CARDS_ON_HAND, POSSIBLE_CARD_COMBINATIONS, GAME_PHASES} = require('./../gameConstants');
const {CARD_TYPE} = require('./../card/cardConstants');
const {arraysEqual} = require('./../helpers');
const {delay} = require('./../helpers');
const {getBestPossibleCombination} = require('./../card/cardHelpers');

class CardTurnInModalController {
    constructor($scope, $rootScope, $uibModalInstance, gameEngine, soundService, tutorialService, data) {
        this.vm = this;

        // PUBLIC FIELDS
        this.vm.playerMustTurnIn = false;
        this.vm.cards = [];
        this.vm.noAvailableCombination = false;

        // PRIVATE FIELDS
        this.maxNumberOfSelectedCards = 3;

        // PUBLIC FUNCTIONS
        this.vm.toggleCardSelection = this.toggleCardSelection;
        this.vm.illegalCombination = this.illegalCombination;
        this.vm.getCardCombination = this.getCardCombination;
        this.vm.turnIn = this.turnIn;
        this.vm.cancel = this.cancel;
        this.vm.autoSelect = this.autoSelect;

        this.$uibModalInstance = $uibModalInstance;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.tutorialService = tutorialService;
        this.$rootScope = $rootScope;

        // Close the modal on escape if in tutorial mode
        this.boundListener = evt => this.keyupEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        this.vm.phaseIsDeployment = () => this.gameEngine.turn.turnPhase === 0;

        this.vm.CARD_TYPE = CARD_TYPE;
        this.vm.cards = this.gameEngine.turn.player.cards;
        this.vm.cards.map(card => {
            card.isSelected = false;
        });
        this.vm.playerMustTurnIn = (this.vm.cards.length >= MAX_CARDS_ON_HAND);

        if (data.type === 'tutorial') {
            this.tutorial = true;
            this.runTutorial();
        }
    }

    keyupEventListener(e) {
        if (e.keyCode === 27) { // Escape
            if (this.$rootScope.currentGamePhase !== GAME_PHASES.GAME) {
                this.$uibModalInstance.close();
                document.removeEventListener('keyup', this.boundListener);
            }
        }
    }

    runTutorial() {
        this.tutorialService.initTutorialData();
        this.tutorialService.cardModalOpenExplanation()
            .then(() => delay(1500))
            .then(() => this.tutorialService.cardModalOpenExplanation2())
            .then(() => {
                this.$uibModalInstance.close();
            });
    }

    illegalCombination() {
        return this.vm.cards.filter(x => x.isSelected).length === this.maxNumberOfSelectedCards && !this.vm.currentCardCombination;
    }

    getCardCombination() {
        const selectedCards = this.vm.cards.filter(x => x.isSelected).map(card => card.cardType);
        if (selectedCards.length === this.maxNumberOfSelectedCards) {
            for (let combination of POSSIBLE_CARD_COMBINATIONS) {
                if (arraysEqual(combination.combination.sort(), selectedCards.sort())) {
                    return combination;
                }
            }
        }
        return null;
    }

    toggleCardSelection(card) {
        if (this.tutorial) {
            return;
        }

        this.vm.noAvailableCombination = false;

        if (card.isSelected || this.vm.cards.filter(x => x.isSelected).length < this.maxNumberOfSelectedCards) {
            this.soundService.cardSelect.play();
            card.isSelected = !card.isSelected;
        }

        this.vm.currentCardCombination = this.getCardCombination();
    }

    turnIn() {
        if (this.tutorial) {
            return;
        }

        this.vm.noAvailableCombination = false;

        this.soundService.tick.play();
        const newHand = this.vm.cards.filter(card => !card.isSelected);

        this.$uibModalInstance.close({
            newTroops: this.getCardCombination().value,
            newHand
        });
    }

    cancel() {
        if (this.tutorial) {
            return;
        }
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }

    autoSelect() {
        this.vm.noAvailableCombination = false;
        if (this.tutorial) {
            return;
        }

        this.soundService.tick.play();
        const bestCombination = getBestPossibleCombination(this.vm.cards);

        if (bestCombination) {
            this.vm.cards.map(card => {
                card.isSelected = false;
            });

            bestCombination.combination.forEach(item => {
                const card = this.vm.cards.find(card => !card.isSelected && card.cardType === item);
                if (card) {
                    card.isSelected = true;
                }
            });

            this.turnIn();
        } else {
            this.vm.noAvailableCombination = true;
        }
    }
}

module.exports = CardTurnInModalController;