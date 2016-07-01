BabelWebpackECMA6Template
==========

## Introduction

This is a template you can use to start off a project built using ECMA6, Babel, Webpack and Grunt.

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
