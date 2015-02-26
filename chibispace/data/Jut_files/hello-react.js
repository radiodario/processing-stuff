define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');

var Hello = React.createClass({displayName: 'Hello',
    render: function() {
        return React.DOM.div(null, "Hello ", this.props.name);
    }
});

function renderHello(element) {
    React.renderComponent(Hello( {name:"React"} ), element);
}

module.exports = renderHello;
});
