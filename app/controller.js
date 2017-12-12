'use strict';

// Copyright (c) 2017 hirowaki https://github.com/hirowaki

const LeaderboardService = require('./service/leaderboard');

module.exports = {
    index: function (req, res) {
        return LeaderboardService.findAll(req)
        .then((data) => {
            res.render('index.ejs', {players: data});
        });
    },

    clear: function  (req, res) {
        return LeaderboardService.clear(req)
        .then(() => {
            res.json({});
        });
    },

    // leaderboard.
    board: function (req, res) {
        const page = +req.query.page || 1;

        return LeaderboardService.getList(req, page)
        .then((data) => {
            res.render('board.ejs', data);
        });
    },
};
