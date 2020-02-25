![Logo](https://raw.githubusercontent.com/ToWelie89/TotalRisk/master/assets/logo.png)

## Introduction

This is a web application of the classic board game Risk that is run straight in your browser. This is currently a work in progress. This game is built using modern web technologies and frameworks.

Technologies used:

- **Babel** (For transpiling ES2015)
- **Grunt** (Build tool used for building and running tests and other things)
- **Jest** (For unit tests)
- **Angular 1.x** (MVW framework)
- **less** (CSS preprocessor)
- **Bootstrap** (HTML & CSS framework)
- **Electron** (Used for creating exe-installer dists of the game so that it can be intalled and ran as a desktop application)
- **Node.js** For running the server logic that is used for online gameplay
- **Express.js** Backend server framework
- **Socket.IO** Websocket client for updating clients with new data from the server
- **Heroku** For dedicated remote server
- **Firebase** Database and authentication handling and storing of user data (such as statistics and user settings)

## Getting started

- Clone the repo
- Install all dependencies by running

```
npm install
```

(To build and run the project locally you need both dependencies and devDependencies)

- Build the project (this may require you to first install grunt and grunt-cli globally using npm)

```
grunt default
```

**DO NOTE!** You can now run the game on your local machine, however the server that is used primarily for online play still runs on a remote server. If you want the game to use the local server you need to build the assets using the following command instead:

```
grunt default:local
```

This will change the endpoints to your local machine instead. This is useful if you are developing changes on the server logic and need to test it out locally, or if the remote prod server is for some reason down.

## How to run locally (Web version)

- Start server

```
npm start
```
Open http://127.0.0.1:5000 in your browser. Running the game in your browser is good enough for testing out the game locally and for development purposes, but the actual finished game is supposed to be a standalone application that can be run in full screen. To try this out, continue reading the section below.

## How to run locally (Electron version)

To run the game as a standalone application I am using Electron. If you want to run the game as an Electron application you may need to install Electron globally first by running:

```
npm install -g electron
```

and then run:

```
npm run electron
```

This will run the game as a standalone electron Windows application. However this will run as a production mode, it will attempt to check for previous releases of the game and patch the game with the latest version if one is found. This is done using electron-updater. But right now the game is in development and the game may get stuck in a loading screen unless you run in a specific dev mode. To do this run:

```
npm run electron:dev
```

In dev mode you can also refresh the app by pressing F5, so that you don't have to restart the game when you make changes.

## How to test locally

- Run

```
npm test
```

This will run a bunch of Jest unit tests.

## Building Electron app

Simply run

```
npm run build
```

This may take a little while. When done the newly built setup exe-file can be found in the dist-folder.

## Publishing new release

This requires that you have an authorized Github-token as an environment variable on your machine, which at the moment only I do :wink:

Simply run:

```
npm run publish
```

The newly published release should then be found [here](https://github.com/ToWelie89/TotalRisk/releases/). Click on "Edit" for your new release and then choose "Publish release".

## Bumping version

To automatically bump the version and creating a tag in Git the Grunt-plugin "Grunt-bump" is used. Use it after creating a new commit. Here's an example:

```
git add --all
git commit -m "some new changes"
grunt bump:[major/minor/patch]
```

This will automatically push your commit to the repo, bump the version in package.json and creating a tag.

## Bumping version

To see how many lines of code the project consists of simply run:

```
npm run lines
```

This requires the package known as "cloc". You can install it globally by running:

```
npm install -g cloc
```

## Troubleshooting

### Failed to load gRPC binary module error

If you get an error message sort of like this it might have something to do with a known issue between Firebase and Electron. I managed to fix this by running (in a console with admin rights):

```
npm --add-python-to-path='true' --debug install --global windows-build-tools
```

This will install a bunch of useful dev tools for Windows and add them to your PATH. In this case we need Python so that we then can run:

```
npm rebuild --runtime=electron --target=3.0.2 --disturl=https://atom.io/download/electron
```

### Other

For other issues please leave a bug report [here](https://github.com/ToWelie89/TotalRisk/issues) or contact me directly via mail: sonesson8909@hotmail.com

## Default Grunt build job explained

+ **clean:build**: Deletes all previous compiled build files
+ **browserify:build**: Browserify will build the entry point js-file app.js with the transform babelify and preset es2015 to transpile ES2015 code
+ **less**: Compile less into a css-file
+ **replace:inlineModalSvgs**: This will inline the markup from the svg-file used for the map into the html markup
+ **replace:inlineSvg**: Inline more svg files to html files
+ **notify:build**: Notify the user that the build is complete