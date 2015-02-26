define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');
var Backbone = require('backbone');
var $ = require('jquery');

var Modal = require('./modal');
var ModalHeader = require('./modal-header');

var SimpleModal = React.createBackboneClass({
    render: function() {
        var primaryButton, headerModal;
        var closeButtonText = this.props.closeButtonText || 'Close';
        var primaryButtonText = this.props.primaryButtonText || 'OK';

        if (this.props.primaryButtonHandler) {
            primaryButton = React.DOM.button( {type:"button", className:"btn btn-primary", onClick:this.props.primaryButtonHandler, 'data-dismiss':"modal"}, primaryButtonText);
        }

        if (this.props.title || this.props.headerClose) {
            headerModal = ModalHeader( {title:this.props.title, headerClose:this.props.headerClose} );
        }

        return (
            Modal( {id:this.props.id}, 
                headerModal,
                React.DOM.div( {className:"modal-body"}, 
                    this.props.children
                ),
                React.DOM.div( {className:"modal-footer"}, 
                    React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, closeButtonText),
                    primaryButton
                )
            )
        );
    }
});

module.exports = SimpleModal;
});
