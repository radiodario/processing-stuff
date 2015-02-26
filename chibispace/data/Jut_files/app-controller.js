define(function(require, exports, module) {
var Base = require('core/foundation').Base;
var Q = require('q');

var Logger = require('logger');

var AppController = Base.extend({
    constructor: function(options) {
        this.broadcaster = options.broadcaster;
        this.router = options.router;

        this.isAwake = false;
        this.active = false;

        this.logger = Logger.get('app-controller');

        if (this.initialize) {
            this.initialize(options);
        }
    },
    activate: function(options) {
        var self = this;

        if (this.active) {
            return Q(true);
        }

        this.logger.info('activating');

        return this.wakeUp().then(function() {
                    self.appSection = options.appSection;
                }).then(function() {
                    if (self.onActivate) {
                        return self.onActivate(options);
                    }
                }).then(function() {
                    self.active = true;
                    self.logger.info('activated');
                });
    },
    deactivate: function(options) {
        this.logger.info('deactivating');

        if (this.view) {
            this.view.remove();
            this.view = null;
        }

        this.active = false;
        this.logger.info('deactivated');

        if (options.sleep) {
            this.sleep(); //don't wait for sleep to finish even if it's asynchronous.
        }

        return Q(true);
    },
    wakeUp: function() {
        var self = this;
        var q = Q(true);

        if (this.isAwake) {
            return q;
        }

        this.logger.info('wakeUp');

        this.isAwake = true;

        if (this.onWakeUp) {
            q = q.then(function() {
                return self.onWakeUp();
            });
        }

        q = q.then(function() {
            self.logger.info('awake');
        });

        return q;
    },
    sleep: function() {
        var self = this;
        var q = Q(true);

        this.isAwake = false;

        this.logger.info('sleep');

        if (this.onSleep) {
            q = q.then(function() {
                return self.onSleep();
            });
        }

        return q.then(function() {
            self.logger.info('sleeping');
        });
    }
});

module.exports = AppController;
});
