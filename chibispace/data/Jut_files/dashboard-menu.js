define(function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');
var BaseView = require('../../base-view');
var Logger = require('logger');

require('bootstrap_tooltip');
require('bootstrap_popover');


var DashboardItem = BaseView.extend({
    tagName : 'li',
    events : {
        'click' : 'addGraph'
    },

    initialize : function (options) {
        this.render();
    },

    render : function () {
        this.$el.html("<a href ='#'>" + this.model.get('name') + "</a>");
        return this;
    },

    addGraph : function(event) {
        event.preventDefault();
        this.model.addGraph(_.result(this.options, 'graph'));
    }
});

var DashboardMenu = BaseView.extend({
    initialize: function(options) {
        this.logger = Logger.get('dashboards');
        this.items = this.model.models.map(function(model) {
            return new DashboardItem({
                model : model,
                graph: options.graph
            });
        });

        this.listenTo(this.model, "add", this.add_item, this);
        this.listenTo(this.model, "remove", this.remove_item, this);
        this.listenTo(this.model, "change", this.change_item, this);
        this.listenTo(this.model, "reset", this.reset, this);
    },

    render: function() {
        var self = this;
        _(this.items).each(function(i) {
            i.render();
            self.$el.append(i.el);
        } );

        this.divider = $("<li class = 'divider'/>");
        this.$el.append(this.divider);
       
        var add_dashboard_link = $('<a href="javascript:void(0);" id="add-dashboard">')
            .html("Add Dashboard");

        add_dashboard_link.on('click', function(e) { e.preventDefault(); } );
        
        var add_li = $("<li>");
        add_li.append(add_dashboard_link);
        add_li.on('click', function(e) { e.stopPropagation(); } );

        this.$el.append(add_li);
        add_dashboard_link.popover({
            title : 'Add New Dashboard',
            html : true,
            content : "<form><input id = 'add-dashboard-input' type = 'text' placeholder = 'Dashboard Title...' />"
                + "<input id = 'add-dashboard-btn' type = 'submit' class = 'btn btn-default' value = 'Add'/>"
                + "</form>",
            container: this.el
        });

        this.$el.delegate('#add-dashboard-btn', 'click',
                          _.bind(this.add_dashboard, this));
    },

    add_dashboard : function (event) {
        event.preventDefault();
        var newModel = new this.model.model({
            name : this.$el.find('#add-dashboard-input').val()
        });

        this.model.add(newModel);
        newModel.addGraph(_.result(this.options, 'graph'));
        this.$el.find('#add-dashboard').popover('toggle');
        this.$el.dropdown('toggle');
    },


    add_item: function(model) {
        var item = new DashboardItem({
            model : model,
            graph: this.options.graph
        });
        
        this.items.push(item);
        item.render();
        this.divider.before(item.el);
    },

    remove_item: function(model) {
        for (var i=0; i<this.items.length; i++) {
            if (this.items[i].model === model) {
                this.items[i].$el.remove();
                this.items[i].close();
                this.items.splice(i, 1);
                return;
            }
        }
        this.logger.error('could not find removed dashboard model...');
    },

    change_item: function(model) {
        this.logger.debug('XXX change item');
    },

    reset: function(collection) {
        this.logger.debug('XXX got reset on dashboards');
    }
});

module.exports = DashboardMenu;
});
