define(function(require, exports, module) {
var Backbone = require('backbone');
var $ = require('jquery');

var Link = Backbone.View.extend({
    initialize: function(options) {
        this.href = options.href;
        this.text = options.text;
    },
    render: function() {
        var link = $('<a/>');
        var href = this.href;
        link.attr('href', href);
        link.text(this.text);

        this.$el.html(link);
    }
});

module.exports = Link;
});
