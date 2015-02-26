define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');

require('react.backbone');

var NavLink = React.createClass({displayName: 'NavLink',
    render: function() {
        return (
            React.DOM.li( {className:(this.props.key === this.props.selected) ? 'active': ''}, 
                React.DOM.a( {href:this.props.href}, this.props.children)
            )
        );
    }
})

var NavView = React.createBackboneClass({
    changeOptions: "change:selected",
    render: function() {
        var model = this.getModel();
        var selected = model.get('selected');

        var linkNodes = model.get('links').map(function (link) {
            return NavLink( {key:link.id, selected:selected, href:link.href}, link.text);
        });

        return (
            React.DOM.nav( {className:"navbar navbar-default navbar-fixed-top", role:"navigation"}, 
                React.DOM.div( {className:"container-fluid"}, 
                    React.DOM.ul( {className:"nav navbar-nav"}, 
                        linkNodes
                    )
                )
            )
        );
    },

    setSelected: function(selectedLink) {
        this.getModel().set('selected', selectedLink);
    }
});

module.exports = NavView;
});
