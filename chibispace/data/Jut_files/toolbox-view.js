define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
var Logger = require('logger');

var appLayout = require('text!./toolbox-layout.html');

var AppView = Backbone.View.extend({

    className: 'toolbox',
    initialize: function (options) {
        this.tools = options.tools;
        this.broadcaster = options.broadcaster;
        this.logger = Logger.get('toolbox-view');
    },

    render: function () {
        var toolsEl = $('<ul />');

        _.each(this.tools, function(tool) {
            toolsEl.append($('<li/>').append(this._generateToolLink(tool)));
        }, this);

        var layout = _.template(appLayout, { tools: toolsEl.html() });

        this.$el.html(layout);

        this.playground = this.$('.playground');
    },
    
    showTool: function(ToolView) {
        var toolView = new ToolView({
            broadcaster: this.broadcaster
        });

        toolView.render();

        this.playground.html(toolView.el);
    },

    _generateToolLink: function(tool) {
        var link = $('<a/>');
        var href = '#toolbox/' + tool;
        link.attr('href', href);
        link.text(tool);

        return link;
    }
});

module.exports = AppView;});
