import {MAX_CARDS_ON_HAND} from './../gameConstants';
import {CARD_TYPE, CARD_COMBINATIONS} from './../card/cardConstants';

export function CardTurnInModalController($scope, $rootScope, $uibModalInstance, gameEngine) {
    var vm = this;

    // PUBLIC FIELDS
    vm.playerMustTurnIn = false;
    vm.cards = [];

    // PRIVATE FIELDS
    const maxNumberOfSelectedCards = 3;

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.toggleCardSelection = toggleCardSelection;
    vm.illegalCombination = illegalCombination;

    function init() {
        console.log('Initialization of CardTurnInModalController');
        vm.CARD_TYPE = CARD_TYPE;
        vm.cards = gameEngine.turn.player.cards;
        vm.cards.map(card => {
            card.isSelected = false;
        });
        vm.playerMustTurnIn = (vm.cards.length === MAX_CARDS_ON_HAND);
    }

    function illegalCombination() {
        return vm.cards.filter(x => x.isSelected).length === maxNumberOfSelectedCards && !getCardCombination();
    }

    function getCardCombination() {
        const selectedCards = vm.cards.filter(x => x.isSelected);
        if (selectedCards.length === maxNumberOfSelectedCards) {
            if (selectedCards.find(x => x.cardType === CARD_TYPE.TROOP || x.cardType === CARD_TYPE.JOKER) &&
                selectedCards.find(x => x.cardType === CARD_TYPE.HORSE || x.cardType === CARD_TYPE.JOKER) &&
                selectedCards.find(x => x.cardType === CARD_TYPE.CANNON || x.cardType === CARD_TYPE.JOKER)) {
                return CARD_COMBINATIONS.ONE_OF_EACH;
            } else if (selectedCards.every(x => x.cardType === CARD_TYPE.CANNON || x.cardType === CARD_TYPE.JOKER)) {
                return CARD_COMBINATIONS.THREE_CANNONS;
            } else if (selectedCards.every(x => x.cardType === CARD_TYPE.HORSE || x.cardType === CARD_TYPE.JOKER)) {
                return CARD_COMBINATIONS.THREE_HORSES;
            } else if (selectedCards.every(x => x.cardType === CARD_TYPE.TROOP || x.cardType === CARD_TYPE.JOKER)) {
                return CARD_COMBINATIONS.THREE_TROOPS;
            }
            return null;
        }
        return null;
    }

    function toggleCardSelection(card) {
        if (vm.cards.filter(x => x.isSelected).length < maxNumberOfSelectedCards) {
            card.isSelected = !card.isSelected;
        }
    }
}
