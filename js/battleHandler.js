export default class BattleHandler {
    constructor() {

    }

    handleAttack(attacker, defender) {
        let attackDice = Array.from(new Array(attacker.numberOfTroops > 3 ? 3 : attacker.numberOfTroops), (x, i) => this.getRandomDiceValue());
        let defendDice = Array.from(new Array(defender.numberOfTroops > 2 ? 2 : defender.numberOfTroops), (x, i) => this.getRandomDiceValue());

        this.sortDescending(attackDice);
        this.sortDescending(defendDice);

        [0, 1].forEach(x => {
            if (attackDice[x] && defendDice[x]) {
                if (attackDice[x] > defendDice[x]) {
                    defender.numberOfTroops--;
                } else {
                    attacker.numberOfTroops--;
                }
            }
        });

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
