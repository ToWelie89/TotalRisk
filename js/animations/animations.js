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

const displayDamageNumberForAttackModal = (selector, damageValue, leftArmy) => {
    const id = `damageTextAttackModal${Math.floor((Math.random() * 1000000) + 1)}`;
    var damageText = document.createElement('p');
    damageText.innerHTML = `-${damageValue}`;
    damageText.id = id;
    damageText.classList.add('damageText', 'large');

    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = selector.getBoundingClientRect();
    const offsetTop = elemRect.y + 40;
    let offsetLeft;

    if (leftArmy) {
        offsetLeft = elemRect.x + (elemRect.width / 2);
    } else {
        offsetLeft = elemRect.x + (elemRect.width / 2);
    }

    damageText.style.left = (Math.floor(offsetLeft) + 20) + 'px';
    damageText.style.top = (Math.floor(offsetTop) - 20) + 'px';

    document.children[0].appendChild(damageText);

    $(`#${damageText.id}`).animate({
        opacity: 0,
        top: '-=25'
    }, 1000, function() {
        $(`#${damageText.id}`).remove();
    });
};

const displayDamageNumbers = (mapSelector, territoryName, damageValue) => {
    let territory;
    if (document.querySelector(`${mapSelector} #troopCounters`)) {
        territory = document.querySelector(`${mapSelector} #troopCounters g[for="${territoryName}"] .troopCounter`);
    } else {
        territory = document.querySelector(`${mapSelector} .troopCounter[for="${territoryName}"]`);
    }

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

    if (territory) {
        const id = `reinforcementText${territoryName}${Math.floor((Math.random() * 1000000) + 1)}`.replace(/[ ,&]/g,'');

        var reinforcementText = document.createElement('p');
        reinforcementText.innerHTML = `+${reinforcementValue}`;
        reinforcementText.id = id;
        reinforcementText.classList.add('reinforcementText');

        displayText(territory, reinforcementText);
    }
};

module.exports = {displayDamageNumberForAttackModal, displayDamageNumbers, displayReinforcementNumbers};
