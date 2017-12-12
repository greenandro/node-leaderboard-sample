'use strict';

module.exports = {
    fields: {
        id: {required: true, createoptional: true, mutable: false, visible: 'public'},
        name: {required: true, createoptional: true, mutable:false, visible: 'public'},
        score: {required: true, default: 0, type: 'integer', mutable: true, visible: 'public'}
    }
};
