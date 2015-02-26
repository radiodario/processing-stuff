define(function(require, exports, module) {
/** @jsx React.DOM */
// This class contains the controls for the chart, but it's a pretty dumb class
// as it just relies on the ../select and ../textfield classes to do the dancing


var React = require('react');
var Selector = require('applib/toolbox/select/select');
var Textfield = require('applib/toolbox/textfield/textfield');
var TimeSelector = require('applib/toolbox/time-selector/time-selector');

var showAsOptions = [
    {
        value: 'timeseries',
        name : 'Time Series'
    },
    {
        value: 'bar',
        name : 'Bar'
    },
    {
        value: 'metric',
        name : 'Metric'
    }
];

var groupByOptions = [
    {
        value: 'region',
        name : 'Region'
    },
    {
        value: 'pop',
        name : 'POP'
    },
    {
        value: 'server',
        name: 'Server'
    }
];

var aggregationOptions = [
    {
        value: 'sum',
        name : 'Sum'
    },
    {
        value: 'avg',
        name : 'Average'
    },
    {
        value: 'value',
        name : 'Value'
    }
];

var times = {
    presets: [{
        title: 'Last 24 Hours',
        setRange: '24h'
    }, {
        title: 'Last 7 Days',
        setRange: '7d'
    },{
        title: 'Last 14 Days',
        setRange: '14d'
    }, {
        title: 'Last 30 Days',
        setRange: '30d'
    }],
    selected: {
        title: 'Last 30 Days',
        dateRange: null
    }
};


module.exports = React.createClass({displayName: 'exports',

    render : function () {
        return (
            React.DOM.div( {className:"clearfix"}, 
                React.DOM.div( {className:"controls clearfix"}, 
                    React.DOM.div( {className:"col-md-2"}, 
                        Selector( 
                            {label:"Show as", 
                            name:"type", 
                            options:showAsOptions, 
                            model:this.props.query}
                        )
                    ),
                    React.DOM.div( {className:"col-md-2"}, 
                        Selector( 
                            {label:"Group by", 
                            name:"groupby", 
                            options:groupByOptions, 
                            model:this.props.query}
                        )
                    ),
                    React.DOM.div( {className:"col-md-2"}, 
                        Selector( 
                            {label:"Aggregation", 
                            name:"aggregator", 
                            options:aggregationOptions, 
                            model:this.props.query}
                        )
                    ),
                    React.DOM.div( {className:"col-md-2"}, 
                        TimeSelector( 
                            {label:"Time Range",
                            presets:times.presets, 
                            selected:times.selected, 
                            updateOnChange:true} 
                        )
                    )
                ),
                React.DOM.div( {className:"controls clearfix"}, 
                    Textfield( 
                        {label:"Chart Title", 
                        name:"title", 
                        model:this.props.query}
                    )
                )
            )
        )
    },

    // setup the date range
    componentWillMount: function() {
        times.selected.dateRange = this.props.query.dateRange;
    },



})
});
