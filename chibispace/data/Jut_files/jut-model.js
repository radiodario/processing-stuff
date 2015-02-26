define(function(require, exports, module) {
var Backbone = require('backbone');
var environment = require('core/environment');
var bbPromise = require('core/backbone-promise');

var JutModel = Backbone.Model.extend({
    /*
     * Dynamically set the url based on the service / modelName attributes.
     */
    urlRoot : function () {
        if (this.service && this.modelName) {
            return environment.get(this.service + '_url') + '/' + this.modelName;
        }

        return undefined;
    },

    /*
     * Wrapper for Model.fetch that returns a promise instead of
     * requiring success/error callbacks.
     */
    fetchThen: function (options) {
        return bbPromise(this, 'fetch', options || {});
    },

    /*
     * Wrapper for Model.save that returns a promise instead of
     * requiring success/error callbacks.
     */
    saveThen: function (key, val, options) {
        // (argument handling modeled after backbone.js)
        var attrs;
        if (! key || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }
        attrs = attrs || {};
        options = options || {};
        return bbPromise(this, 'save', attrs, options);
    }
});

module.exports = JutModel;
});
