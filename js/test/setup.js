window.$ = require('jquery');

window.jestlog = window.console.log;

window.console.log = () => {
    return;
};