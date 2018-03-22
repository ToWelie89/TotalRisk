ECMA6Risk
==========

## Introduction

This is a web application of the classic board game Risk that is run straight in your browser. This is currently a work in progress. This game is built using modern web technologies and frameworks.

Technologies used:

- **Babel** (For transpiling ES2015)
- **Grunt** (Build tool used for building and running tests)
- **Karma** (For unit tests)
- **Angular 1.x** (MVW framework)
- **less** (CSS preprocessor)
- **Bootstrap** (HTML & CSS framework)

## How to run locally

- Clone the repo
- Get dependencies by running

```
npm install
```

However if you want to run on a production environment you can instead run

```
npm install --prod
```

This will not install dependencies only needed for dev, such as karma and electron

- Build assets

```
grunt
```

- Start server

```
npm run start
```
Open http://127.0.0.1:8080 in your browser.

## How to test locally

- Run

```
grunt test
```

## Building Electron app

- First run:

```
npm run build-electron
```

Then run:

```
npm run build-installer
```

This will create an exe-installer (using Electron) in the dist/installers folder.

## Default Grunt build job explained

+ **clean:build**: Deletes all previous compiled build files
+ **browserify:build**: Browserify will build the entry point js-file app.js with the transform babelify and preset es2015 to transpile ES2015 code
+ **less**: Compile less into a css-file
+ **replace:inlineModalSvgs**: This will inline the markup from the svg-file used for the map into the html markup
+ **replace:inlineSvg**: Inline more svg files to html files
+ **notify:build**: Notify the user that the build is complete

## Repository structure
```
├───assets
│   ├───cursors
│   ├───flags
│   ├───fonts
│   ├───img
│   └───troopIcons
├───audio
├───build
├───cssLibs
├───electron
│   ├───assets
│   ├───dist
├───js
│   ├───ai
│   ├───angular
│   ├───card
│   ├───directives
│   ├───libs
│   ├───map
│   ├───player
│   ├───settings
│   ├───sound
│   ├───test
│   ├───tutorial
│   └───voice
├───less
│   ├───animations
│   ├───banner
│   ├───buttons
│   ├───cards
│   ├───cursors
│   ├───default
│   ├───dice
│   ├───endScreenTable
│   ├───fonts
│   ├───modal
│   ├───settings
│   ├───setup
│   ├───startScreen
│   ├───svg
│   ├───switch
│   ├───troops
│   └───variables
│   └───victory
└───src
```
