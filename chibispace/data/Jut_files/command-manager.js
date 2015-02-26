define(function(require, exports, module) {
var _ = require('underscore');
var Base = require('core/foundation').Base;

var Logger = require('logger');

var CommandManager = Base.extend({
    constructor: function() {
        this.commandFactories = [];
        this.logger = Logger.get('CommandManager');
    },
    newCommand: function(commandName, data) {
        var commandFactory = _.find(this.commandFactories, function(commandFactory) {
            return commandFactory.hasCommand(commandName);
        });

        if (!commandFactory) {
            throw new Error("Invalid command. Unable to find " + commandName);
        }

        this.logger.info('Creating command ' + commandName);
        return commandFactory.newCommand(commandName, data);
    },
    addFactory: function(commandFactory) {
        this.commandFactories.push(commandFactory);
    }
});

module.exports = CommandManager;
});
