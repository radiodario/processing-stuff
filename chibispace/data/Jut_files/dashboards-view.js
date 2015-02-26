define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');

var DashboardsView = React.createClass({displayName: 'DashboardsView',
    render: function() {
        return (
            React.DOM.div( {className:"row"}, 
                React.DOM.div( {className:"col-md-3 panel"}, "Sidebar"),
                React.DOM.div( {className:"col-md-9"}, "Dashboards")
            )
        );
    }
});

module.exports = {
    view: DashboardsView,
    linkId: 'dashboards'
};
});
