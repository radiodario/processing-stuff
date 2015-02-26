define(function(require, exports, module) {

var BaseView = require('../../base-view');
var _ = require('underscore');
var $ = require('jquery');
var charts = require('charts');
var d3 = require('d3');
var template = require("text!./dashboards.html");
require('jquery_ui');

var DashboardCollection = require('services/config/models/dashboard-model');
var search_src = require('./dashboard-src');
var EventSource = require('../../models/event-src');
var RumSource = require('../rum/rum-source');
var StatsSource = require('../stats/stats-src');
require('bootstrap_collapse');

function compare_positions (pos1, pos2) {

    var s1 = ((pos1[0][0] > pos2[0][0]) && (pos1[0][0] < pos2[0][1])) || ((pos1[0][1] > pos2[0][0]) && pos1[0][1] < (pos2[0][1]));
    var s2 = ((pos1[1][0] > pos2[1][0]) && (pos1[1][0] < pos2[1][1])) || ((pos1[1][1] > pos2[1][0]) && pos1[1][1] < (pos2[1][1]));

    var s3 = ((pos2[0][0] > pos1[0][0]) && (pos2[0][0] < pos1[0][1])) || ((pos2[0][1] > pos1[0][0]) && pos2[0][1] < (pos1[0][1]));
    var s4 = ((pos2[1][0] > pos1[1][0]) && (pos2[1][0] < pos1[1][1])) || ((pos2[1][1] > pos1[1][0]) && pos2[1][1] < (pos1[1][1]));


    var sides = s1 + s2;
    var reverse = s3 + s4;
  //  var reverse = s5 + s6 + s7 + s8;
    if (sides > 1 || reverse >1) {
        return true;
    } else {
        return (false);
    }
}

function get_position (element) {
    var pos, width, height;
    pos = element.position();
    width = element.width();
    height = element.height();
    return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];  
}

var GraphView = BaseView.extend({

    tagName : 'section',

    className : 'jut-graph-view widget',

    events : {
        'click .jut-dropdown-toggle' : 'check_offscreen'
    },

    initialize : function(options) {
        this.padding = options.padding || 4;
        this.graph = options.graph;
        this.position = options.graph.position;
        this.uniqueid = options.uniqueid;
    
        this.$el.bind('dragstop', _.bind(this.update_position, this));
        this.$el.bind('resize', _.bind(this.resize, this));

        this.render();
    },

    render : function () {
        this.header_div = $('<header>')
        //    .addClass("jut-graph-title")
            .append('<h4 id="graph_title">' + this.graph.title + '</h4>');
        this.chartdiv = $('<div class = "body no-margin">')
            .attr('id', this.uniqueid)
            .css({
                'padding': '' + this.padding + 'px',
                'height': '100%'
            });
        this.header_div.height(30);
        this.$el.append(this.header_div);
        this.$el.append(this.chartdiv);



        var chartel = this.chartdiv.get(0);

        this.chart;
        // XXX rename this to row
        if (this.graph.type === 'bars' || this.graph.type === 'list') {
            this.chart = charts.row(chartel)
                .margins({top: 0, left: 5, right: 0, bottom: 20})
                .transitionDuration(500)
                .elasticX(true);
            this.chart
                .xAxis().ticks(4);
            
        }
        else if (this.graph.type === 'pie') {
            this.chart = charts.pie(chartel)
                .transitionDuration(500);
        }
        else if (this.graph.type === 'timelinebars') {
            this.chart = charts.bar(chartel)
                .transitionDuration(500)
                .margins({top: 10, right: 50, bottom: 30, left: 40})
                .elasticY(true)
                .centerBar(true)
                .gap(1)
                .xUnits(d3.time.hours)
                .round(d3.time.hours.round)
                .brushOn(false)
                .discretey(true);
        }
        else if (this.graph.type === 'timeline') {
            this.chart = charts.line(chartel)
                .transitionDuration(500)
                .margins({top: 10, right: 20, bottom: 30, left: 40})
                .elasticX(true)
                .elasticY(true)
                .stacked(false)
                .brushOn(false)
                .renderArea(true)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .hoverSelect(true)
            ;

            // XXX
            var pretty_yaxes;
            if (Array.isArray(this.graph.source)) {
                pretty_yaxes = _.each(this.graph.source, function(s) { return s.type === 'stats'; });
            }
            else {
                pretty_yaxes = this.graph.source.type === 'stats';
            }
            if (pretty_yaxes) {
                this.chart.yAxis()
                    .tickFormat(function(d) {
                        var prefix = d3.formatPrefix(d);
                        return prefix.scale(d) + prefix.symbol;
                    });
            }

            // XXX
            if (Array.isArray(this.graph.source) && this.graph.source.length > 1) {
                this.chart.layered(true);
            }
        }
        else if (this.graph.type === 'bar') {
            this.chart = charts.bar(chartel)
                .transitionDuration(500)
                .margins({top: 10, right: 50, bottom: 30, left: 50})
                .gap(2)
                .x(d3.scale.ordinal())
                .elasticY(true)
                .elasticX(true)
                .discretey(true);
        }
        else if (this.graph.type === 'list') {
            // XXX
        }

        if (!this.chart) {
            throw new Error('do not know chart type ' + this.graph.type);
        }

        if (this.graph.width) {
            this.$el.width(this.graph.width);
            this.chart.width(this.graph.width - 2*this.padding);
        }
        if (this.graph.height) {
            this.$el.height(this.graph.height);
            this.chart.height(this.graph.height
                         - this.header_div.outerHeight() - 2*this.padding);
        } 

        var self = this;
        var sources = this.graph.source;
        if (! Array.isArray(sources)) {
            sources = [ sources ];
            this.add_source(this.graph.source, this.chart, this.graph.type);
        }
        else {
            _(sources).each(function(src, i) {
                self.add_source(src, self.chart, self.graph.type, i);
            } );
        }

        this.legend_items = _(sources).map(function(src, i) {
            return {
                name: src.title ? src.title : 'item ' + i,
                color: self.chart.colors()(i)
            };
        } );


        if (this.graph.show_events) {
            var evtsrc = this.options.page.event_source;
            evtsrc.ready(function() {
                charts.annotations(self.chart, ".jut-events-container")
                    .data(evtsrc.get_event_list())
                    .colors(['orange']);
            });

            this.legend_items.push({name : "Events", color: "orange", shape: "circle"});
        }

        var legend = null;
        if (this.legend_items.length > 1) {
            var legend_width = 100;

            var m = this.chart.margins();
            m.right += legend_width;
            this.chart.margins(m);
            legend = charts.legend(this.legend_items, { x: -5, y: 5, width: legend_width} )
                .on('mouseover', function(d, i) {
                    self.chart.highlight(i);
                } )
                .on('mouseout', function(d, i) {
                    self.chart.unhighlight(i);
                } );
        }

        this.chart.render();        

        if (legend) {
            legend.render(this.chart.svg());
            this.chart.on('postResize', function() { legend.resize(); });
        }

        this.resize();
    },

    redraw : function () {
        this.$el.empty();
        this.$el.draggable('destroy');
        this.$el.resizable('destroy');
        this.render();
    },

    add_source: function(source, chart, charttype, layer) {
        var src;
        if (source.type === 'logs') {
            src = search_src(this.options.app, source, this);
        }
        else if (source.type === 'rum') {
            var rumsrc = this.options.page.rum_source;
            src = rumsrc.get_source(charttype, source.what, layer);
        }
        else if (source.type === 'stats') {
            src = StatsSource(source.url, layer);
        }

        if (!src) {
            throw  new Error('cannot get source for graph type ' + source.type);
        }

        src(chart);
    },

    update_position : function (event, ui) {
        this.position = this.$el.position();
    },

    get_position : function () {
        return (get_position(this.$el));
    },

    enable_edit : function () {

        var title = this.$el.find('#graph_title').html();
        var input = $("<input type = 'text'>")
            .attr('id', 'graph_title')
            .val(title)
            .css('width', '80%')
            .addClass('jut-title-input')
            .css('max-width', '90%');
        this.header_div.html(input);

        var dropdown = $('<div>')
            .addClass('dropdown')
            .append($('<a>')
                .addClass('dropdown-toggle')
                .addClass('jut-dropdown-toggle')
                .attr('data-toggle','dropdown')
                .attr('href', '#')
                .html('<i class="fa fa-align-justify"></i>')
                .css('padding', '10px')

            )
            .append($('<ul>')
                .addClass('dropdown-menu')
                .addClass('pull-left')
                .addClass('jut-dropdown-menu')
                .attr('role', 'menu')
                .append($('<li>').html("<a class = 'jut-delete-graph' href = '#'>Delete</a>"))
                .append($('<li>').html("<a class = 'jut-toggle-events' href = '#'>Toggle Events</a>"))
                .css('text-align', 'left')

            )
            .css('float', 'right');

        this.$el.draggable({
         //   containment : "parent",
            stack : "div",
            opacity : 0.35
        });

        this.$el.resizable();
        this.header_div.append(dropdown);
        this.update_toggle_events();
    },

    update_toggle_events : function() {
        var button = this.header_div.find("a.jut-toggle-events");
        if (this.graph.show_events) {
            button.text("Hide Events");
        } else {
            button.text("Show Events");
        }
    },

    save_graph : function () {
        this.graph.position = this.$el.position();
        this.graph.height = this.$el.height();
        this.graph.width = this.$el.width();
        this.graph.title = this.$el.find('#graph_title').val();
    },

    resize: function () {
        var w = this.$el.width() - 2*this.padding;
        var h = this.$el.height() - this.header_div.height() - 2*this.padding;
        this.graph.width = this.$el.width();
        this.graph.height = this.$el.height();
        this.chart.resize(w, h);
    },

    get_title : function () {
        return this.$el.find('#graph_title').val();
    },

    set_title : function (title) {
        this.$el.find('#graph_title').val(title);
    },

    check_offscreen : function (event) {
        var window_width = window.innerWidth;
        var right_offset = this.$el.position().left + this.$el.width() + this.$el.find('.jut-dropdown-menu').width();
        if (window_width < right_offset) {
            this.$el.find('.jut-dropdown-menu.pull-left')
                .removeClass('pull-left')
                .addClass('pull-right');
        }
        else {
            this.$el.find('.jut-dropdown-menu.pull-right')
                .removeClass('pull-right')
                .addClass('pull-left');
        }
    }

});

var DashboardView = BaseView.extend({

    events : {
        'click #edit-btn' : 'edit_dashboard',
        'click #save-btn' : 'save_dashboard',
        'click #delete-btn' : 'remove_dashboard',
        'click #cancel-btn' : 'cancel_edit',
        'click .jut-delete-graph' : 'remove_graph',
        'click .jut-toggle-events': 'toggle_events',
        'dragstop .jut-graph-view' : 'attempt_merge',
        'drag .jut-graph-view' : 'detect_collision'
    },

    initialize : function (options) {
        _.bindAll(this, 'detect_collision', 'remove_dashboard', 'edit_dashboard', 'save_dashboard');
        this.edit = options.edit;
        this.remove_btn = options.remove;
        this.edit.on('click', this.edit_dashboard);
        this.remove_btn.on('click', this.remove_dashboard);
        this.edit.parents('.jut-dashboard-panel').addClass('active');

        //$('.jut-dashboard-collapse').collapse('hide'):
        $('.jut-dashboard-collapse').off('hide.bs.collapse');
        this.edit.parents('.jut-dashboard-collapse').on('hide.bs.collapse', function (e) {
            e.preventDefault();
        });

        this.edit.parents('.jut-dashboard-panel').siblings().removeClass('active');
        if (this.model) {
            this.dashboards = options.dashboards;
            this.render(); 
        }
        else {
            return;
        }

    },

    render : function () {

        this.dashboard_container = $("<div class = 'jut-graph-container'>");
        this.$el.empty();


        this.$el.append(this.dashboard_container);

        this.popover_container = $("<div class = 'jut-events-container'>");
        this.$el.append(this.popover_container);

        this.drawGraphs(this.dashboard_container);

    },

    drawGraphs : function (div) {
        var self = this;
        this.graph_views = [];
        var top_offset = 10;
        var no_positions = [];
        _.each(this.model.get('graphs'), function (graph, i) {

            var view = new GraphView({
                app: self.options.app,
                page: self.options.page,
                graph: graph,
                dashboard: self.model,
                position : graph.position,
                uniqueid: 'jut_graph_' + i
            });

            if (view.graph.position) {
                view.$el.offset({
                    top : graph.position.top,
                    left : graph.position.left
                });
                top_offset = top_offset > (graph.position.top + graph.height) ? top_offset : graph.position.top + graph.height;
            } else {
                no_positions.push(view);
            }

            div.append(view.$el);
            this.graph_views.push(view);

        }, this);

        _.each(no_positions, function (view) {
            view.graph.position = {
                top : top_offset,
                left : 0
            };

            view.$el.offset({
                top: top_offset
            });
            top_offset = top_offset + view.chart.height() + 100;
           this.$el.height(top_offset);
        }, this);
    },

    edit_dashboard : function () {

        _.each(this.graph_views, function (view) {

            view.enable_edit();

        }, this);
       // $('#cancel-btn').show();
        this.edit.attr('id', 'save-btn').html('Save').off().on('click', this.save_dashboard); 
    },

    save_dashboard : function () {
        var self = this;
        this.model.set('graphs', []);
        var graphs = [];
        _.each(this.graph_views, function (view) {
            view.save_graph();

            graphs.push(view.graph);
        });
        this.model.set('graphs', graphs);
        this.model.save(null, {
            success : function (model, response) {

                self.model = model;
                self.render();

            }
        });
        this.edit.attr('id', 'edit-btn').html('Edit').off().on('click', this.edit_dashboard); 
    },

    cancel_edit : function () {
        var self = this;
        this.model.fetch({
            reset : true,
            success : function (model, response) {
                self.render();
            }
        });
    },

    remove_dashboard : function () {
        this.model.destroy();
        this.close();
    },

    remove_graph : function (event) {
        event.preventDefault();
        var view_element = $(event.target).parents('.jut-graph-view');
        _.each(this.graph_views, function (view, index) {
            if (view.$el.is(view_element)) {
                this.graph_views.splice(index, 1);
                view.close();
            }   
        }, this);
    },

    toggle_events : function (event) {
        event.preventDefault();
        var view_element = $(event.target).parents('.jut-graph-view');
        _.each(this.graph_views, function (view, index) {
            if (view.$el.is(view_element)) {
                view.graph.show_events = !view.graph.show_events;
                view.redraw();
                view.update_toggle_events();
                view.enable_edit();
            }
        }, this);
    },

    find_view : function (element) {
        var return_value;
        _.each(this.graph_views, function (view, index) {
            if (view.$el.is(element)) {
                return_value = index;
            }
        }, this);
        return return_value;
    },


    detect_collision : function (event, ui) {
        var current_view = this.graph_views[this.find_view($(event.target))];
        var pos1 = current_view.get_position();
        _.each(this.graph_views, function (view, index) {
            if (!view.$el.is(current_view.$el)) {
                var pos2 = view.get_position();
                if (compare_positions(pos1, pos2) && (current_view.graph.type === view.graph.type)) {
                    view.$el.addClass('jut-graph-overlap');
                    current_view.$el.addClass('jut-graph-overlap');
                }
            }   
        }, this);

        var overlap_count = 0;
        _.each($('.jut-graph-overlap'), function (element) {
            if (!$(element).is(current_view.$el)) {
                var pos2 = get_position($(element));
                if (compare_positions(pos1, pos2)) {
                    overlap_count = overlap_count + 1;
                } else {
                    $(element).removeClass('jut-graph-overlap');
                }
            }
        });

        if (overlap_count === 0) {
            $('.jut-graph-overlap').removeClass('jut-graph-overlap');
        }
    },

    attempt_merge : function (event, ui) {

        var current_view = this.graph_views[this.find_view($(event.target))];
        var pos1 = current_view.get_position();
        _.each(this.graph_views, function (view, index) {
            if (!view.$el.is(current_view)) {
                var pos2 = view.get_position();
                if (compare_positions(pos1, pos2) && (current_view.graph.type === view.graph.type)) {
                    this.merge_graphs(view, current_view, this.dashboard_container);
                    $('.jut-graph-overlap').removeClass('jut-graph-overlap');
                }
            }   
        }, this);
    },

    merge_graphs : function (view1, view2, div) {
        var graph = view1.graph;

        if (view1.graph.source instanceof Array) {
            graph.source = view1.graph.source.concat(view2.graph.source);
        }
        else if (view2.graph.source instanceof Array) {
            graph.source = view2.graph.source.concat(view1.graph.source);
        } else {
            graph.source = [view1.graph.source, view2.graph.source];
        }

        graph.title = "Combined " + graph.type; 
        var index1 = this.find_view(view1.$el);
        var index2 = this.find_view(view2.$el);
        var view = new GraphView({
            app: this.options.app,
            page: this.options.page,
            graph: graph,
            dashboard: this.model,
            position : graph.position,
            uniqueid: 'jut_graph_' + index1
        });

        if (graph.height) {
            view.$el.height(graph.height);
        } 

        if (graph.width) {
            view.$el.width(graph.width);
        } 

        if (view.graph.position) {
            view.$el.offset({
                top : view1.$el.position().top,
                left : view1.$el.position().left
            });
        } 

        view.enable_edit();
        div.append(view.$el);
        this.graph_views[index1] = view;
        view1.close();
        this.graph_views.splice(index2, 1);
        view2.close();
    }

});

var DashboardsView = BaseView.extend({

    events : {
        'click #new-dashboard' : 'newDashboard',
        'show.bs.collapse .jut-dashboard-collapse' : 'select_dashboard',
        'hide.bs.collapse .jut-dashboard-collapse' : 'hide_toggle'
    },
    
    initialize : function (options) {
        var self = this;
        this.app = options.app;
       // var fullpath = options.fullpath.split('/');
        this.collection = new DashboardCollection([], {
            db_container : this.app.active_deployment
        });
        
        this.collection.fetch({
            success : function (model, response, options) {
                /*
                if (fullpath[1]) {
                    self.build_dashboard(fullpath[1]);
                } else {
                    self.render();
                }
                */
                self.render();
            }
        });

        this.rum_source = new RumSource({
            app: options.app,
            interactive: false
        } );

        this.event_source = new EventSource({
            app: options.app
        } );

        this.listenTo(this.collection, 'remove', this.render);
    },

    render : function (id) {
        if (this.collection && this.collection.length > 0) {
            $(this.el).html(_.template(template, {collection : this.collection.toJSON()}));
            $('.jut-dashboard-collapse').first().siblings("a").click();
        }

        return this;

    },

    newDashboard : function (event) {
        event.preventDefault();
        var newModel = new this.collection.model({
            name:$('#name-input').val(), 
            description : $('#description-input').val(),
            owner : $('#owner-input').val()
        });

        this.collection.add(newModel);
        newModel.save(null, {
            success : function (model, response, options) {
                $('#side-nav').append("<li class = 'accordion-group'><a class = 'accordion-toggle' href = '#dashboards/" + model.id + "' class = 'btn btn-large'>" + model.get('name') + "</a></li>");
            }
        });
    },

    set_fragment : function (fragment) {
        fragment = fragment.split('/');
        if (fragment[1]) {
            this.build_dashboard(fragment[1]);
        } else {
            this.render();
        }
    },

    build_dashboard : function (id, options) {
        var dashboard = this.collection.get(id);
        this.dashboardView = new DashboardView({
            app: this.options.app,
            model : dashboard,
            dashboards : this.collection,
            page: this,
            edit : options?options.edit:null,
            remove : options?options.remove:null
        });
        $('.dashboards-container').html(this.dashboardView.el);
    },

    select_dashboard : function (event) {
        var id = $(event.target).attr('id').split('-');
        var edit_target = $(event.target).find('.edit-btn');
        var delete_target = $(event.target).find('.delete-btn');
        var options = {
            edit : edit_target,
            remove : delete_target
        };

        if (id [1]) {
            this.build_dashboard(id[1], options);
        }
    }
});


module.exports = DashboardsView;
});
