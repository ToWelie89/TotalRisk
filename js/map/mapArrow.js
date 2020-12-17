/*
    Resources that this was based on:
    
    Click a SVG to create an element at the clicked cursor position,
    converts DOM coordinate to SVG coordinate:

    https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
    https://codepen.io/craigbuckler/pen/RwRdjEq

    Draw an arrow from a circle to cursor position in an SVG:
    https://bl.ocks.org/gilmoreorless/155e9d61af7aa892c4061c09338e75d9
*/


const svgPoint = (svg, element, x, y) => {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(element.getScreenCTM().inverse());
};

const getSvgObjectSize = (svg, element) => {
    const bounds = element.getBoundingClientRect();

    const svgPoint1 = svgPoint(svg, element, bounds.x, bounds.y);
    const svgPoint2 = svgPoint(svg, element, bounds.x + bounds.width, bounds.y + bounds.height);

    return {
        width: svgPoint2.x - svgPoint1.x,
        height: svgPoint2.y - svgPoint1.y
    }
};

const clearArrow = (mapContainer, force = false) => {
    const svg = document.querySelector(`${mapContainer} svg`);
    const arrow = svg.querySelector('#mapArrow');

    if (force) {
        arrow.setAttribute('permanent', 'false');
    }
    if (arrow.getAttribute('permanent') !== 'true') {
        arrow.setAttribute('d', '');
    }
};

const setArrowBetweenTerritories = (mapContainer, fromTerritory, toTerritory, arrowClass, permanentArrow = false) => {
    const svg = document.querySelector(`${mapContainer} svg`);
    const arrow = svg.querySelector('#mapArrow');
    arrow.setAttribute('permanent', permanentArrow + '');

    let fromTerritoryCircle;
    let toTerritoryCircle;

    if (svg.querySelector(`#troopCounters g[for="${fromTerritory}"]`)) {
        fromTerritoryCircle = svg.querySelector(`#troopCounters g[for='${fromTerritory}'] .troopCounter`);
        toTerritoryCircle = svg.querySelector(`#troopCounters g[for='${toTerritory}'] .troopCounter`);
    } else {
        fromTerritoryCircle = svg.querySelector(`.troopCounter[for='${fromTerritory}']`);
        toTerritoryCircle = svg.querySelector(`.troopCounter[for='${toTerritory}']`);
    }

    const fromTerritoryBounds = fromTerritoryCircle.getBoundingClientRect()
    const toTerritoryBounds = toTerritoryCircle.getBoundingClientRect()

    const radius = 10;

    const circleRadius = (fromTerritoryBounds.width / 2);
    
    let toX = toTerritoryBounds.x + circleRadius;
    let toY = toTerritoryBounds.y + circleRadius;
    
    let fromX = fromTerritoryBounds.x + circleRadius;
    let fromY = fromTerritoryBounds.y + circleRadius;

    toX = svgPoint(svg, document.querySelector(`${mapContainer} svg`), toX, toY).x;
    toY = svgPoint(svg, document.querySelector(`${mapContainer} svg`), toX, toY).y;
    fromX = svgPoint(svg, document.querySelector(`${mapContainer} svg`), fromX, fromY).x;
    fromY = svgPoint(svg, document.querySelector(`${mapContainer} svg`), fromX, fromY).y;

    var x = toX - fromX;
    var y = toY - fromY;

    var dist = Math.sqrt(x * x + y * y);
    dist -= (getSvgObjectSize(svg, fromTerritoryCircle).width / 2);
    var angle = Math.atan2(y, x) / Math.PI * 180;
    
    arrow.setAttribute('d', 'M0,0 L' + [
    0, radius,
    dist - radius, radius / 3,
    dist - radius, radius,
    dist, 0,
    dist - radius, -radius,
    dist - radius, -radius / 3,
    0, -radius
    ] + 'z');
    arrow.classList.remove(...arrow.classList);
    arrow.classList.add(arrowClass)
    
    arrow.setAttribute('transform', 'translate(' + [fromX, fromY] + ') rotate(' + angle + ')');
};


module.exports = {
    setArrowBetweenTerritories,
    clearArrow
};
