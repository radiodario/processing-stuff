define(function(require, exports, module) {
var Base = require('core/foundation').Base;

/**
 * Command interface
 * @param data
 * @Interface
 */
var Command = Base.extend({
    constructor: function(dependencies, data) {
        this.deps = dependencies;
        this.data = data || {};
    },
    execute: function() {} //to be overridden
});

module.exports = Command;
});
