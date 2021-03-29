const io = require('socket.io-client');
const endpoint = 'https://totalconquest.herokuapp.com';

class SocketService {
    constructor($rootScope) {
        this.lobbiesSocket = undefined;
        this.gameSocket = undefined;
        this.$rootScope = $rootScope;

        this.gameSocketListeners = {};
        this.lobbiesSocketListeners = {};
    }

    createLobbiesSocket() {
        if (!!electronLog) {
            electronLog.info('Attempting to connect to lobbies socket', `${endpoint}/lobbies`);
        }
        this.lobbiesSocket = io.connect(`${endpoint}/lobbies`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.lobbiesSocket.on('connect', () => this.$rootScope.$broadcast('connect', {}));
        this.lobbiesSocket.on('updatedBioOfUserNotifier', (response) => this.$rootScope.$broadcast('updatedBioOfUserNotifier', { response }));
        this.lobbiesSocket.on('onlineUsers', (onlineUsers) => this.$rootScope.$broadcast('onlineUsers', { onlineUsers }));
        this.lobbiesSocket.on('currentLobbies', (lobbies) => this.$rootScope.$broadcast('currentLobbies', { lobbies }));
        this.lobbiesSocket.on('createNewRoomResponse', (room) => this.$rootScope.$broadcast('createNewRoomResponse', { room }));
        this.lobbiesSocket.on('disconnect', (data) => this.$rootScope.$broadcast('disconnect', { data }));
    }

    createGameSocket() {
        console.log('CREATE GAME SOCKET')
        if (!!electronLog) {
            electronLog.info('Attempting to connect to game socket', `${endpoint}/game`);
        }
        this.gameSocket = io.connect(`${endpoint}/game`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.gameSocket.on('updatedColorOfPlayer', (playerUid, playerColor) => this.$rootScope.$broadcast('updatedColorOfPlayer', { playerUid, playerColor }));
        this.gameSocket.on('messagesUpdated', (messages) => this.$rootScope.$broadcast('messagesUpdated', { messages }));
        this.gameSocket.on('kicked', () => this.$rootScope.$broadcast('kicked', {}));
        this.gameSocket.on('hostLeft', () => this.$rootScope.$broadcast('hostLeft', {}));
        this.gameSocket.on('updatedPlayers', (players) => this.$rootScope.$broadcast('updatedPlayers', {players}));
        this.gameSocket.on('updatedLockedSlots', (lockedSlots) => this.$rootScope.$broadcast('updatedLockedSlots', {lockedSlots}));
        this.gameSocket.on('setTurnLengthNotifier', (turnLength) => this.$rootScope.$broadcast('setTurnLengthNotifier', { turnLength }));
        this.gameSocket.on('setAiSpeedNotifier', (aiSpeed) => this.$rootScope.$broadcast('setAiSpeedNotifier', { aiSpeed }));
        this.gameSocket.on('setGoalNotifier', (chosenGoal) => this.$rootScope.$broadcast('setGoalNotifier', { chosenGoal }));
        this.gameSocket.on('gameStarted', (players, victoryGoal, territories, turn, troopsToDeploy, selectedMap) => this.$rootScope.$broadcast('gameStarted', { players, victoryGoal, territories, turn, troopsToDeploy, selectedMap }));
        this.gameSocket.on('disconnect', (data) => this.$rootScope.$broadcast('setGoalNotifier', { data }));
        this.gameSocket.on('skipToNextPlayer', () => this.$rootScope.$broadcast('skipToNextPlayer', {}));

        this.gameSocket.on('playerWonNotifier', (endScreenData) => this.$rootScope.$broadcast('playerWonNotifier', { endScreenData }));
        this.gameSocket.on('newReinforcements', (newTroops) => this.$rootScope.$broadcast('newReinforcements', { newTroops }));
        this.gameSocket.on('setHighlightedNotifier', (territoryName) => this.$rootScope.$broadcast('setHighlightedNotifier', { territoryName }));
        this.gameSocket.on('removeHighlightedNotifier', (territoryName) => this.$rootScope.$broadcast('removeHighlightedNotifier', { territoryName }));
        this.gameSocket.on('setArrowNotifier', (from, to, arrowType) => this.$rootScope.$broadcast('setArrowNotifier', { from, to, arrowType }));
        this.gameSocket.on('clearArrowNotifier', () => this.$rootScope.$broadcast('clearArrowNotifier', {}));
        this.gameSocket.on('updatedCardsForPlayer', (ownerUid, cards) => this.$rootScope.$broadcast('updatedCardsForPlayer', { ownerUid, cards }));
        this.gameSocket.on('updateMapState', (territories, doNotRemoveHighlightClass) => this.$rootScope.$broadcast('updateMapState', { territories, doNotRemoveHighlightClass }));
        this.gameSocket.on('troopAddedToTerritoryNotifier', (territoryName, doNotRemoveHighlightClass = false) => {
            this.$rootScope.$broadcast('troopAddedToTerritoryNotifier', { territoryName, doNotRemoveHighlightClass })
        });
        this.gameSocket.on('nextTurnNotifier', (turn, reinforcementData) => this.$rootScope.$broadcast('nextTurnNotifier', { turn, reinforcementData }));
        this.gameSocket.on('battleFoughtNotifier', (battleData, doNotRemoveHighlightClass = false) => this.$rootScope.$broadcast('battleFoughtNotifier', { battleData, doNotRemoveHighlightClass }));
        this.gameSocket.on('updateOwnerAfterSuccessfulInvasionNotifier', (updateOwnerData) => this.$rootScope.$broadcast('updateOwnerAfterSuccessfulInvasionNotifier', { updateOwnerData }));
        this.gameSocket.on('updateMovementNotifier', (map) => this.$rootScope.$broadcast('updateMovementNotifier', { map }));
    }

    setLobbiesListener(name, handler) {
        if (this.lobbiesSocketListeners[name]) {
            this.lobbiesSocketListeners[name]();
        }
        this.lobbiesSocketListeners[name] = this.$rootScope.$on(name, handler);
    }

    setGameListener(name, handler) {
        if (this.gameSocketListeners[name]) {
            this.gameSocketListeners[name]();
        }
        this.gameSocketListeners[name] = this.$rootScope.$on(name, handler);
    }

    disconnectLobbiesSocket() {
        this.lobbiesSocket.removeAllListeners();
        this.lobbiesSocket.disconnect();
        this.lobbiesSocket = undefined;
    }

    disconnectGameSocket() {
        this.gameSocket.emit('disconnect');
        this.gameSocket.disconnect();
        this.gameSocket = undefined;
    }
}

module.exports = SocketService;