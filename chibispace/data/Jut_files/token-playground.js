define(function(require, exports, module) {
/** @jsx React.DOM */
/*global alert:true*/

var React = require('react');
var Backbone = require('backbone');
var Token = require('./token');

var AppView = Backbone.View.extend({
    initialize: function() {
        this.removeHandler = function(token) {
            console.log('Clicked remove:', token);
            alert('Clicked remove on ' + token.get('title'));
        }.bind(this);

        this.token1 = new Backbone.Model({
            title: 'Token 1'
        });

        this.token2 = new Backbone.Model({
            title: 'Another Token'
        });

        this.token3 = new Backbone.Model({
            title: 'More Tokens!'
        });

        this.token4 = new Backbone.Model({
            title: 'Removable token'
        });
    },
    render: function () {
        var self = this;

        this.TokenDisplays = React.createClass({displayName: 'TokenDisplays',
            render: function() {
                return (
                    React.DOM.div(null, 
                        Token( {onRemove:self.removeHandler, model:self.token1} ),
                        Token( {model:self.token2} ),
                        Token( {model:self.token3} ),
                        Token( {onRemove:self.removeHandler, model:self.token4} )
                    )
                );
            }
        });

        React.renderComponent(this.TokenDisplays(), this.el);
    }
});

module.exports = AppView;
});
