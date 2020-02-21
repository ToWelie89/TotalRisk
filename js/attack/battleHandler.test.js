import BattleHandler from './battleHandler';

describe('BattleHandler', () => {

    let battleHandler;

    beforeEach(() => {
        battleHandler = new BattleHandler();
    });

    it('sortDescending sorts list of dice correctly - attacker wins both rolls', () => {
        const attacker = {
            numberOfTroops: 5
        };
        const defender = {
            numberOfTroops: 4
        };

        const attackDice = [1, 5, 4];
        const defendDice = [2, 1];

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender, false, attackDice, defendDice);

        expect(handleAttackResponse.attackDice).toEqual([5, 4, 1]);
        expect(handleAttackResponse.defendDice).toEqual([2, 1]);
        expect(handleAttackResponse.attacker).toEqual({ numberOfTroops: 5 });
        expect(handleAttackResponse.defender).toEqual({ numberOfTroops: 2 });
        expect(handleAttackResponse.defenderCasualties).toEqual(2);
        expect(handleAttackResponse.attackerCasualties).toEqual(0);
    });

    it('sortDescending sorts list of dice correctly - defender wins both rolls', () => {
        const attacker = {
            numberOfTroops: 10
        };
        const defender = {
            numberOfTroops: 7
        };

        const attackDice = [2, 3, 1];
        const defendDice = [5, 6];

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender, false, attackDice, defendDice);

        expect(handleAttackResponse.attackDice).toEqual([3, 2, 1]);
        expect(handleAttackResponse.defendDice).toEqual([6, 5]);
        expect(handleAttackResponse.attacker).toEqual({ numberOfTroops: 8 });
        expect(handleAttackResponse.defender).toEqual({ numberOfTroops: 7 });
        expect(handleAttackResponse.defenderCasualties).toEqual(0);
        expect(handleAttackResponse.attackerCasualties).toEqual(2);
    });

    it('sortDescending sorts list of dice correctly - both wins one each', () => {
        const attacker = {
            numberOfTroops: 18
        };
        const defender = {
            numberOfTroops: 4
        };

        const attackDice = [5, 2, 2];
        const defendDice = [4, 3];

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender, false, attackDice, defendDice);

        expect(handleAttackResponse.attackDice).toEqual([5, 2, 2]);
        expect(handleAttackResponse.defendDice).toEqual([4, 3]);
        expect(handleAttackResponse.attacker).toEqual({ numberOfTroops: 17 });
        expect(handleAttackResponse.defender).toEqual({ numberOfTroops: 3 });
        expect(handleAttackResponse.defenderCasualties).toEqual(1);
        expect(handleAttackResponse.attackerCasualties).toEqual(1);
    });

    it('number of dice should be generated correctly based on numberOfTroops for both attacker and defender', () => {
        const attacker = {
            numberOfTroops: 5
        };
        const defender = {
            numberOfTroops: 5
        };

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender);

        expect(handleAttackResponse.attackDice.length).toEqual(3);
        expect(handleAttackResponse.defendDice.length).toEqual(2);
    });

    it('number of dice should be generated correctly based on numberOfTroops for both attacker and defender', () => {
        const attacker = {
            numberOfTroops: 2
        };
        const defender = {
            numberOfTroops: 2
        };

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender);

        expect(handleAttackResponse.attackDice.length).toEqual(2);
        expect(handleAttackResponse.defendDice.length).toEqual(2);
    });

    it('number of dice should be generated correctly based on numberOfTroops for both attacker and defender', () => {
        const attacker = {
            numberOfTroops: 1
        };
        const defender = {
            numberOfTroops: 1
        };

        const handleAttackResponse = battleHandler.handleAttack(attacker, defender);

        expect(handleAttackResponse.attackDice.length).toEqual(1);
        expect(handleAttackResponse.defendDice.length).toEqual(1);
    });
});
