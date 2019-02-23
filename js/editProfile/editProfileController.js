const firebase = require('firebase/app');
require('firebase/auth');

const {GAME_PHASES} = require('./../gameConstants');
const {avatars} = require('./../player/playerConstants');
const CountryCodes = require('./../editor/countryCodes');

class EditProfileController {

    constructor($scope, $rootScope, $uibModal, toastService, socketService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$uibModal = $uibModal;
        this.toastService = toastService;
        this.socketService = socketService;

        this.vm.selectDefaultAvatar = this.selectDefaultAvatar;
        this.vm.setNewPassword = this.setNewPassword;
        this.vm.updateBio = this.updateBio;

        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.EDIT_PROFILE) {
                this.init();
            }
        });
    }

    init() {
        this.vm.loading = true;
        this.vm.error = false;

        this.vm.currentPassword = '';
        this.vm.newPassword1 = '';
        this.vm.newPassword2 = '';

        firebase.auth().onAuthStateChanged(authUser => {
            if (authUser) {
                const normalizedUser = {
                    uid: authUser.uid,
                    name: authUser.displayName,
                    email: authUser.email,
                    bio: ''
                };
                this.vm.user = normalizedUser;

                firebase.database().ref('/users/' + normalizedUser.uid).once('value').then(snapshot => {
                    const user = snapshot.val();

                    if (user) {
                        this.vm.user.bio = user.bio;

                        if (user.countryCode && CountryCodes[user.countryCode]) {
                            this.vm.user.flag = `./assets/flagsSvg/countries/${user.countryCode.toLowerCase()}.svg`;
                        }

                        if (user.characters) {
                            this.vm.user.characters = user.characters;
                            this.vm.user.characters.forEach(c => {
                                c.customCharacter = true;
                            });
                        }

                        if (user.defaultAvatar) {
                            if (this.vm.user.characters && this.vm.user.characters.find(c => c.id === user.defaultAvatar)) {
                                const chosenDefaultAvatar = this.vm.user.characters.find(c => c.id === user.defaultAvatar);
                                chosenDefaultAvatar.customCharacter = true;
                                this.vm.user.defaultAvatar = chosenDefaultAvatar;
                            } else if (Object.values(avatars).find(x => x.id === user.defaultAvatar)) {
                                const chosenDefaultAvatar = Object.values(avatars).find(x => x.id === user.defaultAvatar);
                                chosenDefaultAvatar.customCharacter = false;
                                this.vm.user.defaultAvatar = chosenDefaultAvatar;
                            }
                        }

                        console.log('My user', this.vm.user);
                        this.vm.loading = false;
                        this.$scope.$apply();
                    } else {
                        this.vm.loading = false;
                        this.$scope.$apply();
                    }
                }).catch(err => {
                    console.log(err);
                    this.toastService.errorToast(
                        '',
                        err.code
                    );
                    this.vm.loading = false;
                    this.vm.error = true;
                    this.$scope.$apply();
                });
            } else {
                this.$scope.$apply();
                this.$rootScope.currentGamePhase = GAME_PHASES.MAIN_MENU;
                this.$rootScope.$apply();
            }
        });
    }

    updateBio() {
        firebase.database().ref('users/' + this.vm.user.uid + '/bio').set(this.vm.user.bio).then(() => {
            this.toastService.successToast('', 'Updated bio');
            this.socketService.lobbiesSocket.emit('updatedBioOfUser', this.vm.user.uid);
        });
    }

    setNewPassword() {
        this.vm.setNewPasswordLoading = true;

        if (!this.vm.currentPassword) {
            this.toastService.errorToast('', 'You must enter your current password');
            return;
        }

        if (!this.vm.newPassword1 || !this.vm.newPassword2) {
            this.toastService.errorToast('', 'No new password entered');
            return;
        }

        if (this.vm.newPassword1 !== this.vm.newPassword2) {
            this.toastService.errorToast('', 'The passwords entered don\'t match');
            return;
        }

        const credential = firebase.auth.EmailAuthProvider.credential(
            this.vm.user.email,
            this.vm.currentPassword
        );

        const user = firebase.auth().currentUser;
        user.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
            return user.updatePassword(this.vm.newPassword1);
        }).then(() => {
            this.toastService.successToast('', 'Your password has been changed successfully!');
            this.vm.currentPassword = '';
            this.vm.newPassword1 = '';
            this.vm.newPassword2 = '';
            this.vm.setNewPasswordLoading = false;
            this.$scope.$apply();
        }).catch(error => {
            this.vm.setNewPasswordLoading = false;
            this.$scope.$apply();

            if (error.code === 'auth/wrong-password') {
                this.toastService.errorToast('', 'Wrong current password!');
            } else if (error.code === 'auth/weak-password') {
                this.toastService.errorToast('', 'That new password is too weak');
            }
        });
    }

    selectDefaultAvatar() {
        this.$uibModal.open({
            templateUrl: 'src/modals/characterSelectionModal.html',
            backdrop: 'static',
            windowClass: 'riskModal characterSelect',
            controller: 'characterSelectionController',
            controllerAs: 'characterSelection',
            keyboard: false,
            resolve: {
                currentSelectedPlayer: () => ({
                    avatar: this.vm.user.defaultAvatar
                }),
                selectedPlayers: () => [],
                multiplayer: () => false
            }
        }).result.then(closeResponse => {
            $('.mainWrapper').css('filter', 'none');
            $('.mainWrapper').css('-webkit-filter', 'none');

            this.vm.user.defaultAvatar = closeResponse.avatar;

            firebase.database().ref('users/' + this.vm.user.uid + '/defaultAvatar').set(this.vm.user.defaultAvatar.id).then(() => {
                this.$rootScope.$broadcast('updatedDefaultAvatar', {});
                this.toastService.successToast('', 'Updated default avatar');
            });
        });
    }
}

module.exports = EditProfileController;