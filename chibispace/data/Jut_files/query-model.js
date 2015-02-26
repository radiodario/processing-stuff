define(function(require, exports, module) {
var Backbone = require('backbone');
var Querier = require('cquery/cquery');
var Logger = require('logger');
var DateRange = require('applib/toolbox/time-selector/date-range');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
    
    defaults: {
        metric: 'kbytes_out',
        type : 'bar',
        aggregator: 'sum',
        groupby: 'server', 
        filter: {
            operator: 'or',
            conditions: [
                {
                    key: 'pop',
                    operator: 'eq',
                    value: 'dal'
                },
                {
                    key: 'pop',
                    operator: 'eq',
                    value: 'atl'
                }
            ]
        }
    },

    // how much to wait for more UI input
    // before firing the query.
    inputDelay : 500,

    // which properties will require a data query
    propertiesRequiringDataQuery: {
        aggregator : true,
        groupby : true,
        filter : true, // comment this out for the time being
        metric: true,
        from: true,
        to: true
    },


    initialize: function(attributes, options) {
        
        // check if options have been passed
        options = options || {};

        // the querier to talk to the backend
        this.querier = new Querier();

        // a logger
        this.logger = Logger.get('citrus query model');

        // a custom dateRange model for selecting dates
        this.dateRange = options.dateRange || new DateRange({
            range: '30d'
        });

        // a collection of selected metrics
        this.selectedMetrics = options.selectedMetrics || new Backbone.Collection([
            { attribute: 'kbytes_out' } 
        ]);


        // keep the external models in sync
        this.dateRange.on('change', this.handleDateChange, this);
        
        // sinc selectedMetrics is a collection, we listen on
        // add, remove and reset (change will never fire because we can't 
        // change the models themselves)
        //
        // however, the way metrics-modal is written (the UI that controls)
        // this model, means that only reset and remove will fire.
        // we'll leave add there just in case ;)
        this.selectedMetrics.on('add', this.handleMetricsChange, this);
        this.selectedMetrics.on('remove', this.handleMetricsChange, this);
        this.selectedMetrics.on('reset', this.handleMetricsChange, this);
        

        // we call the handlers on the
        // special cases (dates and metrics)
        // to set the metrics correctly
        this.handleDateChange();
        this.handleMetricsChange();

        // debounce handlechangeproperty
        this.handleChangeProperty = _.debounce(this.handleChangeProperty, this.inputDelay);

        // after we've done that, we setup a listener for changes on the
        // model to trigger getData
        this.on('change', this.handleChangeProperty, this);

    },

    // check all of the properties that have changed to see if they
    // warrant a data query
    propertyChangeRequiresDataQuery: function(event) {
        for (var key in event.changed) {
            if (this.propertiesRequiringDataQuery[key]) {
                return true;
            }
        }
        this.logger.info('the properties that changed on the model did not require a data query');
        return false;
    },

    // this little guy here controls how we query the backend.
    // The idea is that we'll have a timeout of `n` milliseconds, and if 
    // no property changed in that time, we fire the query, otherwise,
    // we clear the timeout and wait a bit more
    handleChangeProperty: function(event) {

        // check if we should do a query
        if (!this.propertyChangeRequiresDataQuery(event)) {
            return;
        }


        this.getData();

    },


    // special case for when our child dateRange model changes
    handleDateChange: function () {
        var range = this.dateRange.toJSON();

        // since we won't be doing any time operations here
        // we'll just store the ISOStrings. We could parse
        // them in the future with moment, in case we needed
        // to. 
        var dates = {
            from : range.fromDate.format(),
            to : range.toDate.format()
        };

        this.logger.info('setting dates', dates);
        this.set(dates);
    },

    // special case for when the metrics collection changes
    handleMetricsChange: function() {
        var metrics = this.selectedMetrics.toJSON();

        metrics = metrics.map(function(d) {
            return d.attribute;
        });

        this.logger.info('setting metrics', metrics);
        this.set('metric', metrics);

    },


    getData: function() {
        // inform everyone we're requesting data
        this.logger.info('requesting data');
        this.trigger('requestedData');

        var requestParams = this.toJSON();
        var queryObject = {};
        for (var key in this.propertiesRequiringDataQuery) {
            queryObject[key] = requestParams[key];
        }


        var request = this.querier.query(queryObject);
        
        request
            .done(this.handleData.bind(this))
            .fail(this.handleError.bind(this));
    },

    // processes data to the right format and
    // sends it to the user
    handleData: function(data) {
        this.logger.info('Received data', data);

        if (data.hasOwnProperty('warning')) {
            this.logger.warn('Warning:', data.warning.message);
        }

        this.processData(data);
    },

    // processes an error
    handleError: function(xhr, errorname, errorObject) {
        this.logger.error('error with query:', errorname, errorObject);
    },

    // detects wether the data is compatible with a time series or a bar
    // chart and builds the data that the charts can ingest accordingly
    processData: function(data) {

        var metrics = data.metrics;

        var processedDataObject = {};

        var i, series;
        for (i in metrics) {
            series = metrics[i];
            // check if it's an array, then we don't need
            // to do anything to it
            if (series.value instanceof Array) {
                return this.trigger(data, data.metrics);
            }

            // it's a new metric
            if (!processedDataObject.hasOwnProperty(series.metric)) {

                processedDataObject[series.metric] = {
                    metric: series.metric,
                    values: []
                };

            }

            // add the value
            processedDataObject[series.metric].values.push({
                // the key is going to be our groupby attribute
                key: series.attributes[this.get('groupby')],
                value : series.value
            });

        }

        var dataArray = [], key;
        for (key in processedDataObject) {
            dataArray.push(processedDataObject[key]);
        }

        this.logger.info('Processed Data:', dataArray);

        this.trigger('data', dataArray);

    }


});});
