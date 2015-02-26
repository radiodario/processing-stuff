define(function(require, exports, module) {
/** @jsx React.DOM */
/* A stupidly simple select playground*/
var React = require('react');
var Backbone = require('backbone');
var Selector = require('./select');

var options = [
    { 
        name: 'Ringo Starr',
        value: 'ringo'
    },
    {
        name: 'George Harrison',
        value: 'george'
    },
    {
        name: 'John Lennon',
        value: 'john'
    },
    {
        name: 'Paul McCartney',
        value: 'paul'
    }
];

var model = new Backbone.Model({
    'beatle' : 'ringo'
});


var AppView = Backbone.View.extend({

    initialize: function() {
        model.on('change:beatle', this.render, this);
    },

    render: function () {
        // clear 
        React.renderComponent(Selector( {name:"beatle", label:"Select a Beatle", options:options, model:model} ), this.el);

        this.$el.append('<p>the selected beatle is ' + model.get('beatle') + '</p>');

    }
});


module.exports = AppView;});
