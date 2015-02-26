define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var Timer = require('./timer');
var TimerView = require('./react-model-timer');

var AppView = Backbone.View.extend({
    initialize: function() {
        this.timer1 = new Timer();
        this.timer2 = new Timer({
            time: 300
        });
        this.timer3 = new Timer({
            time: 999
        });
        this.timer3.start();
    },
    render: function () {
        var self = this;

        this.timersView = React.createClass({displayName: 'timersView',
            render: function() {
                return (
                    React.DOM.div(null, 
                        TimerView( {model:self.timer1} ),
                        TimerView( {model:self.timer2} ),
                        TimerView( {model:self.timer3} )
                    )
                );
            }
        });

        React.renderComponent(this.timersView(), this.el);
    }
});

module.exports = AppView;
});
