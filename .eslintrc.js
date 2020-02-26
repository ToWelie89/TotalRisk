module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "globals": {
        "require": true,
        "responsiveVoice": true,
        "module": true,
        "$": true,
        "electron": true,
        "angular": true,
        "describe": true,
        "beforeEach": true,
        "it": true,
        "xit": true,
        "expect": true,
        "process": true,
        "jest": true,
        "dice_box": true,
        "__dirname": true,
        "iziToast": true,
        "ipcRenderer": true
    },
    "rules": {
        "no-console": "off",
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};