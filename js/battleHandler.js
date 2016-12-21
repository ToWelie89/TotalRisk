import SoundEngine from './sound/soundEngine';

export default class BattleHandler {
    constructor() {
        this.soundEngine = new SoundEngine();
    }

    handleAttack(attacker, defender) {
        let attackDice = Array.from(new Array(attacker.numberOfTroops > 3 ? 3 : attacker.numberOfTroops), (x, i) => this.getRandomDiceValue());
        let defendDice = Array.from(new Array(defender.numberOfTroops > 2 ? 2 : defender.numberOfTroops), (x, i) => this.getRandomDiceValue());

        this.sortDescending(attackDice);
        this.sortDescending(defendDice);

        let defenderCasualties = 0;
        let attackerCasualties = 0;

        [0, 1].forEach(x => {
            if (attackDice[x] && defendDice[x]) {
                if (attackDice[x] > defendDice[x]) {
                    defender.numberOfTroops--;
                    defenderCasualties++;
                } else {
                    attacker.numberOfTroops--;
                    attackerCasualties++;
                }
            }
        });

        if (defenderCasualties === 2 || attackerCasualties === 2) {
            this.soundEngine.screamSound.play();
        }

        return {
            attackDice,
            defendDice,
            attacker,
            defender
        };
    }

    sortDescending(array) {
        array.sort((a, b) => {
            return b - a;
        });
    }

    getRandomDiceValue() {
        return Math.floor(Math.random() * 6) + 1;
    }
}
