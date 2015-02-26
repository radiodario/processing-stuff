define(function(require, exports, module) {
var Backbone = require('backbone');
var Environment = require('core/environment');
var bbPromise = require('core/backbone-promise');

var JutCollection = Backbone.Collection.extend({
    constructor : function JutCollection(models, options) {
        Backbone.Collection.apply(this, arguments);
        options || (options = {});
        this.db_container = options.db_container;
    },

    /*
     * Dynamically set the url based on the db_container / service /
     * modelName attributes.
     */
    url : function () {
        if (this.db_container) {
            return this.db_container.url() + '/' + this.collectionName;
        } else {
            return Environment.get(this.service + '_url') + '/' + this.collectionName;
        }
    },

    /*
     * Wrapper for Collection.fetch that returns a promise instead of
     * requiring success/error callbacks.
     */
    fetchThen: function (options) {
        return bbPromise(this, 'fetch', options || {});
    }
});

module.exports = JutCollection;
});
