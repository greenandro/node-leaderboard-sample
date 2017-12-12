'use strict';

const express = require('express');
const booster = require('booster');
const app = express();
const db = require('./app/db');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const controller = require('./app/controller');
const service = require('./app/service/leaderboard');
const Promise = require('bluebird');
const redis = Promise.promisifyAll(require('redis'));
const PORT = 8000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// setting up the views folder.
app.set('views', path.join(__dirname, 'views'));

// using ejs. I like it.
app.engine('ejs', ejs.renderFile);

booster.init({
    db: db,
    models: __dirname + '/app/models',
    controllers: __dirname + '/app/controllers',
    app: app
});

// endpoints.
app.get('/', controller.index);
app.post('/clear', controller.clear);
app.get('/board', controller.board);
booster.resource('player'); // player REST API.

let redisCli = null;

function prepareRedis() {
    // prepare redis.
    return new Promise((resolve, reject) => {
        redisCli = redis.createClient();

        redisCli.on('ready', function () {
            resolve();
        });
        redisCli.on('error', function (err) {
            reject(err);
        });
    });
}

function initializeService() {
    return service.initialize(redisCli);
}

function startListening() {
    // start listening.
    return new Promise((resolve, reject) => {
        try {
            app.listen(PORT, function () {
                resolve();
            });
        }
        catch(err) {
            reject(err);
        }
    });
}

prepareRedis()
.then(() => {
    // initialize leaderboard service..
    return initializeService();
})
.then(() => {
    return startListening();
});
