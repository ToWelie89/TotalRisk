const shuffle = a => {
    let j;
    let x;
    let i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};

const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const delay = ms => new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
});

const allValuesInArrayAreEqual = (array) => !!array.reduce((a, b) => { return (a === b) ? a : NaN; });

const removeDuplicates = (array) => {
    const dups = [];
    const arr = array.filter((el) => {
        // If it is not a duplicate, return true
        if (dups.indexOf(el) === -1) {
            dups.push(el);
            return true;
        }
        return false;
    });
    return arr;
}

const chancePercentage = (x) => {
    const perc = Math.floor((Math.random() * 100) + 1);
    return x <= perc;
}

const randomIntFromInterval = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

const randomDoubleFromInterval = (min, max) => {
    const double = Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);
    return Math.round(double * 10) / 10;
};

const runningElectron = () => !!(window && window.process && window.process.type);

const electronDevVersion = () => runningElectron() && window.process.env.NODE_ENV === 'dev';

export {shuffle, arraysEqual, delay, allValuesInArrayAreEqual, removeDuplicates, chancePercentage, randomIntFromInterval, randomDoubleFromInterval, runningElectron, electronDevVersion};
