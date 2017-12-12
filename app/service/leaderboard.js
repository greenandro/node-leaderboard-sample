'use strict';

// Copyright (c) 2017 hirowaki https://github.com/hirowaki

const _ = require('lodash');
const Promise = require('bluebird');
const Leaderboard = require('node-leaderboard').LeaderboardScoreDesc;

const pageSize = 10;

class LeaderboardService {
    static initialize(redis) {
        return Leaderboard.create(redis, 'lbTest')
        .then((_lb) => {
            this._instance = _lb;

            return this._instance.clear();
        });
    }

    static findAll(req) {
        return new Promise((resolve, reject) => {
            req.booster.models.player.find({}, req.booster.parent, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    static clear(req) {
        return this.findAll(req)
        .then((data) => {
            return Promise.all(data.map((d) => {
                return this.remove(req, d.id);
            }));
        });
    }

    static insertRandom(req, num) {
        const promises = [];
        for (; num > 0; --num) {
            promises.push(() => {
                return new Promise((resolve, reject) => {
                    req.booster.models.player.create(req.body, req.booster.parent, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            data.name = 'player-' + data.id;
                            data.score = (Math.random() * 1000 | 0);

                            this._instance.setScore(data.id, data.score)
                            .then(() => {
                                resolve(data);
                            });
                        }
                    });
                });
            });
        }

        return Promise.all(promises.map(f => f()));
    }

    static getList(req, page) {
        return this._instance.getList(page, pageSize)
        .then((data) => {
            const _finds = data.list.map((player) => {
                const id = +player.name;
                return new Promise((resolve, reject) => {
                    req.booster.models.player.get(id, req.booster.parent, (err, stored) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(_.extend({}, stored, {rank: +player.rank}));
                        }
                    });
                });
            });

            return Promise.all(_finds)
            .then((res) => {
                data.list = res;
                return this.findAll(req);
            })
            .then((res) => {
                data.data = res;
                return data;
            });
        });
    }

    static remove(req, id) {
        return new Promise((resolve, reject) => {
            req.booster.models.player.destroy(id, req.booster.parent, true, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    return this._instance.remove(id)
                    .then(() => {
                        resolve();
                    });
                }
            });
        });
    }

    static modifyScore(req, id, data) {
        return new Promise((resolve, reject) => {
            req.booster.models.player.patch(id, data, req.booster.parent, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    return this._instance.setScore(id, data.score)
                    .then(() => {
                        resolve();
                    });
                }
            });
        });
    }
}

// static fields.
LeaderboardService._instance = null;

module.exports = LeaderboardService;
