export function SoundService(gameEngine) {
    class Sound {
        constructor(reference) {
            this.reference = reference;
            this.audio = new Audio(this.reference);
        }

        play() {
            if (gameEngine && gameEngine.playSound) {
                if (!this.audio.paused) {
                    // If the current audio is currently playing then instantiate a new audio with the same sound reference and play that
                    // This way the same sound can be played many times and overlap each other
                    new Audio(this.reference).play();
                }
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
