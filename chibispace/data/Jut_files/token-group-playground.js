define(function(require, exports, module) {
/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var TokenGroup = require('./token-group');

var AppView = Backbone.View.extend({
    initialize: function() {
        this.tokens1 = new Backbone.Model({
            tokens: [
                { id: '1', title: '1'},
                { id: '2', title: '2'},
                { id: '3', title: '3'}
            ]
        });

        this.tokens2 = new Backbone.Model({
            tokens: [
                { id: '1', title: 'This is a token'},
                { id: '2', title: 'Another Token'},
                { id: '3', title: 'token 3'},
                { id: '4', title: 'token 4'}
            ]
        });

        this.tokens3 = new Backbone.Collection([
            { id: '1', title: "I'm in a collection"},
            { id: '2', title: 'Another collection Token'},
            { id: '3', title: 'booya'},
            { id: '4', title: 'token 4.4.4.4.4'}
        ]);

        this.tokens4 = new Backbone.Collection([
            { id: '1', title: "Removable tokens"},
            { id: '2', title: '..woot..'},
            { id: '3', title: 'nice to meet you'},
            { id: '4', title: "don't eat me, please"}
        ]);

        this.tokens5 = new Backbone.Model({
            tokens: [
                { id: '1', title: 'Remove this'},
                { id: '2', title: 'Also remove this'},
                { id: '3', title: 'Why not?'},
                { id: '4', title: 'Yea, oh yeah.'}
            ]
        });
    },
    render: function () {
        var self = this;

        this.TokenGroups = React.createClass({displayName: 'TokenGroups',
            render: function() {
                return (
                    React.DOM.div(null, 
                        React.DOM.p(null, 
                            "Backbone.Model",
                            React.DOM.div(null, 
                                TokenGroup( {model:self.tokens1} )
                            ),
                            React.DOM.div(null, 
                                TokenGroup( {model:self.tokens2} )
                            ),
                            React.DOM.div(null, 
                            "Mirrors Removable",
                                TokenGroup( {model:self.tokens5} )
                            ),
                            React.DOM.div(null, 
                            "Removable",
                                TokenGroup( {model:self.tokens5, removable:true} )
                            )
                        ),
                        React.DOM.p(null, 
                            "Backbone.Collection",
                            React.DOM.div(null, 
                                TokenGroup( {model:self.tokens3} )
                            ),
                            React.DOM.div(null, 
                            "Mirrors the Removable",
                                TokenGroup( {model:self.tokens4} )
                            ),
                            React.DOM.div(null, 
                            "Removable",
                                TokenGroup( {model:self.tokens4, removable:true} )
                            )
                        )
                    )
                );
            }
        });

        React.renderComponent(this.TokenGroups(), this.el);
    }
});

module.exports = AppView;
});
