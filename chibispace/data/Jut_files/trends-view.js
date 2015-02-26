define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var ChartArea = require('./chart-area');
var QueryModel = require('../../query-model');
var TokenGroup = require('applib/toolbox/token-group/token-group');
var GroupTagSelect = require('applib/toolbox/group-tag-select/group-tag-select');

var Spinner = require('spin-js');
var MetricsModal = require('./metrics-modal');

var query = new QueryModel({
    type : 'bar',
    title : 'Chart Title',
    yAxisTitle : "Metric Value"
});

var METRICS_MODAL_ID = 'metrics-modal';

var TrendsView = React.createClass({displayName: 'TrendsView',
    componentWillMount: function() {
        this.selectedInfrastructure = new Backbone.Collection([
            { id: '1', title: "Americas"},
            { id: '2', title: 'atl'}
        ]);

        this.metricsCollection = this.mockMetricsCollection();

        // block the UI if data has been requested
        query.on('requestedData', this.blockUI, this);

        // unblock the UI when data is received
        query.on('data', this.unblockUI, this);

    },
    mockMetricsCollection: function() {
      return new Backbone.Collection([
          { attribute: 'kbytes_out' },
          { attribute: 'average_response_time' },
          { attribute: 'http_blah' },
          { attribute: 'somekind_of_really_awesomeness' },
          { attribute: 'average_response_time1' },
          { attribute: 'http_blah1' },
          { attribute: 'somekind_of_really_awesomeness1' },
          { attribute: 'average_response_time2' },
          { attribute: 'http_blah2' },
          { attribute: 'somekind_of_really_awesomeness2' },
          { attribute: 'average_response_time3' },
          { attribute: 'http_blah3' },
          { attribute: 'somekind_of_really_awesomeness3' },
          { attribute: 'average_response_time4' },
          { attribute: 'http_blah4' },
          { attribute: 'somekind_of_really_awesomeness4' },
          { attribute: 'average_response_time5' },
          { attribute: 'http_blah5' },
          { attribute: 'somekind_of_really_awesomeness5' },
          { attribute: 'average_response_time6' },
          { attribute: 'http_blah6' },
          { attribute: 'somekind_of_really_awesomeness6' }
      ]);
    },

    blockUI: function() {
        // options for the spinner
        var opts = {
            lines: 13, // The number of lines to draw
            length: 10, // The length of each line
            width: 3, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#fff', // #rgb or #rrggbb or array of colors
            speed: 0.5, // Rounds per second
            trail: 30, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };

        // spin over the main-area of the interaction
        var target = this.getDOMNode().querySelector('.main-area');

        // add a class that will block the controls
        target.classList.add('blocked');

        // spin on the main area
        this.spinner = new Spinner(opts).spin(target);
    },
    unblockUI: function() {
        // stop the spinner from spinning
        this.spinner.stop();

        var target = this.getDOMNode().querySelector('.main-area');
        // remove the 'blocked' class
        target.classList.remove('blocked');
    },
    render: function() {
        return (
            React.DOM.div( {className:"clearfix"}, 
                React.DOM.div( {className:"col-md-3"}, 
                    React.DOM.div( {className:"sidebar-absolute"}, 
                        React.DOM.h5( {className:"sidebar-heading"}, "Infrastructure"),

                        GroupTagSelect( {groupType:"Regions"} ),
                        GroupTagSelect( {groupType:"POPs"} ),
                        GroupTagSelect( {groupType:"Servers"} )
                    )
                ),
                React.DOM.div( {className:"col-md-9 main-area"}, 
                    React.DOM.div( {className:"clearfix well"}, 

                        React.DOM.div( {className:"col-md-9"}, 
                            React.DOM.h2(null, "Untitled / Average Response Time over Everything")
                        ),
                        React.DOM.div( {className:"col-md-3"}, 
                            React.DOM.button( {type:"button", className:"btn btn-default"}, "Cancel"),
                            React.DOM.button( {type:"button", className:"btn btn-default"}, "Save")
                        )

                    ),
                    React.DOM.div( {className:"clearfix"}, 
                        React.DOM.p( {className:"col-md-12"}, 
                            TokenGroup( {model:this.selectedInfrastructure, removable:true} )
                        )
                    ),
                    React.DOM.div( {className:"clearfix well"}, 
                        React.DOM.div( {className:"input-group"}, 
                            React.DOM.div( {className:"form-control"}, 
                                TokenGroup( {model:query.selectedMetrics, displayAttribute:'attribute', removable:true} )
                            ),
                            React.DOM.span( {className:"input-group-btn"}, 
                                React.DOM.button( {className:"btn btn-default", 'data-toggle':"modal", 'data-target':'#' + METRICS_MODAL_ID}, 
                                    React.DOM.span( {className:"glyphicon-plus"}),
                                    "Metric"
                                )
                            ),
                            MetricsModal( {id:METRICS_MODAL_ID,
                                metrics:this.metricsCollection,
                                model:query.selectedMetrics} )
                        )
                    ),
                    React.DOM.div( {className:"clearfix well"}, 
                        ChartArea( {query:query})
                    )
                )
            )
            );
    }
});

module.exports = {
    view: TrendsView,
    linkId: 'trends'
};
});
