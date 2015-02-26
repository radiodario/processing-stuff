define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
var Backbone = require('backbone');
require('react.backbone');

var GroupTag = React.createBackboneClass({

    render: function() {
        var model = this.props.model;
        var displayClasses = ''
        if (model.get('active')) {
            displayClasses += 'selected ';
        }
        if (model.isFiltered()) {
            displayClasses += 'disabled ';
        }
        return (
            React.DOM.li( {key:model.cid, onClick:this.props.onClick, className:displayClasses} , 
                model.get('title')
            )
        );
    }
});

var GroupTagSelect = React.createBackboneClass({

    render: function() {
        var self = this;
        var collection = this.props.collection;
        var groupTags = null;

        if (collection) {
            groupTags = collection.map(function(model) {
                                    return (
                                        GroupTag( {model:model, onClick:collection.setActive.bind(collection, model)} )
                                    );
                                });
        } else {
            groupTags = (React.DOM.li(null, "No available infrastructure"));
        }

        return (
            React.DOM.div( {className:"group-tag-select"}, 
                React.DOM.h5(null, 
                    this.props.groupType
                ),
                React.DOM.ul( {className:"list-unstyled"}, 
                    groupTags
                )
            )
        );
    }
});

module.exports = GroupTagSelect;
});
