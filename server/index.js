'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 5000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .get('/', (req, res, next) => {
        res.sendFile(INDEX)
    })
    .get('/lobbies', function (req, res, next) {
        res.send({msg: 'test'})
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

const lobbies = require('./lobbies.js')(io);