const firebase = require('firebase/app');
const CountryCodes = require('./../editor/countryCodes');
const {devMode} = require('./../helpers');

const getLeaderboard = () => {
    return firebase.database().ref('/users/').once('value').then(snapshot => {
        let leaderboardList;

        if (devMode() && false) {
            leaderboardList = new Array(100).fill({}).map((x, i) => ({
                id: 'id'+i,
                normalizedRating: i * 100 + 500,
                userName: `Player ${i}`,
                ratingDifference: -200,
                flag: './assets/flagsSvg/countries/se.svg',
                countryName: 'Sweden'
            })).reverse();
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
