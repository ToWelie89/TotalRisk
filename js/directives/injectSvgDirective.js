const { loadSvgIntoDiv, loadMapSvgIntoDiv, loadCustomCharacterSvgIntoDiv } = require('./../helpers');

class InjectSVGDirective {
    constructor() {
        this.restrict = 'A';
    }

    link(scope, elem, attr) {
        $(document).ready(() => {
            setTimeout(() => {
                const div = elem[0];
                if (attr.map) {
                    loadMapSvgIntoDiv(attr.src, `#${div.id}`, () => {}, 1);
                } else if (attr.characterConfig) {
                    const character = JSON.parse(attr.characterConfig);
                    loadCustomCharacterSvgIntoDiv(attr.src, `#${div.id}`, character, () => {}, 1);
                } else {
                    loadSvgIntoDiv(attr.src, `#${div.id}`, () => {}, 1);
                }
            }, 1);
        });
    }
}

module.exports = InjectSVGDirective;