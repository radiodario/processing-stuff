define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');

var TimerView = React.createBackboneClass({
    changeOptions: "change:time",
    render: function() {
        return (
            React.DOM.div(null, 
                React.DOM.h1(null, this.getModel().get("time")),
                React.DOM.div( {class:"timerControls"}, 
                    React.DOM.button( {onClick:this.start}, "Start"),
                    React.DOM.button( {onClick:this.stop}, "Stop"),
                    React.DOM.button( {onClick:this.reset}, "Reset")
                )
            )
        );
    },
    start: function() {
        this.getModel().start();
    },
    stop: function() {
        this.getModel().stop();
    },
    reset: function() {
        this.getModel().reset();
    }
});

module.exports = TimerView;
});
