define(function(require, exports, module) {
var _ = require('underscore');

// Simple utility to handle the case where multiple events can occur
// in a batch, after which the system only needs to do something once.
//
// For example, suppose a view wants to listen to multiple models'
// change events, but if they occur at the same time, then the render
// function should only be called once:
//
//     this.render_once = new DelayedOnce(this.render, this);
//
//     model1.on('change', this.render_once.schedule);
//     model2.on('change', this.render_once.schedule);
//     model3.on('change', this.render_once.schedule);
//
function DelayedOnce(callback, context) {
    this.timeout = null;
    this.callback = callback;
    this.context = context;

    // Create a closure to bind this to the schedule function so that
    // callers don't have to worry about it.
    this.schedule = _.bind(this._schedule, this);
}

// Cancel the pending callbacks
DelayedOnce.prototype.cancel = function() {
    if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
    }
};

// Schedule the deferred call. 
//
// If schedule is called multiple times within the same timeout
// window, then the callback will only be called once.
//
// Note that callers should call `schedule()` instead which is a
// closure binding `_schedule()` to the current context.
DelayedOnce.prototype._schedule = function() {
    if (this.timeout) {
        return;
    }

    var self = this;
    self.timeout = setTimeout(function() {
        self.timeout = null;
        self.callback.apply(self.context);
    }, 0);
};

module.exports = DelayedOnce;
});
