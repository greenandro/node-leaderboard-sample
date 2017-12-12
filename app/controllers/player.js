'use strict';

const LeaderboardService = require('../service/leaderboard');

module.exports = {
    index: null,
    show: null,
    update: null,

    create: function (req, res, cb) {
        void(cb);

        return LeaderboardService.insertRandom(req, 1)
        .then(() => {
            res.status(201).send({});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
    },

    patch: function (req, res, cb) {
        void(cb);

        const id = req.params.player || 1;
        const patch = req.body.patch || {};

        return LeaderboardService.modifyScore(req, id, patch)
        .then(() => {
            res.status(200).send({});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
    },

    destroy: function(req, res, cb) {
        void(cb);

        const id = req.params.player || 1;

        return LeaderboardService.remove(req, id)
        .then(() => {
            res.status(204).send({});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
    }
};
