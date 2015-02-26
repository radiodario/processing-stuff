define(function(require, exports, module) {
var Base = require('core/foundation').Base;

/**
 * A CommandFactory has a map of commands which it can create.
 * @Interface
 */
var CommandFactory = Base.extend({
    newCommand: function(commandName, data) {
        var Command = this.commands[commandName];
        var command;

        if (Command) {
            command = new Command(this.deps, data);
        }

        return command;
    },
    hasCommand: function(commandName) {
        return this.commands[commandName];
    }
});

module.exports = CommandFactory;
});
