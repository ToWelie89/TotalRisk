import {
    shuffle,
    arraysEqual,
    delay,
    allValuesInArrayAreEqual,
    removeDuplicates,
    chancePercentage,
    randomIntFromInterval,
    randomDoubleFromInterval,
    runningElectron,
    electronDevVersion,
    hashString,
    normalizeTimeFromTimestamp,
    getRandomColor,
    getRandomInteger,
    lightenDarkenColor,
    objectsAreEqual,
    arrayIncludesObject,
    loadSvgIntoDiv,
    startGlobalLoading,
    stopGlobalLoading
} from './helpers';

describe('Helpers', () => {

    beforeEach(() => {
    });

    it('shuffle shuffles a list correctly', () => {
        const originalArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
        const copy = originalArray.slice();
        shuffle(copy);
        expect(copy).not.toEqual(originalArray);
    });

    it('arraysEqual', () => {
        expect(arraysEqual([1,1,1,1,1], [1,1,1,1,1])).toEqual(true);
        expect(arraysEqual([1,1,3,4,5], [1,1,3,4,5])).toEqual(true);
        expect(arraysEqual([1,2,3], [1,2,3,4,5])).toEqual(false);
        expect(arraysEqual([1,2,3,4,5], [1,2,3])).toEqual(false);
        expect(arraysEqual([1,2,3,4,5], undefined)).toEqual(false);
    });

    it('allValuesInArrayAreEqual', () => {
        expect(allValuesInArrayAreEqual(['a', 'a', 'a'])).toEqual(true);
        expect(allValuesInArrayAreEqual([1,1,1,1,1])).toEqual(true);

        expect(allValuesInArrayAreEqual([undefined, undefined, 1])).toEqual(false);
        expect(allValuesInArrayAreEqual(['a', 'a', 'b'])).toEqual(false);
        expect(allValuesInArrayAreEqual(['a', 'a', 'a', 1])).toEqual(false);
        expect(allValuesInArrayAreEqual([1,1,1,1,2])).toEqual(false);
    });

    it('removeDuplicates removes duplicates correctly', () => {
        expect(removeDuplicates([1,1,1,1])).toEqual([1]);
        expect(removeDuplicates([1,2,2,2])).toEqual([1,2]);
        expect(removeDuplicates([1,1,1,2,2,2,5,5,5,7,7])).toEqual([1,2,5,7]);
    });

    it('normalizeTimeFromTimestamp returns a correctly formatted string', () => {
        const timestamp = 1548149104181;
        expect(normalizeTimeFromTimestamp(timestamp)).toEqual('10:25');
    });

    it('objectsAreEqual', () => {
        expect(objectsAreEqual({ a: 'test', b: 'hej' }, { a: 'test', b: 'hej' })).toEqual(true);
        expect(objectsAreEqual({ a: 'test', b: 'hej' }, { c: 'test', d: 'hej' })).toEqual(false);
        expect(objectsAreEqual({ a: 'test', b: 'hej' }, { a: 'test1', b: 'hej2' })).toEqual(false);
        expect(objectsAreEqual({ a: 'test', b: 'hej', c: 'lol', d: 'kek' }, { a: 'test', b: 'hej' })).toEqual(false);
        expect(objectsAreEqual({ a: 'test', b: { x: 1, y: 2 } }, { a: 'test', b: { x: 1, y: 2 } })).toEqual(true);
        expect(objectsAreEqual({ a: 'test', b: { x: 1, y: 2 } }, { a: 'test', b: { x: 3, y: 4 } })).toEqual(false);
        expect(objectsAreEqual({ a: 'test', b: { x: 1, y: 2 } }, { a: 'test', b: { x: 1, z: 2 } })).toEqual(false);
        expect(objectsAreEqual(undefined, undefined)).toEqual(false);
        expect(objectsAreEqual({ a: 1 }, 1)).toEqual(false);
    });

    it('arrayIncludesObject', () => {
        expect(arrayIncludesObject([{ a: 1 }, { a: 2 }, { a: 3 }], { a: 3 })).toEqual(true);
        expect(arrayIncludesObject([{ a: 1 }, { a: 2 }, { a: 3 }], { a: 4 })).toEqual(false);
        expect(arrayIncludesObject([{ a: 1 }, { a: 2 }, { b: 3 }], { c: 3 })).toEqual(false);
    });
});
