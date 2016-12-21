/*
 * IMPORTS
 */

export default class SoundEngine {

    constructor() {
        this.soundPath = './audio/';

        this.bleep = new Audio(`${this.soundPath}/bleep.wav`);
        this.cheer = new Audio(`${this.soundPath}/victory_cheer.wav`);
        this.screamSound = new Audio(`${this.soundPath}/wilhelm.wav`);
        this.addTroopSound = new Audio(`${this.soundPath}/troop.wav`);
    }
}
