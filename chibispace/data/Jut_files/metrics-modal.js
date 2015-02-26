define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');
var _ = require('underscore');
var Modal = require('applib/toolbox/modal/modal');
var ModalHeader = require('applib/toolbox/modal/modal-header');

var MetricsModal = React.createBackboneClass({
    componentWillMount: function() {
        //keep a local reference of what's been selected. onSave, these will update the underlying model
        this.setSelected();

        this.props.model.on('remove', function(model) {
            delete this.selected[model.get('attribute')];
            this.forceUpdate();
        }, this);

        this.props.model.on('add', function(model) {
            this.selected[model.get('attribute')] = model;
            this.forceUpdate();
        }, this);

        // WATCH OUT! only 'reset' wil fire because we're
        // resetting the model in @saveSelectedMetrics() every
        // time we close the modal!
        this.props.model.on('reset', function() {
            this.setSelected();
            this.forceUpdate();
        }, this);
    },
    componentWillUnmount: function() {
        // this.props.model.off(null, null, this);
    },
    render: function() {
        return (
            Modal( {id:this.props.id}, 
                ModalHeader( {title:"Select a Metric"} ),
                React.DOM.div( {className:"modal-body"}, 
                    React.DOM.div( {className:"list-group metricsListGroup"}, 
                        this.createMetricsItems()
                    )
                ),
                React.DOM.div( {className:"modal-footer"}, 
                    React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, "Cancel"),
                    React.DOM.button( {type:"button", className:"btn btn-primary", onClick:this.saveSelectedMetrics, 'data-dismiss':"modal"}, "OK")
                )
            )
        );
    },

    createMetricsItems: function() {
        var items = [];

        _.each(this.props.metrics.models, function(model) {
            var itemClass = "list-group-item";

            if (this.selected[model.get('attribute')]) {
                itemClass += ' active';
            }
            items.push(React.DOM.a( {key:model.get('attribute'), className:itemClass, onClick:this.selectMetric.bind(null, model)}, model.get('attribute')));
        }, this);

        return items;
    },

    setSelected: function() {
        this.selected = {};

        _.each(this.props.model.models, function(model) {
            this.selected[model.get('attribute')] = model;
        }, this);
    },

    selectMetric: function(model) {
        var selectedId = model.get('attribute');

        if (this.selected[selectedId]) {
            delete this.selected[selectedId];
        } else {
            this.selected[selectedId] = model;
        }

        this.forceUpdate();
    },

    saveSelectedMetrics: function() {
        var flatten = _.map(this.selected, function(model) { return model; });
        this.props.model.reset(flatten);
    }
});

module.exports = MetricsModal;
});
