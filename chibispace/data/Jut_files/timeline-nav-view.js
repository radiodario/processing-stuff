define(function(require, exports, module) {
var Backbone = require("backbone");
var Logger = require("logger");

var TimelineNavView = Backbone.View.extend({
    initialize: function(options) {
        this.qm = options.query_mgr;
        this.logger = Logger.get("timeline-nav");
        this.render();
    },

    close: function() {
    },

    render: function() {
    }
});

module.exports = TimelineNavView;
});
