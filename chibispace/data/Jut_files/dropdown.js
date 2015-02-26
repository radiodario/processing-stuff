define(function(require, exports, module) {
var Backbone = require('backbone');
var $ = require('jquery');
var layout = require('text!./dropdown-layout.html');
var _ = require('underscore');

var listTemplate = _.template('<ul class="dropdown-menu"><%= items %></ul>');
var itemTemplate = _.template('<li data-dd-index="<%= index %>"><a href="<%= href %>"><%- title %></a></li>');

var Dropdown = Backbone.View.extend({
    initialize: function(options) {
        this.title = options.title || "Dropdown";
        this.items = options.defaultItems || [];

        this.onSelectUpdateTitle = options.onSelectUpdateTitle;
    },
    events: {
        'click li': function(event) {
            var link = $(event.currentTarget).find('a');
            var index = $(event.currentTarget).data('dd-index');

            if (this.onSelectUpdateTitle) {
                this.$('.title').text(link.text());
            }

            var item = this.items[index];
            if (item && item.handler) {
                item.handler.call(this, item);
            }
        }
    },
    render: function() {
        var renderedItems = [];

        _.each(this.items, function(item, index) {
            if (item.setSelected) {
                this.title = item.title;
            }

            _.extend(item, { index: index });

            renderedItems.push(itemTemplate(item));
        }, this);

        var rendered = _.template(layout, {
            title: this.title,
            items: listTemplate({
                items: renderedItems.join('')
            })
        });

        this.$el.html(rendered);
    },
    addItem: function(newItem) {
        this.items.push(newItem);
    }
});

module.exports = Dropdown;
});
