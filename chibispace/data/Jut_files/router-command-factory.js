define(function(require, exports, module) {
var CommandFactory = require('./command-factory');
var Command = require('./command');

var RegistryCommandFactory = CommandFactory.extend({
    constructor: function(options) {
        this.deps = {
            router: options.router
        };

        this.commands = {
            registerApplication: Command.extend({
                execute: function() {
                    this.deps.router.register(this.data.baseRoute, this.data.applicationReference);
                }
            }),
            registerAndInitApplication: Command.extend({
                execute: function() {
                    this.deps.router.registerAndInit(this.data.baseRoute, this.data.applicationReference);
                }
            })
        };
    }
});

module.exports = RegistryCommandFactory;
});
