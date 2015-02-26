define(function(require, exports, module) {
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require("backbone");
var BaseView = require('../../base-view');
require('backbone_collectionview');
var ServersCollection = require('./../../models/servers');
require('bootstrap_multiselect');
var d3 = require('d3');
var charts = require('charts');
var DashboardModel = require('services/config/models/dashboard-model');
var DashboardMenu = require('../dashboards/dashboard-menu');
var StatsSource = require('../stats/stats-src');

var Handlebars = require('handlebars');
var ServerChartViewTemplate = require('text!./templates/stats/servers-chart-view.hbs');
var ToolbarTemplate = require('text!./templates/stats/toolbar.hbs');
var ServersListSidebarTemplate = require('text!./templates/stats/servers-list-sidebar-row-view.hbs');
var ServersViewTemplate = require('text!./templates/stats/servers-view.hbs');

var ServerChartView = BaseView.extend({
    template: Handlebars.compile(ServerChartViewTemplate),
    charts: {},
    initialize: function(options) {
        this.listenTo(this.collection.metricCollection, 'change', this.updateDisplayedCharts);

        this.dashboards = new DashboardModel([], {db_container : options.app.active_deployment});
        this.dashboards.fetch();
    },
    render: function() {
        // XXX use GraphView
        this.$el.empty();
        this.$el.append(this.template({metricTypes: this.collection.metricCollection.toJSON()}));
        var self = this;
        var enabledMetrics = this.collection.metricCollection.pluck('name');
        _.each(enabledMetrics, function(metric) {
            self.addDashboardMenu(metric);
            self.addChart(metric);
        });
    },
    addDashboardMenu: function(metric) {
        var self = this;
        var m = new DashboardMenu({
                model: this.dashboards,
                el: $('[id="' + metric + '-dashboard-menu"]'),
                graph: function() {
                    var activeCharts = _.map(self.collection.where({'chartActive': true}), function(server) {
                        var source = {
                            'title' : server.get('host'),
                            'type': 'stats',
                            'stat': metric,
                            'host': server.get('host'),
                            'url': _.result(server.get('metrics').findWhere({name: metric}), 'url')
                        };
                        return source;
                    });
                    return {
                        title : metric,
                        type: 'timeline',
                        source: activeCharts,
                        width: 600, height: 200
                    };
                }
            } );
        m.render();
    },
    addChart: function(metric) {
        var div = $('[id="' + metric + '-chart"]');

        var chart = charts.line(div.get(0))
            .width(600)
            .height(200)
            .elasticX(true)
            .elasticY(true)
            .margins({left: 50, top: 10, right: 50, bottom: 30})
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .brushOn(false);

        chart.yAxis()
            .tickFormat(function(d) {
                var prefix = d3.formatPrefix(d);
                return prefix.scale(d) + prefix.symbol;
            });
                        
        var scale = d3.time.scale();
        chart.x(scale);
        this.charts[metric] = chart;
        
        chart.render();
    },
    updateDisplayedCharts: function(changedMetric) {
        // kinda hacky but needed for ids with .
        $('[id="' + changedMetric.get('name') + '-chart"]').toggleClass('hidden', !changedMetric.get('active'));
    },
    updateSelectedServers: function(newServers, oldServers) {
        var self = this;
        // this belongs in the serversListView
        _.each(_.difference(oldServers, newServers), function(server) {
            server.set('chartActive', false);
        });
        _.each(this.charts, function(chart, metric) {
            // XXX this is bad, but the charts don't yet have a way to exit data by index.
            _.each(chart.data(), function(data, index) {
                return chart.data([], index);
            });
            chart.expireCache();
            chart.redraw();
            _.each(newServers, function(server, i) {
                self.addSource(server.get('metrics').get(metric), chart, i);
                server.set({'chartActive': true});
            });
        });
    },
    addSource: function(server, chart, layer) {
        var src;
        src = StatsSource(_.result(server, 'url'), layer);
        src(chart);
    }
});

var ServerToolbarView = BaseView.extend({
    template: Handlebars.compile(ToolbarTemplate),
    initialize: function() {

    },
    render: function() {

        this.$el.html(this.template({metrics: this.collection.metricCollection.toJSON()}));
        this.initializeSelect();
    },
    initializeSelect: function() {
        var self = this;
        $('select', this.$el).multiselect({
            buttonClass: 'btn btn-info btn-sm',
            buttonText: function(options, select) {
                return '<i class="fa fa-cog"></i>'; //"Select Statistics";
            },
            maxHeight: 500,
            dropRight: true,

            onChange: function(element, checked) {
                self.collection.metricCollection.findWhere({'name': element.val()}).set('active', checked);
            }
        });
    }
});

var ServerRowView = BaseView.extend( {
    template: Handlebars.compile(ServersListSidebarTemplate),
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.listenTo(this.model, 'change:chartActive', this.toggleChartColor);
    },
    toggleChartColor: function(model) {
        $('.server-color', this.$el).css('background-color', model.get('chartColor')).toggleClass('hidden', !model.get('chartActive'));
    }
});

var StatsView = BaseView.extend({
    template: Handlebars.compile(ServersViewTemplate),
    initialize: function(options) {
        this.collection = new ServersCollection([], {app: options.app});

        this.serverToolbarView = new ServerToolbarView({ collection: this.collection });
        this.serverChartView   = new ServerChartView({ 
            collection: this.collection,
            app: options.app 
        });

        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'destroy', this.remove);
        this.listenTo(this.collection, 'reset', this.renderSeverListView);
    },
    assignSubviews : function (selector, view) {
        // XXX extract this out into a baseview class
        var selectors;
        if (_.isObject(selector)) {
            selectors = selector;
        }
        else {
            selectors = {};
            selectors[selector] = view;
        }
        if (!selectors) {
            return;
        }
        _.each(selectors, function (view, selector) {
            view.setElement(this.$(selector)).render();
        }, this);
    },
    render: function() {
        this.$el.html(this.template());

        this.assignSubviews({
            '#servers-toolbar'      : this.serverToolbarView,
            '#servers-chart-view'   : this.serverChartView
        });

        return this;
    },
    renderSeverListView: function() {

        // XXX figure out how to work around the backbone babysitter crap
        // XXX this is a mess.
        this.serversListView = new Backbone.CollectionView({
            el: $('#servers-list-sidebar'),
            collection: this.collection,
            selectable : true,
            selectMultiple : true,
            modelView : ServerRowView,
            emptyListCaption : "Add a Server to get started"
        });
        this.serversListView.render();
        this.listenTo(this.serversListView, 'selectionChanged', this.serverChartView.updateSelectedServers.bind(this.serverChartView));
        if (this.collection.length > 0) {
            // enable the first model
            this.serversListView.setSelectedModel(this.collection.at(0));
        }
    }
});

module.exports = StatsView;
});
