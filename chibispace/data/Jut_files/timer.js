define(function(require, exports, module) {
var Backbone = require('backbone');

var Timer = Backbone.Model.extend({
    initialize: function(options) {
        options = options || {};

        this.set({
            time: options.time || 0
        });
    },
    start: function() {
        if (this.interval) { return; }

        var self = this;
        this.interval = setInterval(function() {
            self.set({
                time: self.get('time') +1
            });
        }, 1000);
    },
    stop: function() {
        clearInterval(this.interval);
        this.interval = null;
    },
    reset: function() {
        this.stop();
        this.set({
            time: 0
        });
    }
});

module.exports = Timer;
});
