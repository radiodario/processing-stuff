define(function(require, exports, module) {
/** @jsx React.DOM */
/* A stupidly simple textfield playground*/
var React = require('react');
var Backbone = require('backbone');
var Textfield = require('./textfield');

var model = new Backbone.Model({
    'song' : 'slave to the rhythm'
});


var AppView = Backbone.View.extend({

    initialize: function() {
        model.on('change:song', this.render, this);
    },

    render: function () {
        // clear 
        React.renderComponent(Textfield( {name:"song", label:"Song Title", model:model} ), this.el);

        this.$el.append('<p>the song title is ' + model.get('song') + '</p>');

    }
});


module.exports = AppView;});
