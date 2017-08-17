import Sound from './sound';

export default class SoundService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        this.soundPath = './audio/';

        this.bleep = new Sound(`${this.soundPath}/bleep.wav`, this.gameEngine);
        this.cheer = new Sound(`${this.soundPath}/victory_cheer.wav`, this.gameEngine);
        this.screamSound = new Sound(`${this.soundPath}/wilhelm.wav`, this.gameEngine);
        this.addTroopSound = new Sound(`${this.soundPath}/troop.wav`, this.gameEngine);
    }
}
