import {MAX_CARDS_ON_HAND} from './../gameConstants';
import {CARD_TYPE} from './../card/cardConstants';
import {arraysEqual} from './../helpers';

export default class CardTurnInModalController {
    constructor($scope, $uibModalInstance, gameEngine, soundService) {
        this.vm = this;

        // PUBLIC FIELDS
        this.vm.playerMustTurnIn = false;
        this.vm.cards = [];

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

        this.vm.phaseIsDeployment = this.gameEngine.turn.turnPhase === 0;

        this.vm.CARD_TYPE = CARD_TYPE;
        this.vm.cards = this.gameEngine.turn.player.cards;
        this.vm.cards.map(card => {
            card.isSelected = false;
        });
        this.vm.playerMustTurnIn = (this.vm.cards.length >= MAX_CARDS_ON_HAND);

        this.possibleCombinations = [
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.CANNON], value: 10},
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.CANNON, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.HORSE, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.CANNON, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 10},
            {combination: [CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON], value: 7},
            {combination: [CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.JOKER], value: 7},
            {combination: [CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE], value: 5},
            {combination: [CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 5},
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP], value: 3},
            {combination: [CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.JOKER], value: 3}
        ];
    }

    illegalCombination() {
        return this.vm.cards.filter(x => x.isSelected).length === this.maxNumberOfSelectedCards && !this.vm.currentCardCombination;
    }

    getCardCombination() {
        const selectedCards = this.vm.cards.filter(x => x.isSelected).map(card => card.cardType);
        if (selectedCards.length === this.maxNumberOfSelectedCards) {
            for (let combination of this.possibleCombinations) {
                if (arraysEqual(combination.combination.sort(), selectedCards.sort())) {
                    return combination;
                }
            }
        }
        return null;
    }

    toggleCardSelection(card) {
        if (card.isSelected || this.vm.cards.filter(x => x.isSelected).length < this.maxNumberOfSelectedCards) {
            this.soundService.cardSelect.play();
            card.isSelected = !card.isSelected;
        }

        this.vm.currentCardCombination = this.getCardCombination();
    }

    turnIn() {
        const newHand = this.vm.cards.filter(card => !card.isSelected);
        this.gameEngine.turn.player.cards = newHand;

        this.$uibModalInstance.close({
            newTroops: this.getCardCombination().value
        });
    }

    cancel() {
        this.$uibModalInstance.close();
    }

    autoSelect() {
        const bestCombination = this.getBestPossibleCombination();

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
        }
    }

    getBestPossibleCombination() {
        if (this.vm.cards.length === 0) {
            return null;
        }

        for (let combination of this.possibleCombinations) {
            const indexes = [];
            let result = true;
            const cardTypes = this.vm.cards.map(card => card.cardType);

            combination.combination.forEach(x => {
                const indexOf = cardTypes.indexOf(x);

                if (indexOf !== -1 && !indexes.includes(indexOf)) {
                    cardTypes[indexOf] = null;
                } else {
                    result = false;
                }
            });

            if (result) {
                return combination;
            }
        }

        return null;
    }
}