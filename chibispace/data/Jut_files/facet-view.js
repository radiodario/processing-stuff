define(function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');

var BaseView = require('../../base-view');
var Logger = require('logger');
var DashboardMenu = require('../dashboards/dashboard-menu');
require('bootstrap_tooltip');
require('bootstrap_popover');

var charts = require('charts');
var model_wrapper = require('charts/search-bridge');


var FacetList = BaseView.extend({

    initialize : function (options) {
        this.facet = options.facet;
        this.listenTo(this.model, "after:change", this.render);

        this.logger = Logger.get("sidebar-facet-" + this.facet.field);
        this.logger.debug("init", this.facet);
    },

    render : function () {
        // XXX/demmer fixme #CAM-146
        if (! this.facet.visible) {
            this.logger.debug("suppressing render since not visible");
            return;
        }

        var self = this;
        self.$el.empty();
        _.each(this.model.models, function(m) {
            var name = m.get("key");
            var value = m.get("value");

            var maxlen = 18;
            var text = ((name.length > maxlen) ? name.slice(0, maxlen) + "..." : name)
                + " (" + value + ")";

            var link = $("<a>")
                    .attr("href", "#")
                    .attr("data-toggle", "tooltip")
                    .attr("title", name)
                    .append(text);

            var check = $("<input type=\"checkbox\">");
            check.prop("checked", m.get('selected'));
            check.on("change", function() {
                m.set('selected', check.prop("checked"));
            } );
            
            var label = $("<label class='checkbox'>")
                .attr("tooltip", name)
                .append(check)
                .append(link);
            self.$el.append(label);

            if (name.length > maxlen) {
                link.tooltip({container: '.page',
                              placement: 'right',
                              delay: { show: 500, hide: 100 }});
            }

            link.click(function(e) {
                check.attr("checked", !check.attr("checked"));
                m.set('selected', check.prop("checked"));
                return false;
            });
        });
    }
});

var FacetBars = BaseView.extend({
    initialize: function(options) {
        this.facet = options.facet;
        this.chart = null;

        this.logger = Logger.get("sidebar-facet-" + this.facet.field);
        this.logger.debug("init", this.facet);
    },

    render: function() {
        if (this.chart) {
            this.logger.error("FacetBars.render called multiple times for ",
                              this.facet.field);
            return;
        }

        this.chart = charts.row(this.el)
            .width(140)
            .height(150)
            .margins({top: 0, left: 5, right: 0, bottom: 20})
            .transitionDuration(500)
//            .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .elasticX(true);
        this.chart
            .xAxis().ticks(4);

        model_wrapper(this.chart, this.model, this);
        this.chart.render();
    }
});

var FacetPie = BaseView.extend({
    initialize: function(options) {
        this.facet = options.facet;
        this.chart = null;

        this.logger = Logger.get("sidebar-facet-" + this.facet.field);
        this.logger.debug("init", this.facet);
    },

    render: function() {
        if (this.chart) {
            this.logger.error("FacetPie.render called multiple times for ",
                              this.facet.field);
            return;
        }

        this.chart = charts.pie(this.el)
            .width(140)
            .transitionDuration(500);

        model_wrapper(this.chart, this.model, this);
        this.chart.render();
    }
});


var FacetView = BaseView.extend({

    events : {
        'click .jut-graph-select' : 'select_graph_type'
    },

    initialize: function(options) {
        this.facet = options.facet;
        this.search = options.search;
        
        var facet_defaults = {
            '@source_host' : 'bars',
            'client_browser' : 'bars',
            'client_os' : 'pie',
            'category_id' : 'bars',
            'verb' : 'pie'
        };

        this.graph_types = {
            'bars' : {name : 'Bar Graph', graph : FacetBars},
            'pie' : {name : 'Pie Chart', graph : FacetPie},
            'list' : {name : 'List', graph : FacetList}
        };

        //Assign default graph types. If none specified, default to list.
        if (facet_defaults[this.facet.field] && !this.facet.type) {
            this.facet.type = facet_defaults[this.facet.field];
        } else if (!this.facet.type) {
            this.facet.type = 'list';
        }

        this.graph = {
            type : this.facet.type,
            title : this.facet.field,
            source: {
                type: 'logs',
                title : this.facet.field,
                query : this.search.get_state_str(),
                field : this.facet.field,
                url : this.search.search.url,
                indices : this.search.search.indices
            },
            width: 250, height: 250
        };

        var cls = this.graph_types[this.facet.type].graph;
      
        this.graph_div = $("<div>");

        this.graph_view = new cls({
            model : this.facet.model,
            facet : this.facet,
            el : this.graph_div
        });

        this.div = $('<div class="drilldown">');
        this.render();
    },

    render: function() {      
        this.div.empty();
        var widget = $("<section>").attr("class", "widget");
        var header = $("<header>");
        header.append(this.build_dropdown());
        header.append("<h5>" + this.facet.name + "</h5>");
        this.graph_view.render();

        var body = $("<div>").attr("class", "body");
        body.append(this.graph_div);

        widget.append(header);
        widget.append(body);
        this.div.append(widget);
        this.$el.append(this.div);
    },

    build_dropdown : function () {
        var dropdown = $('<div>').addClass('dropdown').css('float', 'right');

        dropdown.append("<a class = 'dropdown-toggle' role = 'button' data-toggle = 'dropdown'  href = '#'><i class = 'fa fa-align-justify'/></a>");
        var list = $('<ul>')
            .addClass('dropdown-menu')
            .attr('id','dropdown-list');

        _.each(this.graph_types, function (value, key, graphs) {
            list.append("<li class = 'jut-graph-select' data-type = '" + key + "'><a href ='#'>" + value.name + "</a></li>");
        });

        list.append("<li class = 'divider'/>");

        if (this.model) {
            this.dashboard_menu = new DashboardMenu({
                model: this.model,
                el: list,
                graph: this.graph
            } );
            this.dashboard_menu.render();
        }

        dropdown.append(list);
        return dropdown;
    },

    select_graph_type : function (event) {
        event.preventDefault();
        this.graph_div.empty();
        this.facet.type = event.currentTarget.dataset.type;
        this.graph.type = event.currentTarget.dataset.type;
        this.graph_view = new this.graph_types[event.currentTarget.dataset.type].graph({
            model : this.facet.model,
            facet : this.facet,
            el : this.graph_div
        });

        this.graph_view.render();
        this.build_dropdown();
    }
});

module.exports = FacetView;
});
