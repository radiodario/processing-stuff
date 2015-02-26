define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');
require('react.backbone');
var Backbone = require('backbone');

var Token = require('../token/token');

var TokenGroup = React.createBackboneClass({
    render: function() {
        return (
            React.DOM.span( {className:"tokenGroup"}, 
                this._createTokens()
            )
        );
    },

    _createTokens: function() {
        var self = this;
        var tokens = [];
        var model = this.getModel();
        var iterator;
        var removable = this.props.removable;
        var displayAttribute = this.props.displayAttribute;

        if (model instanceof Backbone.Collection) {
            iterator = model;
        } else {
            iterator = model.get('tokens');
        }

        iterator.forEach(function (token) {
            if (!(token instanceof Backbone.Model)) {
                token = new Backbone.Model(token);
            }

            var tokenEl = Token( {key:token.get('id'), displayAttribute:displayAttribute, model:token, onRemove:(removable) ? self.removeToken : null} );
            tokens.push(tokenEl);
        });

        return tokens;
    },

    removeToken: function(token) {
        var model = this.getModel();
        var tokens;

        if (model instanceof Backbone.Collection) {
            model.remove(token);
        } else {
            tokens = model.get('tokens').filter(function(checkToken) {
                if (token.id) {
                    return checkToken.id !== token.id;
                } else {
                    return checkToken.title !== token.title;
                }

            });
            model.set('tokens', tokens);
        }
    }
});

module.exports = TokenGroup;
});
