const firebase = require('firebase/app');
const CountryCodes = require('./../editor/countryCodes');
const {MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED, LEAGUES, MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING} = require('./rankConstants');

class LeaderboardController {
    constructor($scope) {
        this.vm = this;
        this.$scope = $scope;
        this.vm.LEAGUES = LEAGUES;
        this.vm.users = [];
        this.vm.userUid;
        this.vm.showRanks = false;

        this.vm.findMyRanking = this.findMyRanking;

        firebase.auth().onAuthStateChanged(authUser => {
            this.vm.userUid = 'id10';
            this.findMyRanking();
            return;
            if (authUser) {
                this.vm.userUid = authUser.uid;
            } else {
                this.vm.userUid = null;
            }
        });

        firebase.database().ref('users').on('value', snapshot => {
            /* const usersFromDatabase = snapshot.val();
            let users = Object.entries(usersFromDatabase).map(x => (Object.assign({id: x[0]}, x[1])))
            users = users.filter(x => x.recentGames && x.recentGames.length >= MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED);
            users.forEach(x => {
                x.normalizedRating = Math.floor(x.rating.mu * 100);
                const previousRating = Math.floor(x.oldRatings.sort((a,b) => b.timestamp - a.timestamp)[0].mu * 100);;
                x.ratingDifference = x.normalizedRating - previousRating;

                if (x.countryCode && CountryCodes[x.countryCode]) {
                    x.flag = `./assets/flagsSvg/countries/${x.countryCode.toLowerCase()}.svg`;
                    x.countryName = CountryCodes[x.countryCode].name;
                }
            });
            users = users.sort((a, b) => b.normalizedRating - a.normalizedRating);
            this.vm.users = users; */
            this.mockData();
            if (this.vm.users.length >= MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING) {
                this.vm.showRanks = true;
                this.setLeagues();
            } else {
                this.vm.showRanks = false;
            }
        });
    }

    findMyRanking() {
        if (this.vm.userUid) {
            $('#leaderBoardTableContainer').animate({
                scrollTop: ($(`tr[player-id=${this.vm.userUid}]`).offset().top)
            }, 200);
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

    setLeagues() {
        const numberOfPlayers = this.vm.users.length;
        let playerIndex = 0;
        Object.keys(LEAGUES).forEach(l => {
            const amountOfPlayersInLeague = (LEAGUES[l].procentile / 100) * numberOfPlayers;
            LEAGUES[l].minIndex = playerIndex;
            LEAGUES[l].maxIndex = (playerIndex + amountOfPlayersInLeague > numberOfPlayers) ? numberOfPlayers : (playerIndex + amountOfPlayersInLeague);

            LEAGUES[l].maxIndex = (LEAGUES[l].maxIndex - 1);
            
            playerIndex = LEAGUES[l].maxIndex + 1;
        });

        this.vm.users.forEach((x, i) => {
            const correctLeague = Object.keys(LEAGUES).find(leagueKey => LEAGUES[leagueKey].minIndex <= i && LEAGUES[leagueKey].maxIndex >= i);
            if (correctLeague) {
                x.league = correctLeague;
            }
        });

        console.log('this.vm.users', this.vm.users)
        console.log('LEAGUES', LEAGUES)
    }
}

module.exports = LeaderboardController;