const firebase = require('firebase/app');
require('firebase/auth');

const {GAME_PHASES} = require('./../gameConstants');
const {avatars} = require('./../player/playerConstants');
const CountryCodes = require('./../editor/countryCodes');
const {getRankingOfPlayerByUid, LEAGUES} = require('./../leaderboard/rankConstants');

const Chart = require('chart.js');

class ProfileController {
    constructor($scope, $rootScope, toastService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.toastService = toastService;

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.PROFILE) {
                this.init();
            }
        });

        this.vm.editProfile = this.editProfile;
        this.vm.LEAGUES = LEAGUES;
    }

    init() {
        this.vm.loading = true;
        this.vm.error = false;

        const user = firebase.auth().currentUser;

        this.vm.myUid = user.uid;

        firebase.auth().onAuthStateChanged(authUser => {
            if (authUser) {
                const normalizedUser = {
                    uid: authUser.uid,
                    name: authUser.displayName,
                    email: authUser.email,
                    bio: ''
                };
                this.vm.user = normalizedUser;
                this.getUserData();
            }
        });
    }

    getUserData() {
        getRankingOfPlayerByUid(this.vm.user.uid).then(response => {
            this.vm.league = response.league;
            this.vm.rank = response.rank;
        }).then(() => {
            return firebase.database().ref('/users/' + this.vm.user.uid).once('value').then(snapshot => {
                const user = snapshot.val();
                if (user) {
                    this.vm.user.bio = user.bio ? user.bio : '';
                    this.vm.user.rating = user.rating;
                    this.vm.user.totalDefeats = user.totalDefeats ? user.totalDefeats : 0;
                    this.vm.user.totalWins = user.totalWins ? user.totalWins : 0;
                    this.vm.user.totalDisconnects = user.totalDisconnects ? user.totalDisconnects : 0;
                    this.vm.user.recentGames = user.recentGames ? user.recentGames : [];
                    this.vm.user.oldRatings = user.oldRatings ? user.oldRatings : [];

                    this.vm.user.recentGames.forEach(g => {
                        g.ratingBeforeGame.normalized = Math.floor(g.ratingBeforeGame.mu * 100);
                        g.ratingAfterGame.normalized = Math.floor(g.ratingAfterGame.mu * 100);

                        g.ratingAfterGame.diff = (g.ratingAfterGame.normalized - g.ratingBeforeGame.normalized);
                    });

                    this.vm.user.recentGames = this.vm.user.recentGames.sort((a, b) => b.timestamp - a.timestamp);

                    this.vm.user.rating.normalized = Math.floor(this.vm.user.rating.mu * 100);

                    if (user.countryCode && CountryCodes[user.countryCode]) {
                        this.vm.user.countryName = CountryCodes[user.countryCode].name;
                        this.vm.user.flag = `./assets/flagsSvg/countries/${user.countryCode.toLowerCase()}.svg`;
                    }

                    const totalGames = (this.vm.user.totalWins + this.vm.user.totalDefeats);
                    this.vm.user.winRate = Math.round((this.vm.user.totalWins / totalGames) * 100);

                    if (user.defaultAvatar) {
                        if (user.characters && user.characters.find(c => c.id === user.defaultAvatar)) {
                            const chosenDefaultAvatar = user.characters.find(c => c.id === user.defaultAvatar);
                            chosenDefaultAvatar.customCharacter = true;
                            this.vm.user.defaultAvatar = chosenDefaultAvatar;
                        } else if (Object.values(avatars).find(x => x.id === user.defaultAvatar)) {
                            const chosenDefaultAvatar = Object.values(avatars).find(x => x.id === user.defaultAvatar);
                            chosenDefaultAvatar.customCharacter = false;
                            this.vm.user.defaultAvatar = chosenDefaultAvatar;
                        }
                    }

                    this.setChart();

                    this.vm.loading = false;
                    this.$scope.$apply();
                } else {
                    this.vm.loading = false;
                    this.$scope.$apply();
                }
            })
        }).catch(err => {
            this.toastService.errorToast(
                '',
                err.code || 'Something went wrong when trying to fetch profile'
            );
            this.vm.loading = false;
            this.vm.error = true;
            this.$scope.$apply();
        });
    }

    setChart() {
        const ctx = document.getElementById('profileGamesChart').getContext('2d');
        const data = [...this.vm.user.recentGames.map(x => x.ratingBeforeGame.normalized).reverse(), this.vm.user.rating.normalized];
        const options = {
            segmentShowStroke: false,
            legend: {
                display: false
            },
            hover: {
                mode: null
            }
        };
        this.gamesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => ('')),
                datasets: [{
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options
        });
    }

    editProfile() {
        this.$rootScope.currentGamePhase = GAME_PHASES.EDIT_PROFILE;
    }
}

module.exports = ProfileController;