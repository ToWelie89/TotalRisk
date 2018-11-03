const { loadSvgIntoDiv } = require('./../helpers');

class InjectSVGDirective {
    constructor() {
        this.restrict = 'A';
    }

    link(scope, elem, attr) {
        $(document).ready(() => {
            setTimeout(() => {
                const div = elem[0];
                loadSvgIntoDiv(attr.src, `#${div.id}`, () => {}, 1);
            }, 1);
        });
    }
}

module.exports = InjectSVGDirective;