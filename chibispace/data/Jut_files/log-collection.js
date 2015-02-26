define(function(require, exports, module) {
var Backbone = require("backbone");
var Logger = require('logger');

// a collection of log messages, for now we assume they go from
// 0 to size, do we ever have a reason to support sparse arrays?
var LogCollection = Backbone.Model.extend({
    defaults: {
        total: undefined,
        size: 0,
        hits: []
    },

    reset_to: function(result) {
        this.reset({
            total: result.total,
            hits: result.hits,
            size: result.hits.length
        } );
    },
    
    // parse the results of a query and add them to the
    // existing collection
    append: function(result) {
        //if (query.from !== this.get("size")) {
        //    throw "query for extend() isn't contiguous";
        //}
        if (this.get("total") !== undefined && result.total !== this.get("total")) {
            // XXX/demmer CAM-147
            //throw "uh oh, total changed";
            Logger.get('log-collection').error("uh oh, total changed");
            return;
        }

        if (this.get('size') + result.hits.length > result.total) {
            // XXX/demmer CAM-147
            //throw "uh oh too many hits!";
            Logger.get('log-collection').error("uh oh, too many hits!");
            return;
        }

        this.set({
            size: this.get("size") + result.hits.length,
            total: result.total,
            hits: this.get("hits").concat(result.hits)
        } );
    },

    reset: function(vals) {
        if (vals === undefined) {
            vals = this.defaults;
        }
        this.set(vals);
        this.trigger('reset');
    }
} );

module.exports = LogCollection;
});
