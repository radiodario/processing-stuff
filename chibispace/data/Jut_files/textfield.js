define(function(require, exports, module) {
/** @jsx React.DOM */
/* A stupidly simple text field */
var React = require('react');
module.exports = React.createClass({displayName: 'exports',

    handleChange: function(event) {
        // this assumes we've passed a model. If we have, it'll set
        // the 'name' attribute of the model to the selected value
        if (this.props.hasOwnProperty('model')) {
            this.props.model.set(this.props.name, event.target.value);
        }
        
        // if we've defined a onSelect function, we call it
        // with the current value. This is useful for creating
        // custom behaviour
        if (this.props.hasOwnProperty('onSelect')) {
            this.props.onSelect(this.props.name, event.target.value);
        }

        this.setState({value : event.target.value})
    },

    getInitialState: function(event) {
        return {value : this.props.model.get(this.props.name)};
    },

    componentDidMount: function(event) {
    },

    render : function() {
        var value = this.state.value;

        return (
            React.DOM.div( {className:"textfield col-md-2"}, 
                React.DOM.label( {htmlFor:this.props.name}, this.props.label),
                React.DOM.input( {type:"text", name:this.props.name, onChange:this.handleChange, value:value})
            )
        );
    }
})
});
