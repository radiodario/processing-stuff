define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');

var Token = React.createBackboneClass({
    render: function() {
        var removeButton = '';
        var model = this.getModel();

        var displayAttribute = this.props.displayAttribute || 'title';

        if (this.props.onRemove) {
            removeButton = React.DOM.i( {className:"fa fa-times-circle-o remove", onClick:this.props.onRemove.bind(null, model)});
        }

        return (
            React.DOM.span( {className:"label label-default token"}, 
                model.get(displayAttribute),
                removeButton
            )
        );
    }
});

module.exports = Token;
});
