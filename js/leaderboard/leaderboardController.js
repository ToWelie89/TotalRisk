const firebase = require('firebase/app');
const CountryCodes = require('./../editor/countryCodes');
const MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED = 2;

class LeaderboardController {
    constructor($scope) {
        this.vm = this;
        this.vm.users = [];

        firebase.database().ref('users').on('value', snapshot => {
            const usersFromDatabase = snapshot.val();
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
            this.vm.users = users;
            //this.mockData();
        });
    }

    mockData() {
        this.vm.users = new Array(100).fill({}).map((x, i) => ({
            id: '423feef2434f3f',
            normalizedRating: i * 100 + 500,
            userName: `Player ${i}`,
            
        })).reverse();
    }
}

module.exports = LeaderboardController;