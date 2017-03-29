export function SoundService(gameEngine) {
    class Sound {
        constructor(reference) {
            this.audio = new Audio(reference);
        }

        play() {
            if (gameEngine && gameEngine.playSound) {
                this.audio.play();
            }
        }
    }

    const soundPath = './audio/';

    const bleep = new Sound(`${soundPath}/bleep.wav`);
    const cheer = new Sound(`${soundPath}/victory_cheer.wav`);
    const screamSound = new Sound(`${soundPath}/wilhelm.wav`);
    const addTroopSound = new Sound(`${soundPath}/troop.wav`);

    return {
        bleep,
        cheer,
        screamSound,
        addTroopSound
    };
}
