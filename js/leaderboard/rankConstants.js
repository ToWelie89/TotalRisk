const firebase = require('firebase/app');
const CountryCodes = require('./../editor/countryCodes');
const {devMode, randomIntFromInterval, generateName, chancePercentage} = require('./../helpers');

const getLeaderboard = () => {
    return firebase.database().ref('/users/').once('value').then(snapshot => {
        let leaderboardList;

        if (devMode() && false) {
            const countryNames = Object.values(CountryCodes).map(x => x.name);
            leaderboardList = new Array(200).fill({}).map((x, i) => {
                const countryName = countryNames[randomIntFromInterval(0, countryNames.length - 1)]
                const flag = './assets/flagsSvg/countries/' + Object.keys(CountryCodes).find(x => CountryCodes[x].name === countryName).toLowerCase() + '.svg';

                const totalWins = randomIntFromInterval(10, 100)
                let totalDefeats = totalWins - randomIntFromInterval(10, 60);
                if (totalDefeats < 0) {
                    totalDefeats = 0;
                }
                return {
                    id: 'id'+i,
                    normalizedRating: i * 100 + 500 + randomIntFromInterval(-50, 50),
                    userName: generateName().replace(' ', '_'),
                    ratingDifference: randomIntFromInterval(-25, 25),
                    totalWins,
                    totalDefeats, 
                    totalDisconnects: chancePercentage(70) ? 0 : randomIntFromInterval(0, 10),
                    flag,
                    countryName
                }
            }).reverse();

            leaderboardList[0].userName = 'MartinGomez89';
            leaderboardList[11].userName = 'pepe420';
            leaderboardList[4].userName = 'Kim_Jong-CHILL';
            leaderboardList[20].userName = 'DoktorAlban123';

            leaderboardList[12].userName = 'pelle1234';
            leaderboardList[12].flag = './assets/flagsSvg/countries/se.svg';
            leaderboardList[12].id = 'zaprcqKg9ycG6P6jKF8VD3MhNj63';
        } else {
            const usersFromDatabase = snapshot.val();
            let users = Object.entries(usersFromDatabase).map(x => (Object.assign({id: x[0]}, x[1])));
            users = users.filter(x => x.recentGames && x.recentGames.length >= MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED);
            users.forEach(x => {
                x.normalizedRating = Math.floor(x.rating.mu * 100);
                const previousRating = Math.floor(x.oldRatings.sort((a,b) => b.timestamp - a.timestamp)[0].mu * 100);
                x.ratingDifference = x.normalizedRating - previousRating;

                if (x.countryCode && CountryCodes[x.countryCode]) {
                    x.flag = `./assets/flagsSvg/countries/${x.countryCode.toLowerCase()}.svg`;
                    x.countryName = CountryCodes[x.countryCode].name;
                }
            });
            users = users.sort((a, b) => b.normalizedRating - a.normalizedRating);
            leaderboardList = users;
        }

        const leaguesCopy = Object.assign({}, LEAGUES);
        const numberOfPlayers = leaderboardList.length;
        let playerIndex = 0;
        Object.keys(leaguesCopy).forEach(l => {
            const amountOfPlayersInLeague = (leaguesCopy[l].procentile / 100) * numberOfPlayers;
            leaguesCopy[l].minIndex = playerIndex;
            leaguesCopy[l].maxIndex = (playerIndex + amountOfPlayersInLeague > numberOfPlayers) ? numberOfPlayers : (playerIndex + amountOfPlayersInLeague);

            leaguesCopy[l].maxIndex = (leaguesCopy[l].maxIndex - 1);
            
            playerIndex = leaguesCopy[l].maxIndex + 1;
        });
        leaderboardList.forEach((x, i) => {
            const correctLeague = Object.keys(leaguesCopy).find(leagueKey => leaguesCopy[leagueKey].minIndex <= i && leaguesCopy[leagueKey].maxIndex >= i);
            if (correctLeague) {
                x.league = correctLeague;
            }
        });

        return {
            leaderboardList,
            leagues: leaguesCopy
        };
    });
};

const getRankingOfPlayerByUid = uid => {
    return getLeaderboard().then(response => {
        const player = response.leaderboardList.find(x => x.id === uid) || 'N/A';
        const rank = response.leaderboardList.indexOf(player) !== -1 ? response.leaderboardList.indexOf(player) + 1 : 'N/A';
        return {
            league: player.league,
            rank
        };
    });
};

const LEAGUES = {
    'Master': {
        procentile: 10,
        icon: './assets/ranks/master.svg'
    },
    'Pro': {
        procentile: 30,
        icon: './assets/ranks/pro.svg'
    },
    'Intermediate': {
        procentile: 30,
        icon: './assets/ranks/intermediate.svg'
    },
    'Novice': {
        procentile: 30,
        icon: './assets/ranks/novice.svg'
    }
};

const MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED = 1;

const MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING = 20;

module.exports = {
    LEAGUES,
    MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED,
    MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING,
    getLeaderboard,
    getRankingOfPlayerByUid
};
