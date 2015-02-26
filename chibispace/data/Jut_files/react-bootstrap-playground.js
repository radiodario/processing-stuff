define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var Button = require('react-bootstrap').Button;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem  = require('react-bootstrap').MenuItem;
var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;

var AppView = Backbone.View.extend({
    initialize: function() {
        this.key = 1;
    },
    render: function () {
        this.display = React.createClass({displayName: 'display',
            render: function() {

                return (
                    React.DOM.div(null, 
                        React.DOM.div(null, 
                            "Button",
                            Button( {onClick:this.handleClick}, "Title")
                        ),
                        React.DOM.div(null, 
                            "Dropdown Button",
                            DropdownButton( {title:"Title", onSelect:this.handleSelect}, 
                                MenuItem( {key:"1"}, "MenuItem 1 content"),
                                MenuItem( {key:"2"}, "MenuItem 2 content")
                            )
                        ),
                        React.DOM.div(null, 
                            "Tabbed Area",
                            TabbedArea( {title:"Title", initialActiveKey:1}, 
                                TabPane( {tab:"Tab 1", key:1}, "TabPane 1 content"),
                                TabPane( {tab:React.DOM.strong(null, "Tab 2"), key:2}, "TabPane 2 content")
                            )
                        )
                    )
                );
            },
            handleClick: function() {
                console.log('clicked');
            },
            handleSelect: function(selectedKey) {
                console.log('selectedKey', selectedKey);
            }
        });

        React.renderComponent(this.display(), this.el);
    }
});

module.exports = AppView;
});
