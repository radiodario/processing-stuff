define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var GroupTagSelect = require('./group-tag-select');
require('react.backbone');

var AppView = Backbone.View.extend({
    initialize: function() {
        var Infrastructure = Backbone.Model.extend({
            defaults: {
                active: false,
                filtered: false
            },

            isFiltered: function() {
                // insert real filter logic, just applies the 'disabled' class for now
                return this.get('filtered');
            }
        });

        var InfrastructureCollection = Backbone.Collection.extend({
            model: Infrastructure,
            setActive: function(newActiveModel) {
                // Currently only allow one active tag per group at a time
                this.where({active: true}).forEach(function(model) {
                    if (model !== newActiveModel) {
                        model.set({active: false});
                    }
                });
                newActiveModel.set({active: true});
            }
        });

        this.regions = new InfrastructureCollection([
            { id: '1', title: 'Americas' },
            { id: '2', title: 'EU' },
            { id: '3', title: 'APAC', active: true }
        ]);
        this.pools = new InfrastructureCollection([
            { id: '1', title: 'atl', active: true, region_id: '1' },
            { id: '2', title: 'dal', region_id: '2' },
            { id: '3', title: 'dia', region_id: '1' }
        ]);
        this.servers = new InfrastructureCollection([
            { id: '1', title: 'e23456', pool_id: '3' },
            { id: '2', title: 'f34234', pool_id: '3', active: true },
            { id: '3', title: 'g25135', pool_id: '3', filtered: true },
            { id: '4', title: 'h23456', pool_id: '3' },
            { id: '5', title: 'i34234', pool_id: '3' },
            { id: '6', title: 'j25135', pool_id: '3' },
            { id: '7', title: 'k23456', pool_id: '3' },
            { id: '8', title: 'l34234', pool_id: '3' },
            { id: '9', title: 'm25135', pool_id: '3' }
        ]);
    },
    render: function () {
        var self = this;
        var backgroundStyle = {
            background: "#d8d8d8"
        }

        // Totally unrelated and hacky helper to show the underlying backbone collections
        var CollectionGroup = React.createBackboneClass({
            onModelChange: function() {
                this.forceUpdate();
            },
            render: function() {
                var columnNames = this.props.collection.at(0).keys();
                var tableHead = columnNames.map(function(attr) {
                    return (
                        React.DOM.th(null, attr)
                    );
                });

                var prettyJSON = this.props.collection.map(function(model) {
                    /* this generates a "bind(): You are binding a component
                        method to the component. React does this for you
                        automatically in a high-performance way, so you can
                        safely remove this call. See undefined" warning in the
                        browser.  In practice, it's probably better to have a
                        separate React.createBackboneClass for the tr's, but
                        this is just to show the data from the sidebar.
                    */

                    self.listenTo(model, 'change', this.onModelChange.bind(this));

                    return (
                        React.DOM.tr( {key:model.cid}, 
                            columnNames.map(function(name) {
                                return (
                                    React.DOM.td(null, model.get(name).toString())
                                );
                            })
                        )
                    )
                }, this);

                return (
                    React.DOM.table( {cellPadding:"5"}, 
                        React.DOM.thead(null, React.DOM.tr(null, tableHead)),
                        React.DOM.tbody(null, prettyJSON)
                    )
                );
            }
        });

        this.GroupTagSelects = React.createBackboneClass({
            render: function() {
                return (
                    React.DOM.div(null, 
                        React.DOM.div( {className:"col-md-2", style:backgroundStyle}, 
                            React.DOM.p(null, 
                                "GroupTagSelect",
                                React.DOM.div(null, 
                                    GroupTagSelect( {groupType:'Regions', collection:self.regions} ),
                                    GroupTagSelect( {groupType:'Pools', collection:self.pools} ),
                                    GroupTagSelect( {groupType:'Servers', collection:self.servers} )
                                )
                            )
                        ),
                        React.DOM.div( {className:"col-md-10"}, 
                            React.DOM.p(null, 
                                CollectionGroup( {collection:self.regions} )
                            ),
                            React.DOM.p(null, 
                                CollectionGroup( {collection:self.pools} )
                            ),
                            React.DOM.p(null, 
                                CollectionGroup( {collection:self.servers} )
                            )
                        )
                    )
                );
            }
        });

        React.renderComponent(this.GroupTagSelects(), this.el);
    }
});

module.exports = AppView;
});
