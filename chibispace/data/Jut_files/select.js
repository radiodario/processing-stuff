define(function(require, exports, module) {
/** @jsx React.DOM */
/* A stupidly simple select */
var React = require('react');

var Selector = React.createClass({displayName: 'Selector',

    handleSelection: function(option) {
        // this assumes we've passed a model. If we have, it'll set
        // the 'name' attribute of the model to the selected value
        if (this.props.hasOwnProperty('model')) {
            this.props.model.set(this.props.name, option.value);
        }
        
        // if we've defined a onSelect function, we call it
        // with the current value. This is useful for creating
        // custom behaviour
        if (this.props.hasOwnProperty('onSelect')) {
            this.props.onSelect(this.props.name, option.value);
        }

        // set the state to the current selected thing to
        this.setState({
            name : option.name,
            value : option.value
        });
    },

    getInitialState: function(event) {

        if (this.props.hasOwnProperty('model')) {
            var value = this.props.model.get(this.props.name);
            var name;
            var i, opt;
            for (i = 0; i < this.props.options.length; i++) {
                var opt = this.props.options[i];
                if (opt.value === value) {
                    return opt;
                } 
            }
        }

        return this.props.options[0]
    },

    

    createOption: function(option) {
        return (
            React.DOM.li( {key:option.value}, 
             React.DOM.a( {onClick:this.handleSelection.bind(null, option)}, option.name)
            )
        );
    },

    render : function() {

        var options = this.props.options.map(this.createOption);

        var value = this.state.value;

        return (
            React.DOM.div( {className:"selector"}, 
                React.DOM.div( {className:"label selectorLabel"}, this.props.label),
                React.DOM.button( {type:"button", className:"btn btn-default dropdown-toggle col-md-12", 'data-toggle':"dropdown"}, 
                React.DOM.span(null, this.state.name), " ", React.DOM.span( {className:"caret"})
                ),
                React.DOM.ul( {className:"dropdown-menu", role:"menu"}, 
                    options
                )
            )
        );
    }
})


module.exports = Selector;});
