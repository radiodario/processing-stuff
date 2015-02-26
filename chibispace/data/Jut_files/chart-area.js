define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
var Chart = require('../../../../applib/toolbox/citrus-charts/chart');
var ChartControls = require('./chart-controls');


var ChartArea = React.createClass({displayName: 'ChartArea',

    render : function() {
        return (
            React.DOM.div( {className:"citrus-chart-area"}, 
                ChartControls( {query:this.props.query}),
                Chart( {query:this.props.query})
            )
        );
    }

});


module.exports = ChartArea;});
