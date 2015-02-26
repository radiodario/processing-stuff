define(function(require, exports, module) {
var Link = require('./link');
var _ = require('underscore');
var Backbone = require('backbone');

var layout = require('text!./link-playground-layout.html');

var AppView = Backbone.View.extend({

    initialize: function () {
        this.links = [];

        this.links.push(new Link({
            href: 'test',
            text: 'test'
        }));

        this.links.push(new Link({
            href: 'test2',
            text: 'test 2'
        }));

        this.links.push(new Link({
            href: 'test3',
            text: 'test 3'
        }));
    },

    render: function () {
        _.each(this.links, function(link) {
            link.render();
        });

        var rendered = _.template(layout, {
            link1: this.links[0].$el.html(),
            link2: this.links[1].$el.html(),
            link3: this.links[2].$el.html()
        });
        this.$el.html(rendered);
    }
});

module.exports = AppView;
});
