import Sound from './sound';

export default class SoundService {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;

        this.soundPath = './audio/';

        this.bleep = new Sound(`${this.soundPath}/bleep.wav`, this.gameEngine);
        this.bleep2 = new Sound(`${this.soundPath}/bleep2.wav`, this.gameEngine);
        this.cheer = new Sound(`${this.soundPath}/victory_cheer.wav`, this.gameEngine);
        this.screamSound = new Sound(`${this.soundPath}/wilhelm.wav`, this.gameEngine);
        this.addTroopSound = new Sound(`${this.soundPath}/troop.wav`, this.gameEngine);
        this.cardTurnIn = new Sound(`${this.soundPath}/armysound2.wav`, this.gameEngine);
        this.cardSelect = new Sound(`${this.soundPath}/card.wav`, this.gameEngine);
        this.changeColor = new Sound(`${this.soundPath}/beep.wav`, this.gameEngine);
        this.diceRoll = new Sound(`${this.soundPath}/dice.wav`, this.gameEngine);
        this.remove = new Sound(`${this.soundPath}/remove.wav`, this.gameEngine);
        this.click = new Sound(`${this.soundPath}/click.wav`, this.gameEngine);
        this.movement = new Sound(`${this.soundPath}/armysound1.wav`, this.gameEngine);
        this.tick = new Sound(`${this.soundPath}/tick.wav`, this.gameEngine);
    }
}
