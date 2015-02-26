define(function(require, exports, module) {
var _ = require('underscore');
var Backbone = require('backbone');
var Server = require('./server');

var MetricType = Backbone.Model.extend({
    
    defaults: {
        name: '',
        active: true
    },

    initialize: function() {
        
    }
});

var MetricTypeCollection = Backbone.Collection.extend({
    model: MetricType,
    initialize: function(models, options) {
        this.url = options.app.data_url + '/tsdb/api/suggest?type=metrics';
        this.fetch({url: this.url, reset: true});
    },
    parse: function(response) {
        return _.map(response, 
            function(metric) {
                return {
                    'name': metric
                };
            }
        );
    }
});

var ServerCollection = Backbone.Collection.extend({
    model: Server,
    url: function() {
        return this.app.data_url + '/tsdb/api/suggest?type=tagv';
    },
    initialize: function(models, options) {
        var self = this;
        this.app = options.app;
        this.metricCollection = new MetricTypeCollection([], { app: this.app });
        this.listenTo(this.metricCollection, 'reset', function() { 
            // XXX ugly hack
            // need reset: true to trigger 'reset' even when the fetch finishes.  
            // stats-view waits for reset on ServerCollection to render; 'change' is too slow
            self.fetch({reset: true});
        });
    },
    parse: function(response) {
        return _.map(response, function(id) {
                    return {host: id};
                });
    }
});

module.exports = ServerCollection;
});
