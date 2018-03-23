const displayDamageNumbers = (territoryName, damageValue) => {
    const territory = document.querySelector(`.troopCounter[for="${territoryName}"]`);

    const id = `damageText${territoryName}${Math.floor((Math.random() * 1000000) + 1)}`.replace(/ /g,'');

    var damageText = document.createElement('p');
    damageText.innerHTML = `-${damageValue}`;
    damageText.id = id;
    damageText.classList.add('damageText');

    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = territory.getBoundingClientRect();
    const offsetTop = (elemRect.top - bodyRect.top);
    const offsetLeft = (elemRect.left - bodyRect.left);

    damageText.style.left = (Math.floor(offsetLeft) + 20) + 'px';
    damageText.style.top = (Math.floor(offsetTop) - 20) + 'px';

    document.getElementById('map').appendChild(damageText);

    $(`#${id}`).animate({
      opacity: 0,
      top: "-=15"
    }, 800, function() {
      $(`#${id}`).remove();
    });
};

const displayReinforcementNumbers = (territoryName, reinforcementValue = 1) => {
    const territory = document.querySelector(`.troopCounter[for="${territoryName}"]`);

    const id = `reinforcementText${territoryName}${Math.floor((Math.random() * 1000000) + 1)}`.replace(/ /g,'');

    var reinforcementText = document.createElement('p');
    reinforcementText.innerHTML = `+${reinforcementValue}`;
    reinforcementText.id = id;
    reinforcementText.classList.add('reinforcementText');

    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = territory.getBoundingClientRect();
    const offsetTop = (elemRect.top - bodyRect.top);
    const offsetLeft = (elemRect.left - bodyRect.left);

    reinforcementText.style.left = (Math.floor(offsetLeft) + 20) + 'px';
    reinforcementText.style.top = (Math.floor(offsetTop) - 20) + 'px';

    document.getElementById('map').appendChild(reinforcementText);

    $(`#${id}`).animate({
      opacity: 0,
      top: "-=15"
    }, 800, function() {
      $(`#${id}`).remove();
    });
};

export {displayDamageNumbers, displayReinforcementNumbers};
