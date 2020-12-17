const displayText = (territory, textElement) => {
    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = territory.getBoundingClientRect();
    const offsetTop = (elemRect.top - bodyRect.top);
    const offsetLeft = (elemRect.left - bodyRect.left);

    textElement.style.left = (Math.floor(offsetLeft) + 20) + 'px';
    textElement.style.top = (Math.floor(offsetTop) - 20) + 'px';

    document.getElementById('mainGameWrapper').appendChild(textElement);

    $(`#${textElement.id}`).animate({
        opacity: 0,
        top: '-=15'
    }, 800, function() {
        $(`#${textElement.id}`).remove();
    });
};

const displayDamageNumbers = (mapSelector, territoryName, damageValue) => {
    let territory;
    if (document.querySelector(`${mapSelector} #troopCounters`)) {
        territory = document.querySelector(`${mapSelector} #troopCounters g[for="${territoryName}"] .troopCounter`);
    } else {
        territory = document.querySelector(`${mapSelector} .troopCounter[for="${territoryName}"]`);
    }

    /* territories.forEach(t => {
        const bounds = t.getBoundingClientRect();
        // See if element is visible
        if (bounds.bottom !== 0 ||
            bounds.height !== 0 ||
            bounds.left !== 0 ||
            bounds.right !== 0 ||
            bounds.top !== 0 ||
            bounds.width !== 0 ||
            bounds.x !== 0 ||
            bounds.y !== 0) {
            territory = t;
        }
    }); */

    if (territory) {
        const id = `damageText${territoryName}${Math.floor((Math.random() * 1000000) + 1)}`.replace(/[ ,&]/g,'');

        var damageText = document.createElement('p');
        damageText.innerHTML = `-${damageValue}`;
        damageText.id = id;
        damageText.classList.add('damageText');

        displayText(territory, damageText);
    }
};

const displayReinforcementNumbers = (mapSelector, territoryName, reinforcementValue = 1) => {
    let territory;
    if (document.querySelector(`${mapSelector} #troopCounters`)) {
        territory = document.querySelector(`${mapSelector} #troopCounters g[for="${territoryName}"] .troopCounter`);
    } else {
        territory = document.querySelector(`${mapSelector} .troopCounter[for="${territoryName}"]`);
    }

    /* territories.forEach(t => {
        const bounds = t.getBoundingClientRect();
        // See if element is visible
        if (bounds.bottom !== 0 ||
            bounds.height !== 0 ||
            bounds.left !== 0 ||
            bounds.right !== 0 ||
            bounds.top !== 0 ||
            bounds.width !== 0 ||
            bounds.x !== 0 ||
            bounds.y !== 0) {
            territory = t;
        }
    }); */

    if (territory) {
        const id = `reinforcementText${territoryName}${Math.floor((Math.random() * 1000000) + 1)}`.replace(/[ ,&]/g,'');

        var reinforcementText = document.createElement('p');
        reinforcementText.innerHTML = `+${reinforcementValue}`;
        reinforcementText.id = id;
        reinforcementText.classList.add('reinforcementText');

        displayText(territory, reinforcementText);
    }
};

module.exports = {displayDamageNumbers, displayReinforcementNumbers};
