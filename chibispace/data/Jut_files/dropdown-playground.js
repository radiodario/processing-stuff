define(function(require, exports, module) {
/*global alert:true*/

var Dropdown = require('./dropdown');
var _ = require('underscore');
var Backbone = require('backbone');

var layout = require('text!./dropdown-playground-layout.html');

var AppView = Backbone.View.extend({
    initialize: function () {
        this.createDropdown1();
        this.createDropdown2();
        this.createDropdown3();
    },

    render: function () {
        var rendered = _.template(layout);
        this.$el.html(rendered);

        this.dropdown.render();
        this.dropdown2.render();
        this.dropdown3.render();

        this.$el.append(this.dropdown.el);
        this.$el.append(this.dropdown2.el);
        this.$el.append(this.dropdown3.el);
    },

    createDropdown1: function() {
        this.dropdown = new Dropdown({
            title: 'Dropdown',
            onSelectUpdateTitle: true
        });

        this.dropdown.addItem({
            title: 'Item 1',
            href: '#toolbox/dropdown'
        });

        this.dropdown.addItem({
            title: 'Item 2',
            href: '#toolbox/dropdown',
            setSelected: true
        });

        this.dropdown.addItem({
            title: 'Item 3',
            href: '#toolbox/dropdown'
        });
    },
    createDropdown2: function() {
        this.dropdown2 = new Dropdown({
            title: 'Dropdown with handlers'
        });

        this.dropdown2.addItem({
            title: 'Item 1',
            href: '#toolbox/dropdown',
            handler: function(item) {
                alert('Clicked ' + item.title);
            }
        });

        this.dropdown2.addItem({
            title: 'Item 2',
            href: '#toolbox/dropdown',
            handler: function(item) {
                alert('Clicked ' + item.title);
            }
        });

        this.dropdown2.addItem({
            title: 'Item 3',
            href: '#toolbox/dropdown',
            handler: function(item) {
                alert('Clicked ' + item.title);
            }
        });
    },
    createDropdown3: function() {
        this.dropdown3 = new Dropdown({
            title: 'Go to app',
            defaultItems: [{
                title: 'Go to Campfire',
                href: '#campfire/'
            },{
                title: 'Go to Admin',
                href: '#admin/'
            }]
        });
    }
});

module.exports = AppView;
});
