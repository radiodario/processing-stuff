define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var Logger = require('logger');

var AppView = Backbone.View.extend({
    template: _.template(require('text!./citrus-layout.html')),
    initialize: function() {
        this.logger = Logger.get('CitrusAppView');
    },
    render: function() {
        this.$el.html(this.template());

        this.header = this.$('#header');
        this.content = this.$('#content');
    }
});

module.exports = AppView;
});
