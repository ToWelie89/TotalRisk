import firebase from 'firebase/app';
import 'firebase/auth';

export default class AuthenticationController {
    constructor($scope, toastService, soundService) {
        const config = {
          apiKey: "AIzaSyDFz9b6u63g01thrhzSotBUfTgCZQ8U_Bw",
          authDomain: "totalrisk-e2899.firebaseapp.com",
          databaseURL: "https://totalrisk-e2899.firebaseio.com",
          projectId: "totalrisk-e2899",
          storageBucket: "totalrisk-e2899.appspot.com",
          messagingSenderId: "1086373539251"
        };
        firebase.initializeApp(config);

        this.vm = this;
        this.$scope = $scope;
        this.toastService = toastService;
        this.soundService = soundService;

        this.vm.states = {
            LOGGED_IN: 0,
            NOT_LOGGED_IN: 1,
            LOGIN: 2,
            SIGNUP: 3,
            EDIT_PROFILE: 4
        }

        this.vm.loginData = {
            email: '',
            password: ''
        };
        this.vm.signupData = {
            email: '',
            password: ''
        };
        this.vm.newDisplayNameData = '';

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.vm.currentState = this.vm.states.LOGGED_IN;
                this.setUser(user);
                this.toastService.successToast('', 'You have been successfully logged in!');
            } else {
                this.vm.currentState = this.vm.states.NOT_LOGGED_IN;
            }
        });

        this.vm.login = this.login;
        this.vm.signup = this.signup;
        this.vm.logout = this.logout;
        this.vm.goToState = this.goToState;
        this.vm.updateProfile = this.updateProfile;
        this.vm.cancelUpdate = this.cancelUpdate;
    }

    setUser (user) {
        this.vm.user = {
            displayName: user.displayName,
            email: user.email
        };
        this.vm.newDisplayNameData = this.vm.user.displayName;
    }

    goToState(state) {
        this.soundService.tick.play();
        this.vm.currentState = state;
    }

    login() {
        this.soundService.tick.play();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            firebase.auth().signInWithEmailAndPassword(this.vm.loginData.email, this.vm.loginData.password)
            .then(result => {
                console.log(result);
                this.vm.currentState = this.vm.states.LOGGED_IN;
                this.setUser(result.user);
                this.vm.loginData = {
                    email: '',
                    password: ''
                };
                this.$scope.$apply();
            })
            .catch(err => {
                console.log('Login error', err);
                if (err.code === 'auth/invalid-email') {
                    this.toastService.errorToast(
                        'Login error!',
                        'The email entered is not valid'
                    );
                } else if (err.code === 'auth/user-disabled') {
                    this.toastService.errorToast(
                        'Login error!',
                        'The user has been disabled'
                    );
                } else if (err.code === 'auth/user-not-found') {
                    this.toastService.errorToast(
                        'Login error!',
                        'No user with this email found'
                    );
                } else if (err.code === 'auth/wrong-password') {
                    this.toastService.errorToast(
                        'Login error!',
                        'Incorrect password'
                    );
                }
            });
        })
        .catch(error => {
            console.log('setPersistence error', error)
        });
    }

    signup() {
        this.soundService.tick.play();
        firebase.auth().createUserWithEmailAndPassword(this.vm.signupData.email, this.vm.signupData.password)
        .then(result => {
            console.log(result);
            this.vm.currentState = this.vm.states.LOGGED_IN;
            this.vm.user = {
                displayName: result.user.displayName,
                email: result.user.email
            };
            this.toastService.successToast('', 'You have been registered successfully!');
            this.vm.signupData = {
                email: '',
                password: ''
            };
        })
        .catch(err => {
            console.log('Sign up error', err);
            if (err.code === 'auth/email-already-in-use') {
                this.toastService.errorToast(
                    'Signup error!',
                    'That email is already registered'
                );
            } else if (err.code === 'auth/invalid-email') {
                this.toastService.errorToast(
                    'Signup error!',
                    'Invalid email'
                );
            } else if (err.code === 'auth/weak-password') {
                this.toastService.errorToast(
                    'Signup error!',
                    'That password is too weak'
                );
            }
        });
    }

    logout() {
        this.soundService.tick.play();
        firebase.auth().signOut()
        .then(() => {
            this.vm.currentState = this.vm.states.NOT_LOGGED_IN;
            this.vm.user = {
                displayName: null,
                email: null
            };
            this.vm.loginData = {
                email: '',
                password: ''
            };
            this.vm.signupData = {
                email: '',
                password: ''
            };
            this.$scope.$apply();
        }).catch(err => {
            console.log('Logout error', err),
            this.toastService.errorToast(
                'Logout error',
                ' '
            );
        });
    }

    updateProfile() {
        this.soundService.tick.play();
        const user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: this.vm.newDisplayNameData
        })
        .then(() => {
            this.vm.currentState = this.vm.states.LOGGED_IN;
            this.vm.user.displayName = this.vm.newDisplayNameData;
            this.$scope.$apply();
        })
        .catch(err => {
            this.toastService.errorToast(
                'Update failed',
                ' '
            );
        });
    }

    cancelUpdate() {
        this.soundService.tick.play();
        this.vm.currentState = this.vm.states.LOGGED_IN;
        this.vm.newDisplayNameData = firebase.auth().currentUser.displayName;
    }
}
