define(function(require, exports, module) {
/** @jsx React.DOM */

// this is what we're exporting. You and I know that Variable hoisting will
// mean AppView is actually defined here ^_^

var React = require('react');
var Backbone = require('backbone');
var Chart = require('./chart');
var QueryModel = require('../../../apps/citrus/query-model');


var barQuery = new QueryModel({
    type : 'bar',
    title : 'Bar Chart',
    yAxisTitle : "Metric Value"
});
var lineQuery = new QueryModel({
    type : 'timeseries',
    title : 'Time Series Chart',
    yAxisTitle : "Metric Value"
});


var Charts = React.createClass({displayName: 'Charts',
    render: function() {
        return (
            React.DOM.div( {className:"citrus-charts"}, 
                Chart( {query:barQuery, height:"300", width:"800"}),
                Chart( {query:lineQuery, height:"300", width:"800"})
            )
        );
    }
});


var AppView = Backbone.View.extend({
    render: function () {
        React.renderComponent(Charts(null ), this.el);
    }
});

module.exports = AppView;
});
