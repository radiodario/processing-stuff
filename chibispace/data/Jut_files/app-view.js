define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var Logger = require('logger');

var AppView = Backbone.View.extend({
    initialize: function(options) {
        this.logger = Logger.get('JutAppView');
        this.template = _.template(options.clientLayout);
    },
    render: function() {
        this.$el.html(this.template);

        this.jutHeader = this.$('#jut-header');
        this.jutFooter = this.$('#jut-footer');

        this.appSection = this.$('#app-section');
    },
    addSelector: function(selector) {
        selector.render();
        this.jutHeader.find('.nav').append(selector.el);
    }
});

module.exports = AppView;
});
