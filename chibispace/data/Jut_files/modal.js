define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');
var Backbone = require('backbone');

var $ = require('jquery');

var Modal = React.createBackboneClass({
    componentDidMount: function() {
        /**
         * From http://getbootstrap.com/javascript/#tooltips-examples
         * For performance reasons, the Tooltip and Popover data-apis are opt-in, meaning you must initialize them yourself.
         */
        $('.tooltip-jut', this.refs['modal'].getDOMNode()).tooltip();
        $('.popover-jut', this.refs['modal'].getDOMNode()).popover();
    },
    render: function() {
        return (
            React.DOM.div( {className:"modal fade", id:this.props.id, tabIndex:"-1", role:"dialog", 'aria-labelledby':"modalLabel", 'aria-hidden':"true", ref:"modal"}, 
                React.DOM.div( {className:"modal-dialog"}, 
                    React.DOM.div( {className:"modal-content"}, 
                        this.props.children
                    )
                )
            )
        );
    }
});

module.exports = Modal;
});
