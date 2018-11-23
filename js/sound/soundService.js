const Sound = require('./sound');

class SoundService {
    constructor(gameEngine, settings) {
        this.gameEngine = gameEngine;
        this.settings = settings;

        this.soundPath = './audio/';

        this.bleep = this.constructAudio(`${this.soundPath}/bleep.wav`);
        this.bleep2 = this.constructAudio(`${this.soundPath}/bleep2.wav`);
        this.cheer = this.constructAudio(`${this.soundPath}/victory_cheer.wav`);
        this.screamSound = this.constructAudio(`${this.soundPath}/wilhelm.wav`);
        this.addTroopSound = this.constructAudio(`${this.soundPath}/troop.wav`);
        this.cardTurnIn = this.constructAudio(`${this.soundPath}/armysound2.wav`);
        this.cardSelect = this.constructAudio(`${this.soundPath}/card.wav`);
        this.changeColor = this.constructAudio(`${this.soundPath}/beep.wav`);
        this.diceRoll = this.constructAudio(`${this.soundPath}/dice.wav`);
        this.remove = this.constructAudio(`${this.soundPath}/remove.wav`);
        this.click = this.constructAudio(`${this.soundPath}/click.wav`);
        this.movement = this.constructAudio(`${this.soundPath}/armysound1.wav`);
        this.tick = this.constructAudio(`${this.soundPath}/tick.wav`);
        this.denied = this.constructAudio(`${this.soundPath}/denied.wav`);
        this.newMessage = this.constructAudio(`${this.soundPath}/newMessage.wav`);
        this.muskets = this.constructAudio(`${this.soundPath}/muskets.wav`);
    }

    constructAudio(fullPath) {
        return {
            play: () => {
                const sound = new Sound(fullPath, this.settings);
                sound.play();
            }
        }
    }
}


module.exports = SoundService;