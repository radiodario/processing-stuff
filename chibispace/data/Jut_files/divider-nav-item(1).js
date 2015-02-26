define(function(require, exports, module) {
var _ = require('underscore');

var divider = function DividerNavItem(opts) {
};

divider.prototype.template = _.template('<li class="navbar-inverse divider-vertical"></li>');

module.exports = divider;
});
