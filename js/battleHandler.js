export default class BattleHandler {
    handleAttack(attacker, defender, preDeterminedAttackDice = null, preDeterminedDefendDice = null) {
        const newAttacker = Object.assign({}, attacker);
        const newDefender = Object.assign({}, defender);

        const attackDice = preDeterminedAttackDice ? preDeterminedAttackDice
                                                   : Array.from(new Array(attacker.numberOfTroops > 3 ? 3 : attacker.numberOfTroops), (x, i) => this.getRandomDiceValue());
        const defendDice = preDeterminedDefendDice ? preDeterminedDefendDice
                                                   : Array.from(new Array(defender.numberOfTroops > 2 ? 2 : defender.numberOfTroops), (x, i) => this.getRandomDiceValue());

        this.sortDescending(attackDice);
        this.sortDescending(defendDice);

        let defenderCasualties = 0;
        let attackerCasualties = 0;

        [0, 1].forEach(x => {
            if (attackDice[x] && defendDice[x]) {
                if (attackDice[x] > defendDice[x]) {
                    newDefender.numberOfTroops--;
                    defenderCasualties++;
                } else {
                    newAttacker.numberOfTroops--;
                    attackerCasualties++;
                }
            }
        });

        return {
            attackDice,
            defendDice,
            attacker: newAttacker,
            defender: newDefender,
            defenderCasualties,
            attackerCasualties
        };
    }

    sortDescending(array) {
        array.sort((a, b) => b - a);
    }

    getRandomDiceValue() {
        return Math.floor(Math.random() * 6) + 1;
    }
}
