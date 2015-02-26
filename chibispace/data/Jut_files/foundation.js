define(function(require, exports, module) {

var Backbone = require('backbone');
var _ = require('underscore');

/**
 * Generic base class for application stack objects.
 *
 * Enables natural inheritance expressions (borrowed from Backbone
 * extend) syntax and possibly other functionality in the future.
 */
function Base() {
}
Base.extend = Backbone.Model.extend;

/**
 * Utility to set up inheritance in cases where we aren't starting
 * from scratch (e.g. deriving from Error).
 *
 * This sets up the prototype chain so that cls inherits from base and
 * merges in the properties.
 */
function inherits(cls, base, props) {
    cls.prototype = Object.create(base.prototype);
    _.extend(cls.prototype, props || {});
    return cls;
}    

module.exports = {
    Base : Base,
    inherits : inherits
};

});
