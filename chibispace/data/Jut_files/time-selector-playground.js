define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
require('react.backbone');

var Backbone = require('backbone');
var TimeSelector = require('./time-selector');
var DateRange = require('./date-range');

var DateInspector = React.createBackboneClass({
    render: function() {
        return (
            React.DOM.span(null, 
                "Time Range: ", this.getModel().toString()
            )
        );
    }
});

var AppView = Backbone.View.extend({
    initialize: function() {
        this.date1 = new DateRange({
            range: '24h'
        });
        this.times = {
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
                title: 'Last 24 Hours',
                dateRange: this.date1
            }
        };

        this.date2 = new DateRange({
            range: '1w'
        });
        this.times2 = {
            presets: [{
                title: 'Last 1 Week',
                setRange: '1w'
            }, {
                title: 'Last 2 Weeks',
                setRange: '2w'
            },{
                title: 'Last 14 Days',
                setRange: '14d'
            }],
            selected: {
                title: 'Last 1 Week',
                dateRange: this.date2
            }
        };

        this.date3 = new DateRange({
            range: '120m'
        });
        this.times3 = {
            presets: [{
                title: 'Last 30 Minutes',
                setRange: '30m'
            }, {
                title: 'Last 10 Hours',
                setRange: '10h'
            },{
                title: this.date3.short(),
                fromDate: this.date3.get('fromDate'),
                toDate: this.date3.get('toDate')
            }],
            selected: {
                title: this.date3.short(),
                dateRange: this.date3
            }
        };

        this.date4 = new DateRange({
            range: '120m'
        });
        this.times4 = {
            presets: [{
                title: 'Last 30 Minutes',
                setRange: '30m'
            }, {
                title: 'Last 10 Hours',
                setRange: '10h'
            }],
            selected: {
                title: 'Last 120 Minutes',
                dateRange: this.date4
            }
        };

        this.date5 = new DateRange({
            range: '120m',
            useLocalTime: true
        });
        this.times5 = {
            presets: [{
                title: 'Last 30 Minutes',
                setRange: '30m'
            }, {
                title: 'Last 10 Hours',
                setRange: '10h'
            }],
            selected: {
                title: 'Last 120 Minutes',
                dateRange: this.date5
            }
        };
    },
    render: function () {
        var self = this;

        this.display = React.createClass({displayName: 'display',
            render: function() {
                return (
                    React.DOM.div(null, 
                        React.DOM.p(null, 
                            DateInspector( {model:self.date4} ),
                            TimeSelector( {presets:self.times4.presets, selected:self.times4.selected, includeCustomOption:true} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date5} ),
                            TimeSelector( {presets:self.times5.presets, selected:self.times5.selected, includeCustomOption:true} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date1} ),
                            TimeSelector( {presets:self.times.presets, selected:self.times.selected} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date2} ),
                            TimeSelector( {presets:self.times2.presets, selected:self.times2.selected} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date2} ),
                            TimeSelector( {presets:self.times2.presets, selected:self.times2.selected, updateOnChange:true} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date2} ),
                            TimeSelector( {presets:self.times2.presets, selected:self.times2.selected, updateOnChange:true} )
                        ),
                        React.DOM.p(null, 
                            DateInspector( {model:self.date3} ),
                            TimeSelector( {presets:self.times3.presets, selected:self.times3.selected} )
                        )
                    )
                );
            }
        });

        React.renderComponent(this.display(), this.el);
    }
});

module.exports = AppView;
});
