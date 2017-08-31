'use strict';
var assert = require('assert');
var isarray = require('isarray');
module.exports = assert;

assert.isTrue = function (as) {
    return assert(!!as);
}

assert.isFalse = function (as) {
    return assert(!as);
}

assert.isNull = function (as) {
    return assert(as == null);
}

assert.isArray = function (as) {
    return assert(isarray(as));
}

assert.match = function (str, regex) {
    return assert(typeof str === 'string' && regex instanceof RegExp && str.match(regex));
}
