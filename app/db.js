'use strict';

const _ = require('lodash');
const sjs = require('searchjs');

class Collection {
    constructor(key) {
        this._key = key || 'id';
        this._data = [];
    }

    search(search) {
        return sjs.matchArray(this._data, search);
    }

    find(id) {
        const key = this._key;
        const _id = ('' + id);
        return this._data.filter((data) => {
            return (('' + data[key]) === _id);
        });
    }

    findIndex(id) {
        const key = this._key;
        const _id = ('' + id);
        for (let i = 0; i < this._data.length; ++i) {
            if (('' + this._data[i][key]) === _id) {
                return i;
            }
        }
        return -1;
    }

    update(id, model) {
        const index = this.findIndex(id);
        if (index >= 0) {
            this._data[index] = model;
            return true;
        }
        return false;
    }

    patch(id, model) {
        const index = this.findIndex(id);
        if (index >= 0) {
            _.extend(this._data[index], model);
            return true;
        }
        return false;
    }

    findVacant() {
        const key = this._key;
        const ids = this._data.map((data) => {
            return data[key];
        });
        ids.sort((a, b) => {
            return +a - +b;
        });
        return (_.last(ids) || 0) + 1;
    }

    register(model, id) {
        const key = this._key;
        model[key] = id;

        this._data.push(model);
    }

    destroy(id) {
        const index = this.findIndex(id);
        if (index >= 0) {
            this._data.splice(index, 1);
            return true;
        }
        return false;
    }
}

// memory db. volatile.
const DATABASE = {
    player: new Collection()
};

class Database {
    get(name, key, cb) {
        const collection = DATABASE[name] || new Collection();
        // key could be an array.
        const stored = [];
        _.each([].concat(key), (k) => {
            Array.prototype.push.apply(stored, collection.find(k));
        });

        if (stored.length <= 0) {
            cb(null, null);
        }
        else if (stored.length === 1) {
            cb(null, stored[0]);
        }
        else {
            cb(null, stored);
        }
        return this;
    }

    find(name, search, cb) {
        const collection = DATABASE[name] || new Collection();
        const res = collection.search(search);
        cb(null, res);
        return this;
    }

    update(name, key, model, cb) {
        const collection = DATABASE[name] || new Collection();

        if (collection.update(key, model)) {
            cb(null, key);
        }
        else {
            cb(null, null);
        }
        return this;
    }

    patch(name, key, model, cb) {
        const collection = DATABASE[name] || new Collection();

        if (collection.patch(key, model)) {
            cb(null, key);
        }
        else {
            cb(null, null);
        }
        return this;
    }

    create(name, model, cb) {
        const collection = DATABASE[name] || new Collection();
        collection.register(model, collection.findVacant());
        cb(null, model);

        return this;
    }

    destroy(name, key, cb) {
        const collection = DATABASE[name] || new Collection();

        if (collection.destroy(key)) {
            cb(null, key);
        }
        else {
            cb(null);
        }

        return this;
    }
}

const db =  new Database();
module.exports = db;