const {
    GAME_PHASES
} = require('./../gameConstants');
const {
    getCurrentOwnershipStandings
} = require('./../map/mapHelpers');
const {
    loadSvgIntoDiv,
    loadCustomCharacterSvgIntoDiv,
    runningElectron
} = require('./../helpers');
const {
    initGlobe
} = require('./../libs/globe');

class EndScreenController {
    constructor($scope, $rootScope, $sce, gameEngine, toastService, settings) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$sce = $sce;
        this.gameEngine = gameEngine;
        this.toastService = toastService;
        this.settings = settings;

        this.vm.runningElectron = runningElectron();

        this.vm.takeScreenshot = this.takeScreenshot;

        if (ipcRenderer) {
            const that = this;
            ipcRenderer.on('takeScreenshotResponse', function(event, imagePath) {
                that.toastService.successToast('Screenshot taken!', `Written file to ${imagePath}`);
                that.vm.disableScreenshotButton = false;
                that.$scope.$apply();
            });
            ipcRenderer.on('takeScreenshotError', function() {
                that.toastService.errorToast('Error!', 'Screenshot could not be taken');
                that.vm.disableScreenshotButton = false;
                that.$scope.$apply();
            });
        }

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.END_SCREEN) {
                if (this.$rootScope.endScreenData && this.$rootScope.endScreenData.playersAsList) {
                    // Multiplayer
                    this.vm.multiplayer = true;
                    this.vm.players = $rootScope.endScreenData.playersAsList;
                    this.vm.players.forEach(player => {
                        const newRating = Math.floor(player.newRating.mu * 100);
                        const oldRating = Math.floor(player.oldRating.mu * 100);
                        player.ratingDifference = newRating - oldRating;
                        player.ratingTooltip = this.$sce.trustAsHtml(`
                            <div class="ratingTooltip">
                                From <strong>${oldRating}</strong> to <strong>${newRating}</strong>
                            </div>
                        `);
                    });
                } else {
                    // Singleplayer
                    this.vm.multiplayer = false;
                    this.calculateRankings();
                    this.vm.players.forEach((x, i) => {
                        x.rank = (i + 1);
                    });
                }

                console.log('End screen players: ', this.vm.players);

                const svgElements = ['firstPlaceContainer', 'secondPlaceContainer', 'thirdPlaceContainer'];
                this.vm.players.slice(0, 3).forEach((player, index) => {
                    if (player.avatar.svg) {
                        loadSvgIntoDiv(player.avatar.svg, `.podiumSvgContainer#${svgElements[index]}`);
                    } else if (player.avatar.customCharacter) {
                        const character = player.avatar;
                        loadCustomCharacterSvgIntoDiv('assets/avatarSvg/custom.svg', `.podiumSvgContainer#${svgElements[index]}`, character, () => {
                            $(`.podiumSvgContainer#${svgElements[index]} svg .skinTone`).css('fill', character.skinTone);
                        });
                    }
                });

                if (this.settings.enable3d) {
                    initGlobe({
                        bg: './assets/maps/globe_bg.jpg',
                        diffuse: './assets/maps/worldMap/globe2.png',
                        halo: './assets/maps/globe_halo.png',
                    });
                }
            }
        });
    }

    takeScreenshot() {
        this.vm.disableScreenshotButton = true;
        ipcRenderer.send('takeScreenshot');
    }

    calculateRankings(winner = undefined) {
        this.players = Array.from(this.gameEngine.players.values());
        const ownership = getCurrentOwnershipStandings(this.gameEngine.map, this.gameEngine.players);

        const playerWhoWon = winner ? winner : this.gameEngine.playerWhoWon;

        this.players.sort((a, b) => {
            if (a.name === playerWhoWon) {
                return -1;
            } else if (a.dead && b.dead) {
                return a.deadTurn > b.deadTurn ? -1 : 1;
            } else if (a.dead) {
                return 1;
            } else if (b.dead) {
                return -1;
            } else {
                let aTotal = ownership.find(x => x.name === a.name).totalTerritories;
                let bTotal = ownership.find(x => x.name === b.name).totalTerritories;

                if (aTotal > bTotal) {
                    return -1;
                } else if (aTotal < bTotal) {
                    return 1;
                } else if (aTotal === bTotal) {
                    aTotal = ownership.find(x => x.name === a.name).totalTroops;
                    bTotal = ownership.find(x => x.name === b.name).totalTroops;

                    if (aTotal > bTotal) {
                        return -1;
                    } else if (aTotal < bTotal) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        });

        this.players.map(x => {
            x.rank = (this.players.indexOf(x) + 1);
        });

        this.vm.players = this.players;

    }
}

module.exports = EndScreenController;