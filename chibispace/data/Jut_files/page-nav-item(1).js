define(function(require, exports, module) {
var _ = require('underscore');

var pageNav = function PageNavItem(opts) {
    opts || (opts = {});

    this.name = opts.name;
    this.title = opts.title;

    this.view = opts.view;

};

pageNav.prototype.template = _.template('<li id="jut-<%= page.name %>-nav"><a class="jut-page-nav" href="#admin/<%= page.name %>"><%= page.title %></a></li>');

module.exports = pageNav;
});
