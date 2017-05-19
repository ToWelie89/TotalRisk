import {MAX_CARDS_ON_HAND} from './../gameConstants';
import {CARD_TYPE} from './../card/cardConstants';

export function CardTurnInModalController($scope, $rootScope, gameEngine) {
    var vm = this;

    // PUBLIC FIELDS
    vm.playerMustTurnIn = false;
    vm.cards = [];

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.toggleCardSelection = toggleCardSelection;

    function init() {
        console.log('Initialization of CardTurnInModalController');
        vm.CARD_TYPE = CARD_TYPE;
        setupEvents();
    }

    function toggleCardSelection(card) {
        card.isSelected = !card.isSelected;
    }

    function setupEvents() {
        $rootScope.$on('inititateCardTurnIn', function(event, data) {
            vm.cards = gameEngine.turn.player.cards;
            vm.cards.map(card => {
                card.isSelected = false;
            });
            vm.playerMustTurnIn = (vm.cards.length === MAX_CARDS_ON_HAND);
            $('#cardTurnInModal').modal('toggle');
        });
    }
}
