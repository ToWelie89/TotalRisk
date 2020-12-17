const firebase = require('firebase/app');
const {loadSvgIntoDiv} = require('./../helpers');
const {GAME_PHASES} = require('./../gameConstants');

class CharacterGalleryController {
    constructor($scope, $rootScope, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.soundService = soundService;

        this.vm.loading = false;

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.CHARACTER_GALLERY) {
                this.fetchCharcaters();
            }
        });
    }

    fetchCharcaters() {
        this.vm.loading = true;
        this.characters = [];
        return firebase.database().ref('/users/').once('value').then(snapshot => {
            let usersFromDatabase = snapshot.val();
            usersFromDatabase = Object.values(usersFromDatabase);
            usersFromDatabase.forEach(user => {
                if (user.characters) {
                    user.characters.forEach(c => c.user = user);
                    this.characters = [...this.characters, ...user.characters];
                }
            });
            this.drawCharacters();
        });
    }

    drawCharacters() {
        const container = document.querySelector('#galleryContainer');
        container.innerHTML = '';

        this.characters.forEach((character, i) => {
            const characterContainer = document.createElement('div');
            characterContainer.classList.add('characterContainer');
            characterContainer.id = 'characterContainer' + i;
            characterContainer.style.opacity = '0';
            container.append(characterContainer);
        });
        
        setTimeout(() => {
            this.characters.forEach((character, i) => {
                const selector = `#galleryContainer #characterContainer${i}`;
                loadSvgIntoDiv('assets/avatarSvg/custom.svg', `#galleryContainer #characterContainer${i}`, () => {
                    $(`${selector} svg g[category="hat"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="head"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="eyes"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="eyebrows"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="nose"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="mouth"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="torso"] > g`).css('visibility', 'hidden');
                    $(`${selector} svg g[category="legs"] > g`).css('visibility', 'hidden');
    
                    $(`${selector} svg g[category="hat"] > g[name="${character.hat}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="head"] > g[name="${character.head}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="eyebrows"] > g[name="${character.eyebrows}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="eyes"] > g[name="${character.eyes}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="nose"] > g[name="${character.nose}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="mouth"] > g[name="${character.mouth}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="torso"] > g[name="${character.torso}"]`).css('visibility', 'visible');
                    $(`${selector} svg g[category="legs"] > g[name="${character.legs}"]`).css('visibility', 'visible');
    
                    $(`${selector} svg .skinTone`).css('fill', character.skinTone);

                    const inner = document.createElement('div');
                    inner.classList.add('characterContainerInner');
                    inner.innerHTML = `<strong>Creator:</strong><br>${character.user.userName}`;
                    document.querySelector(selector).append(inner);

                    const flag = document.createElement('div');
                    flag.classList.add('characterContainerFlag');
                    flag.id = `characterContainerFlag${i}`;
                    flag.style.backgroundImage = `url(${character.flag.path})`;
                    document.querySelector(selector).append(flag);
                });
            });
            this.vm.loading = false;
            this.$scope.$apply();

            this.characters.forEach((character, i) => {
                setTimeout(() => {
                    document.querySelector(`#galleryContainer #characterContainer${i}`).style.opacity = '1';
                }, 400 + (300*i));
            });
        }, 50);

    }
}

module.exports = CharacterGalleryController;