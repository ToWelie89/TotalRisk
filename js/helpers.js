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

const throttle = (func, limit) => {
    let lastFunc
    let lastRan
    return function () {
        const context = this
        const args = arguments
        if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args)
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
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
};

const delay = ms => new Promise(resolve => {
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
};

const chancePercentage = (x) => {
    const perc = Math.floor((Math.random() * 100) + 1);
    return x <= perc;
};

/* const randomIntFromInterval = (min, max) => Math.floor(Math.random()*(max-min+1)+min); */

// Random algorithm taken from Diceware https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
const randomIntFromInterval = (min, max) => {
    max++;
    var rval = 0;
    var range = max - min;

    var bits_needed = Math.ceil(Math.log2(range));
    if (bits_needed > 53) {
        throw new Exception("We cannot generate numbers larger than 53 bits.");
    }
    var bytes_needed = Math.ceil(bits_needed / 8);
    var mask = Math.pow(2, bits_needed) - 1;
    // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

    // Create byte array and fill with N random numbers
    var byteArray = new Uint8Array(bytes_needed);
    window.crypto.getRandomValues(byteArray);

    var p = (bytes_needed - 1) * 8;
    for (var i = 0; i < bytes_needed; i++) {
        rval += byteArray[i] * Math.pow(2, p);
        p -= 8;
    }

    // Use & to apply the mask and reduce the number of recursive lookups
    rval = rval & mask;

    if (rval >= range) {
        // Integer out of acceptable range
        return randomIntFromInterval(min, max);
    }
    // Return an integer that falls within the range
    return min + rval;
}



const randomDoubleFromInterval = (min, max) => {
    const double = Math.random() < 0.5 ? ((1 - Math.random()) * (max - min) + min) : (Math.random() * (max - min) + min);
    return Math.round(double * 10) / 10;
};

const runningElectron = () => !!(window && window.process && window.process.type);

const electronDevVersion = () => runningElectron() && window.process.env.NODE_ENV === 'dev';

const devMode = () => electronDevVersion() || getParameterValueByKey('test');

const hashString = string => {
    let hash = 0, i, chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const normalizeTimeFromTimestamp = timestamp => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
};

const getRandomColor = () => {
    const h = getRandomInteger(0, 359);
    const s = getRandomInteger(20, 100);
    const l = getRandomInteger(50, 90);
    const a = 1;

    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

const getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

const lightenDarkenColor = (colorCode, amount) => {
    if (!colorCode) {
        return '';
    }

    var usePound = false;
    if (colorCode[0] === '#') {
        colorCode = colorCode.slice(1);
        usePound = true;
    }
    var num = parseInt(colorCode, 16);
    var r = (num >> 16) + amount;
    if (r > 255) {
        r = 255;
    } else if (r < 0) {
        r = 0;
    }
    var b = ((num >> 8) & 0x00FF) + amount;
    if (b > 255) {
        b = 255;
    } else if (b < 0) {
        b = 0;
    }
    var g = (num & 0x0000FF) + amount;
    if (g > 255) {
        g = 255;
    } else if (g < 0) {
        g = 0;
    }
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

const objectsAreEqual = (obj1, obj2) => {
    if (!obj1 || !obj2) {
        return false;
    }

    if (typeof obj1 !== typeof obj2) {
        return false;
    }

    let returnValue = true;

    Object.keys(obj1).forEach(key => {
        if (typeof obj1[key] === 'object') {
            returnValue = (objectsAreEqual(obj1[key], obj2[key]));
        } else if (!(key in obj2) || obj1[key] !== obj2[key]) {
            returnValue = false;
        }
    });

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        returnValue = false;
    }

    return returnValue;
};

const arrayIncludesObject = (array, object) => {
    const o = array.find(x => objectsAreEqual(x, object));
    return o !== undefined;
};

const loadCustomCharacterSvgIntoDiv = (svgPath, divSelector, avatarConfiguration, callback, callbackTimer = 50) => {
    $.get(svgPath, (svg) => {
        var temp = document.createElement('span');
        temp.innerHTML = svg;
        let gradientsUsed = [];

        temp.querySelectorAll('radialGradient, linearGradient').forEach(gradient => {
            let xlink = gradient.getAttribute('xmlns:xlink');
            if (!xlink) {
                xlink = gradient.getAttribute('xlink:href');
            }
            if (xlink) {
                gradient.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }
        });

        ['hat', 'head', 'eyebrows', 'eyes', 'nose', 'mouth', 'torso', 'legs'].forEach(category => {
            temp.querySelectorAll(`g[category="${category}"] > g`).forEach(x => {
                if (x.getAttribute('name') !== avatarConfiguration[category]) {
                    x.remove();
                } else {
                    x.style.visibility = 'visible';
                    let newGradients = x.innerHTML.match(/custom-character-gradient-[0-9]{0,30}|gradient-[0-9]{0,30}/g) || [];
                    gradientsUsed = [...gradientsUsed, ...newGradients];
                }
            });
        });

        temp.querySelectorAll('.skinTone').forEach(x => x.style.fill = avatarConfiguration.skinTone);

        const onlyUnique = (value, index, self) => self.indexOf(value) === index;

        gradientsUsed = gradientsUsed.filter(onlyUnique);

        /* temp.querySelectorAll('radialGradient, linearGradient').forEach(gradient => {
            if (!gradientsUsed.includes(gradient.id)) {
                gradient.remove();
            }
        }); */

        svg = temp.innerHTML;
        temp.remove();

        svg = svg.replace(/gradient-/g, 'gradient-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/filter-/g, 'filter-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/pattern-/g, 'pattern-' + Math.floor((Math.random() * 100000000000) + 1));

        $(divSelector).html(svg);

        if (callback) {
            setTimeout(() => {
                callback();
            }, callbackTimer);
        }
    }, 'text');
};

const loadMapSvgIntoDiv = (svgPath, divSelector, callback, callbackTimer = 50) => {
    $.get(svgPath, (svg) => {
        svg = svg.replace(/gradient-/g, 'gradient-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/filter-/g, 'filter-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/pattern-/g, 'pattern-' + Math.floor((Math.random() * 100000000000) + 1));

        const temp = document.createElement('span');
        temp.innerHTML = svg;
        temp.querySelectorAll('style, #regionTexts, #troopCounters, .troopCounterText, .troopCounter, #mapArrow, #compass').forEach(x => x.remove());
        $(divSelector).html(temp.innerHTML);
        temp.remove();

        if (callback) {
            setTimeout(() => {
                callback();
            }, callbackTimer);
        }
    }, 'text');
};

const loadSvgIntoDiv = (svgPath, divSelector, callback, callbackTimer = 50) => {
    $.get(svgPath, (svg) => {
        svg = svg.replace(/gradient-/g, 'gradient-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/filter-/g, 'filter-' + Math.floor((Math.random() * 100000000000) + 1));
        svg = svg.replace(/pattern-/g, 'pattern-' + Math.floor((Math.random() * 100000000000) + 1));
        $(divSelector).html(svg);

        if (callback) {
            setTimeout(() => {
                callback();
            }, callbackTimer);
        }
    }, 'text');
};

const startGlobalLoading = () => {
    $('#backgroundImage').css('filter', 'blur(5px)');
    $('#backgroundImage').css('-webkit-filter', 'blur(5px)');

    $('.mainWrapper').css('filter', 'blur(5px)');
    $('.mainWrapper').css('-webkit-filter', 'blur(5px)');

    $('#authenticationBox').css('filter', 'blur(5px)');
    $('#authenticationBox').css('-webkit-filter', 'blur(5px)');

    $('#globalLoading').css('opacity', '1');
};

const stopGlobalLoading = () => {
    $('#backgroundImage').css('filter', '');
    $('#backgroundImage').css('-webkit-filter', '');

    $('.mainWrapper').css('filter', '');
    $('.mainWrapper').css('-webkit-filter', '');

    $('#authenticationBox').css('filter', '');
    $('#authenticationBox').css('-webkit-filter', '');

    $('#globalLoading').css('opacity', '0');
};

const getParameterValueByKey = parameterName => {
    const pageURL = window.location.href;
    let parameters = pageURL.split('?')[1];

    if (parameters) {
        parameters = parameters.split('&');
        for (var i = 0, max = parameters.length; i < max; i++) {
            var paramPair = parameters[i].split('=');
            if (paramPair[0] === parameterName) {
                return paramPair[1];
            }
        }
    }

    return null;
};

module.exports = {
    shuffle,
    throttle,
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
    loadMapSvgIntoDiv,
    loadCustomCharacterSvgIntoDiv,
    startGlobalLoading,
    stopGlobalLoading,
    getParameterValueByKey,
    devMode
};
