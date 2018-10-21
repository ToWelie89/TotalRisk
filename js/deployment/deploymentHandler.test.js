import DeploymentHandler from './deploymentHandler';
import Player from './../player/player';
import WorldMap from './../map/worldMap';
import { worldMap } from './../map/worldMapConfiguration';
import { CONSTANTS } from './../gameConstants';

describe('DeploymentHandler', () => {

    let deploymentHandler;

    beforeEach(() => {
        deploymentHandler = new DeploymentHandler();
    });

    it('calculateReinforcements - all territories controlled by player', () => {
        const players = new Map();
        ['Caesar', 'Napoleon'].forEach(playerName => {
            players.set(playerName, new Player(playerName, 'color', 'avatar'));
        });
        const map = new WorldMap();
        const turn = {
            player: {
                name: 'Caesar'
            }
        };

        map.getAllTerritoriesAsList().forEach(territory => {
            territory.owner = 'Caesar'
        });

        let points = Math.floor(map.getAllTerritoriesAsList().length / 3);
        map.regions.forEach(region => {
            points += region.bonusTroops
        });

        const response = deploymentHandler.calculateReinforcements(players, map, turn);
        expect(response).toEqual(points);
    });

    it('calculateReinforcements - Africa and Europe controlled by player', () => {
        const players = new Map();
        ['Caesar', 'Napoleon'].forEach(playerName => {
            players.set(playerName, new Player(playerName, 'color', 'avatar'));
        });
        const map = new WorldMap();
        const turn = {
            player: {
                name: 'Caesar'
            }
        };

        map.regions.forEach(region => {
            if (region.name === 'Africa' || region.name === 'Europe') {
                region.territories.forEach(territory => {
                    territory.owner = 'Caesar'
                })
            }
        });

        const europe = worldMap.regions.find(region => region.name === 'Europe');
        const africa = worldMap.regions.find(region => region.name === 'Africa');

        let points = Math.floor((europe.territories.length + africa.territories.length) / 3);
        points += africa.bonusTroops;
        points += europe.bonusTroops;

        const response = deploymentHandler.calculateReinforcements(players, map, turn);
        expect(response).toEqual(points);
    });

    it('calculateReinforcements - Asia controlled by player', () => {
        const players = new Map();
        ['Caesar', 'Napoleon'].forEach(playerName => {
            players.set(playerName, new Player(playerName, 'color', 'avatar'));
        });
        const map = new WorldMap();
        const turn = {
            player: {
                name: 'Caesar'
            }
        };

        map.regions.forEach(region => {
            if (region.name === 'Asia') {
                region.territories.forEach(territory => {
                    territory.owner = 'Caesar'
                })
            }
        });

        const asia = worldMap.regions.find(region => region.name === 'Asia');

        let points = Math.floor(asia.territories.length / 3);
        points += asia.bonusTroops;

        const response = deploymentHandler.calculateReinforcements(players, map, turn);
        expect(response).toEqual(points);
    });

    it('calculateReinforcements - Only one territory controlled by player', () => {
        const players = new Map();
        ['Caesar', 'Napoleon'].forEach(playerName => {
            players.set(playerName, new Player(playerName, 'color', 'avatar'));
        });
        const map = new WorldMap();
        const turn = {
            player: {
                name: 'Caesar'
            }
        };

        map.getAllTerritoriesAsList()[0].owner = 'Caesar';

        const response = deploymentHandler.calculateReinforcements(players, map, turn);
        expect(response).toEqual(CONSTANTS.MIN_REINFORCEMENTS);
    });
});
