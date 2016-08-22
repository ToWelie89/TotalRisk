BabelWebpackECMA6Template
==========

## Introduction

This is a web application of the classic board game Risk that is run straight in your browser. This is currently a work in progress. This game is built using modern web technologies and frameworks. The game logic is written in Javascript using the latests syntax (ES6/ES2015) with Babel and Webpack for transpiling. Grunt is also used for build jobs and less for css compiling.


## How to run locally

- Clone the repo
- Get dependencies by running

```
npm install
```

- Build assets

```
grunt
```

- Start server

```
npm run start
```

Open http://127.0.0.1:8080 in your browser.

## Default Grunt build job explained

+ **clean**: Deletes all previous compiled build files
+ **shell:webpack**: This will run the command "npm run webpack" which will transpile ECMA6 Javascript code using Babel loader
+ **uglify**: This will uglify the transpiled code
+ **less**: Compile less into a css-file
+ **replace**: This will inline the markup from the svg-file used for the map into the html markup
+ **notify**: Notify the user that the build is complete
