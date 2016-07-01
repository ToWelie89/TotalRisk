var svg;
var doc;
var map;
var label;
var text;
var hilite;
var countries;
var seas;

export function initSvgMap() {
    svg = document.getElementById('map').contentDocument.getElementById('svgMap');
    doc = svg.ownerDocument;
    map = doc.getElementById('map');
    label = newElement('text', 'id=label font-size=30 stroke=none fill=black text-insert=middle x=100 y=700');
    text = doc.createTextNode('');
    label.appendChild(text);
    svg.appendChild(label);
    hilite = doc.getElementById("hilite");

    countries = svg.getElementsByClassName('country');
    for (var i = 0; i < countries.length; i++) {
        var country = countries[i];
        country.addEventListener('mouseover', function(evt) {
            mouseoverCountry(evt);
        });
    }

    seas = svg.getElementsByClassName('sea');
    for (var i = 0; i < seas.length; i++) {
        var sea = seas[i];
        sea.addEventListener('mouseover', function(evt) {
            mouseoverSea(evt);
        });
    }
}

// generic function to create an xml element
// format for attr is very strict
// attrs is a string of attribute=value pairs separated by single spaces,
// no quotes inside the string, no spaces in attributes
// eg. newElement( 'circle', 'cx=20 cy=20 r=15 visibility=hidden' );
//
function newElement(type, attrs) {
    var result = doc.createElementNS("http://www.w3.org/2000/svg", type);
    if (result) {
        var attr = attrs.split(' ');
        for (var i = 0; i < attr.length; i++) {
            var value = attr[i].split('=');
            result.setAttribute(value[0], value[1]);
        }
    }
    return result;
}

function mouseoverSea(evt) {
    var sea = evt.target;
    text.textContent = sea.getAttribute('id');
    hilite.setAttribute('d', 'm0 0');
}

function mouseoverCountry(evt) {
    var country = evt.target;
    var outline = country.getAttribute('d');
    hilite.setAttribute('d', outline);
    text.textContent = country.getAttribute('id');
}