define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');

var Modal = require('./modal');
var ModalHeader = require('./modal-header');
var SimpleModal = require('./simple-modal');

var AppView = Backbone.View.extend({
    initialize: function() {

    },
    render: function () {
        var self = this;

        this.display = React.createClass({displayName: 'display',
            componentWillMount: function() {
                this.simpleModalId = 'simpleModal';
                this.simpleModalId2 = 'simpleModal2';
                this.simpleModalId3 = 'simpleModal3';

                this.primaryButtonHandler = function () {
                    console.log('Button clicked!');
                };

                this.jutModalId = 'jutModal';
            },
            render: function() {
                return (
                    React.DOM.div(null, 
                        React.DOM.p(null, 
                            React.DOM.button( {className:"btn btn-primary", 'data-toggle':"modal", 'data-target':'#' + this.simpleModalId}, "Simple modal"),
                            SimpleModal( {id:this.simpleModalId} , 
                                "Hey this is a really simple modal!"
                            )
                        ),
                        React.DOM.p(null, 
                            React.DOM.button( {className:"btn btn-primary", 'data-toggle':"modal", 'data-target':'#' + this.simpleModalId2}, "Simple modal 2"),
                            SimpleModal( {id:this.simpleModalId2, headerClose:true, title:"Simple Modal w/ Close"}, 
                                React.DOM.p(null, "Hey this is a really simple modal with a close in the header!"),
                                React.DOM.div(null, "HTML elements in here!")
                            )
                        ),
                        React.DOM.p(null, 
                            React.DOM.button( {className:"btn btn-primary", 'data-toggle':"modal", 'data-target':'#' + this.simpleModalId3}, "Simple modal 3"),
                            SimpleModal( {id:this.simpleModalId3, primaryButtonHandler:this.primaryButtonHandler}, 
                                "Hey this is a really simple modal with a primary button!",
                                React.DOM.p(null, React.DOM.a( {className:"tooltip-jut", title:"", 'data-original-title':"Tooltip"}, "This link"), " and ", React.DOM.a( {className:"tooltip-jut", title:"", 'data-original-title':"Tooltip"}, "that link"), " should have tooltips on hover.")
                            )
                        ),
                        React.DOM.p(null, 
                            React.DOM.button( {className:"btn btn-primary", 'data-toggle':"modal", 'data-target':'#' + this.jutModalId}, "Full Modal"),
                            Modal( {id:this.jutModalId}, 
                                ModalHeader( {title:"This is a full modal"} ),
                                React.DOM.div( {className:"modal-body"}, 
                                    React.DOM.h4(null, "Text in a modal"),
                                    React.DOM.p(null, "Duis mollis, est non commodo luctus, nisi erat porttitor ligula."),

                                    React.DOM.h4(null, "Popover in a modal"),
                                    React.DOM.p(null, "This ", React.DOM.a( {role:"button", className:"btn btn-default popover-jut", title:"", 'data-content':"And here's some amazing content. It's very engaging. right?", 'data-original-title':"A Title"}, "button"), " should trigger a popover on click."),

                                    React.DOM.h4(null, "Tooltips in a modal"),
                                    React.DOM.p(null, React.DOM.a( {className:"tooltip-jut", title:"", 'data-original-title':"Tooltip"}, "This link"), " and ", React.DOM.a( {className:"tooltip-jut", title:"", 'data-original-title':"Tooltip"}, "that link"), " should have tooltips on hover."),

                                    React.DOM.hr(null),

                                    React.DOM.h4(null, "Overflowing text to show scroll behavior"),
                                    React.DOM.p(null, "Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros."),
                                    React.DOM.p(null, "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."),
                                    React.DOM.p(null, "Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla."),
                                    React.DOM.p(null, "Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros."),
                                    React.DOM.p(null, "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."),
                                    React.DOM.p(null, "Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla."),
                                    React.DOM.p(null, "Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros."),
                                    React.DOM.p(null, "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."),
                                    React.DOM.p(null, "Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.")
                                ),
                                React.DOM.div( {className:"modal-footer"}, 
                                    React.DOM.button( {type:"button", className:"btn btn-primary", onClick:this.primaryButtonHandler, 'data-dismiss':"modal"}, "Primary"),
                                    React.DOM.button( {type:"button", className:"btn btn-success", onClick:this.primaryButtonHandler, 'data-dismiss':"modal"}, "Success"),
                                    React.DOM.button( {type:"button", className:"btn btn-danger", onClick:this.primaryButtonHandler}, "Danger")
                                )
                            )
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
