const firebase = require('firebase/app');
const {MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING, getLeaderboard} = require('./rankConstants');
const {GAME_PHASES} = require('./../gameConstants');
const {devMode} = require('./../helpers');

class LeaderboardController {
    constructor($scope, $rootScope, $timeout) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.vm.users = [];
        this.vm.userUid;
        this.vm.showRanks = false;

        this.vm.scrollToMe = this.scrollToMe;

        firebase.auth().onAuthStateChanged(authUser => {
            if (authUser) {
                this.vm.userUid = authUser.uid;
            } else {
                this.vm.userUid = null;
            }
        });

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.LEADERBOARD) {
                this.init();
            }
        });
    }

    init() {
        getLeaderboard().then(response => {
            console.log('Lool', response);
            this.vm.users = response.leaderboardList;
            this.vm.LEAGUES = response.leagues;

            if (this.vm.users.length >= MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING || devMode()) {
                this.$scope.$apply();
                this.vm.showRanks = true;
                if (this.vm.userUid) {
                    this.$timeout(() => {
                        this.scrollToMe();
                    }, 1500);
                }
            } else {
                this.vm.showRanks = false;
            };
        });
    }

    scrollToMe() {
        if (this.vm.userUid) {
            const row = $(`tr[player-id=${this.vm.userUid}]`);
            if (row && row.offset()) {
                $('#leaderBoardTableContainer').animate({
                    scrollTop: (row.offset().top)
                }, 200);
            }
        }
    }

    mockData() {
        this.vm.users = new Array(100).fill({}).map((x, i) => ({
            id: 'id'+i,
            normalizedRating: i * 100 + 500,
            userName: `Player ${i}`,
            ratingDifference: -200,
            flag: './assets/flagsSvg/countries/se.svg',
            countryName: 'Sweden'
        })).reverse();
    }
}

module.exports = LeaderboardController;