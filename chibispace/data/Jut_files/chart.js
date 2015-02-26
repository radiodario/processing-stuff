define(function(require, exports, module) {
/** @jsx React.DOM */
var d3 = require('d3');
var lineChart = require('./charts/line');
var barChart = require('./charts/bar');
var noData = require('./charts/no-data');
var React = require('react');
var Logger = require('logger');

// golden ratio -ish for chart sizing
var PHI = (1 + Math.sqrt(5))/1.5;


var Chart = React.createClass({displayName: 'Chart',

    // handler for a change of chart type,
    // will adjust the chart generator
    // and redraw the chart
    handleChangeType: function() {

        var el = this.getDOMNode();
        // remove all the rects and all the lines if we're changing
        // things
        d3.select(el).selectAll('svg').remove();
        // set the chart type and redraw
        this.chooseChartType();


    },

    // change the chart title
    handleChangeTitle: function() {
        this.chartBuilder
            .title(this.props.query.get('title'));

        this.drawChart();

    },


    handleData: function(data) {
        this.data = data;

        this.drawChart();

    },


    // setup either chart generator (line or bar)
    chooseChartType: function() {

        var query = this.props.query;
        var chartType = query.get('type');
        var chartTitle = query.get('title');
        var duration = 200;

        if (chartType == 'timeseries') {
            this.chartBuilder = lineChart()
                .interpolate('monotone')
                .xValue(function(d) {
                    return new Date(d.key);
                })
                .yValue(function(d) {
                    return d.value;
                })
                .nameValue(function(d) {
                    return d.metric;
                });
        } else if (chartType == 'bar') {
            this.chartBuilder = barChart()
                .mode('grouped')
                .xValue(function(d) {
                    return d.key;
                })
                .yValue(function(d) {
                    return d.value;
                })
                .nameValue(function(d) {
                    return d.metric;
                });
        }

        // set common properties
        this.chartBuilder
            .margin({
                top: 50,
                bottom: 50,
                left: 100,
                right: 30
            })
            .duration(duration)
            .title(chartTitle);

        this.drawChart();

    },


    // render the view element container
    // and the controls
    render: function() {
        return (
            React.DOM.div( {className:"citrus-chart"}
            )
        );
    },

    // Doing the actual drawing of the chart
    // to the view's element.
    drawChart : function(data) {
        // get the dom node this view is attached to
        var el = this.getDOMNode();
        var query = this.props.query;

        var elWidth = el.offsetWidth;

        // if el has a width, we use it, otherwise, we
        // use a preset width

        var width = elWidth || 800;
        // use the golden ratio
        var height = elWidth / PHI  || 400;




        this.chartBuilder
            .height(height)
            .width(width)
            .title(query.get('title'))
            .yAxisTitle(query.get('yAxisTitle'))

        if (typeof this.data === 'undefined') {
            debugger;
            if (this.data.length > 0) {
                // and now render
                d3.select(el)
                    .datum(this.data)
                    .call(this.chartBuilder);
            } else {

                var noDataBuilder = noData()
                    .height(height)
                    .width(width)

                d3.select(el)
                    .datum(this.data)
                    .call(noDataBuilder)


            }

        }


    },

    // what to do after the component
    // is mounted onto the DOM
    componentDidMount : function() {
        this.chooseChartType();
        // setup the listeners for property changes on the
        // query model
        this.props.query.on('change:type', this.handleChangeType);
        this.props.query.on('change:title', this.handleChangeTitle);
        
        // listen for data changes
        this.props.query.on('data', this.handleData);
        // and ask for data
        this.props.query.getData();

        // make the chart redraw if we're resizing
        window.addEventListener('resize', this.drawChart);
    },


    // cleanup to remove listeners if we
    // navigate away!
    componentWillUnmount: function() {
        var query = this.props.query;
        
        this.props.query.off('change:type', null);
        this.props.query.off('change:title', null);
        this.props.query.off('data', null);
    }

});

module.exports = Chart;});
