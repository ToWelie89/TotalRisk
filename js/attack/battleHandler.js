class BattleHandler {
    handleAttack(attacker, defender, unlimitedDiceMode = false, preDeterminedAttackDice = null, preDeterminedDefendDice = null) {
        const newAttacker = Object.assign({}, attacker);
        const newDefender = Object.assign({}, defender);
        const numberOfAttackDice = unlimitedDiceMode
            ? attacker.numberOfTroops 
            : (attacker.numberOfTroops > 3) 
                ? 3
                : attacker.numberOfTroops;
        const numberOfDefendDice = unlimitedDiceMode
            ? defender.numberOfTroops 
            : (defender.numberOfTroops > 2) 
                ? 2
                : defender.numberOfTroops;
        const attackDice = preDeterminedAttackDice || new Array(numberOfAttackDice).fill().map(() => Math.floor(Math.random() * 6) + 1);
        const defendDice = preDeterminedDefendDice || new Array(numberOfDefendDice).fill().map(() => Math.floor(Math.random() * 6) + 1);
        attackDice.sort((a, b) => b - a);
        defendDice.sort((a, b) => b - a);
        let defenderCasualties = 0;
        let attackerCasualties = 0;
        const minAmountOfDice = Math.min(attackDice.length, defendDice.length);
        new Array(minAmountOfDice).fill().forEach((x, i) => {
            if (attackDice[i] && defendDice[i]) {
                if (attackDice[i] > defendDice[i]) {
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
}

module.exports = BattleHandler;