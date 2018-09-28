TotalRisk
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
- **Electron** (Used for creating exe-installer dists of the game so that it can be intalled and ran as a desktop application)

## Getting started

- Clone the repo
- Get dependencies by running

```
npm install
```

However if you want to run on a production environment you can instead run

```
npm install --prod
```

This will not install dependencies only needed for development, such as Karma and Electron, which will save time and space.

- Build project

```
grunt
```

## How to run locally (Web version)

- Start server

```
npm start
```
Open http://127.0.0.1:8080 in your browser.

## How to run locally (Electron version)

- Run

```
npm run electron
```

There is a also a development mode which allows you to use Chrome webtools in-game for debugging and refreshing the app by pressing F5. To run in dev mode run:

```
npm run electron:dev
```

## How to test locally

- Run

```
grunt test
```

This will run a bunch of Karma unit tests.

## Building Electron app

You must first install the following three packages globally:

```
npm install -g electron-packager
npm install -g electron-installer-windows
```

Then run:

```
npm run build-all
```

This is to build both x86 and x64 Windows installers in the electron/dist/installers folder.

This will create an exe-installer (using Electron) in the dist/installers folder.

However if you only want to build for a specific architecture you can run

```
npm run build-32-bit
```
or
```
npm run build-64-bit
```

## Troubleshooting

If you have problems with running the app using Electron you might need to install Electron globally.

```
npm install -g electron
```

For other issues please leave a bug report [here](https://github.com/ToWelie89/ECMA6Risk/issues) or contact me directly via mail: sonesson8909@hotmail.com

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
