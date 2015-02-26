define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');
var Backbone = require('backbone');

var ModalHeader = React.createBackboneClass({
    render: function() {
        var headerClose, headerTitle;

        if (this.props.headerClose) {
            headerClose = React.DOM.button( {type:"button", className:"close", 'data-dismiss':"modal", 'aria-hidden':"true"}, "×");
        }

        if (this.props.title) {
            headerTitle = React.DOM.h4( {className:"modal-title", id:"modalLabel"}, this.props.title);
        }

        return (
            React.DOM.div( {className:"modal-header"}, 
                headerClose,
                headerTitle,
                this.props.children
            )
        );
    }
});

module.exports = ModalHeader;
});