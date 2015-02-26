define(function(require, exports, module) {
var _ = require('underscore');

var AppView = require('./toolbox-view');

var AppController = require('../app-controller');
var ToolboxRegistry = require('./toolbox-registry');

var Logger = require('logger');

var ToolboxApp = AppController.extend({
    appName: 'toolbox',

    initialize: function() {
        this.logger = Logger.get('Toolbox');
    },
    onActivate: function() {
        this.view = new AppView({
            broadcaster: this.broadcaster,
            tools: _.keys(ToolboxRegistry.tools)
        });
        this.view.render();

        this.appSection.html(this.view.el);

        return true;
    },
    routeConfig: {
        routes: {
            '*:tool': function(tool) {
                var ToolView = ToolboxRegistry.tools[tool];
                if (ToolView) {
                    this.logger.info('Show tool:', tool);
                    this.view.showTool(ToolView);
                } else {
                    this.view.render();
                }
            },
            '*': function() {
                this.view.render();
            }
        }
    }
});

module.exports = ToolboxApp;});
