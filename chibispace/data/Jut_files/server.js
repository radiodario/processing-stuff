define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

var getHostType = function(metric) {
    return (metric.indexOf('aws') === -1)
            ? 'hostname'
            : 'InstanceId';
};

var Metric = Backbone.Model.extend({
    idAttribute: 'name', // this seems pretty fragile, but this isn't a rest api

    defaults: {
        name: '',
        dps: {}, // should probably convert to an array
        type: ''
    },

    initialize: function(attributes) {
        this.type = getHostType(attributes.name);
        this.url = this.urlConstructor;
    },
    urlConstructor: function() {
        // extending url to deal with non-rest api
        var base = _.result(this.collection, 'url');
        return base + encodeURIComponent(this.id
               + '{' + this.type + '=' + this.collection.host + '}');
    },
    parse: function(response) {
        if (this.isNew()) {
            return response;
        }
        return { name: response[0].metric, dps: response[0].dps };
    }
});

var MetricCollection = Backbone.Collection.extend({
    model: Metric,
    initialize: function(attributes, parent, app) {
        this.app = app;
        this.host = parent.get('host');
        this.timeperiod = '1w-ago';
        this.url = this.urlConstructor;
        this.listenTo(parent, 'change:chartActive', this.fetchAll, this);
    },
    urlConstructor: function() {
        return this.app.data_url + '/tsdb/api/query?start=' + this.timeperiod + '&m=avg:';
    },
    fetchAll: function() {
        var self = this;
        var fetchMap = this.models.map(function(model) {
            return model.fetch();
        });
        return $.when(fetchMap)
                .done(function() {
                    self.trigger('reset');
                });
    }
});


var Server = Backbone.Model.extend({
    
    idAttribute: 'host',

    defaults: {
        chartActive: false,
        host: '',
        metrics: null,
        cidInt: null
    },

    initialize: function(attributes) {
        // kinda ugly, but host is a uuid
        this.cidInt = parseInt(this.cid.split('c')[1], 10);
        var metricList = this.collection.metricCollection.models.map(function(model) {return {name: model.get('name')};});
        this.attributes.metrics = new MetricCollection(metricList, this, this.collection.app);
        this.listenTo(this.attributes.metrics, 'reset', this.bubbleDpsReady);
    },
    bubbleDpsReady: function() {
        this.collection.trigger('change:dps');
    }

});

module.exports = Server;
});
