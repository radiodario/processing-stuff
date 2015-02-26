define(function(require, exports, module) {

/* temporary stuff while this is under development... */
/*jshint unused: false */
/*global console*/

var _ = require('underscore');
var $ = require('jquery');

var BaseView = require('../../base-view');
var charts = require('charts');
var d3 = require('d3');
var crossfilter = require('crossfilter');

// XXX move instance of DashboardModel to app
var DashboardModel = require('services/config/models/dashboard-model');
var DashboardMenu = require('../dashboards/dashboard-menu');

var RumSource = require('./rum-source');
var Environment = require('core/environment');

var template = require('text!./rum.html');

var map_data = require('./map');

require('bootstrap_multiselect');

var RumView = BaseView.extend({

    events : {
        'click .jut-dropdown-toggle' : 'check_offscreen'
    },

    initialize: function(options) {
        this.source = new RumSource({
            app: options.app,
            url: Environment.get('data_url'),
            interactive: true
        } );
        this.app = options.app;

        this.source.hold();
        this.mapsrc = this.source.get_source('map', 'visits');
        this.piesrc = this.source.get_source('pie', 'device');
        this.timesrc = this.source.get_source('timeline', 'visits');
        this.xysrc = this.source.get_source('bar', 'visits-device');
        this.source.release();

        this.dashboards = new DashboardModel([], {
            db_container : this.app.active_deployment
        });
        this.dashboards.fetch();

        $(window).resize(_.bind(this.resize, this));
    },

    render: function() {
        this.$el.html(template);

        $('.multiselect').multiselect({
            buttonClass: 'btn btn-sm btn-default'
        } );

        var self = this;
        this.map = charts.map('#map')
            .projection(d3.geo.mercator()
                        .translate([480, 300])
                       )
            .overlayGeoJson(map_data, 'country', function(d) {
                return d.id;
            } )
            .title(function(d) {
                var v = d.value ? d.value : 0;
                return (d.key + ': ' + v);
            } );
        this.mapsrc(this.map);


        this.pie_chart = charts.pie('#pie-chart')
            .transitionDuration(500);
        this.piesrc(this.pie_chart);

        this.pieselect = this.$el.find('#pieselect');
        this.pieselect.on('change', function(e) {
            if (! self.pie_chart) { return; }

            if (self.piesrc) {
                self.piesrc.close();
            }

            self.piesrc = self.source.get_source('pie', self.pieselect.val());
            self.piesrc(self.pie_chart);
            self.pie_chart.redraw();
        } );


        this.time_chart = charts.bar('#time-chart')
            .transitionDuration(500)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .elasticY(true)
            .centerBar(true)
            .gap(1)
            .xUnits(d3.time.hours)
            .round(d3.time.hours.round)
            .elasticX(true)
            .discretey(true);
        this.timesrc(this.time_chart);

        this.timeselect = this.$el.find('#timeselect');
        this.timeselect.on('change', function(e) {
            if (! self.time_chart) { return; }
            
            self.timesrc.close();

            self.timesrc = self.source.get_source('timeline', self.timeselect.val());
            self.timesrc(self.time_chart);
            self.time_chart.redraw();
        } );


        this.xychart = charts.bar('#xychart')
            .transitionDuration(500)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .gap(2)
            .elasticY(true)
            .elasticX(true)
            .discretey(true);
        this.xysrc(this.xychart);

        function change_xychart() {
            var key = self.yselect.val() + '-' + self.xselect.val();
            self.xysrc.close();
            self.xysrc = self.source.get_source('bar', key);
            self.xysrc(self.xychart);
            self.xychart.redraw();
        }

        this.xselect = this.$el.find('#xselect');
        this.xselect.on('change', change_xychart);

        this.yselect = this.$el.find('#yselect');
        this.yselect.on('change', change_xychart);


        this.map.render();
        this.time_chart.render();
        this.pie_chart.render();
        this.xychart.render();
        this.setup_dashboards();
        
        this.resize();
    },

    close: function() {
        this.remove();
        this.unbind();

        this.mapsrc.close();
        this.timesrc.close();
        this.piesrc.close();
        this.xysrc.close();
    },

    setup_dashboards: function() {
        // XXX make sure we've actually been rendered?
        var self = this;

        this.time_dashmenu = new DashboardMenu({
            model: this.dashboards,
            el: this.$el.find('#timedrop'),
            graph: function() {
                return {
                    title : self.timeselect.val(),
                    type: 'timeline',
                    source: {
                        type: 'rum',
                        title : self.timeselect.val(),
                        what: self.timeselect.val()
                    },
                    width: 600, height: 200
                };
            }
        } );
        this.time_dashmenu.render();

        this.pie_dashmenu = new DashboardMenu({
            model: this.dashboards,
            el: this.$el.find('#piedrop'),
            graph: function() {
                return {
                    title : self.pieselect.val(),
                    type: 'pie',
                    source: {
                        title : self.pieselect.val(),
                        type: 'rum',
                        what: self.pieselect.val()
                    },
                    width: 250, height: 250
                };
            }
        } );
        this.pie_dashmenu.render();

        this.xydashmenu = new DashboardMenu({
            model: this.dashboards,
            el: this.$el.find('#xydrop'),
            graph: function() {
                return {
                    title : self.yselect.val() + ' vs ' + self.xselect.val(),
                    type: 'bar',
                    source: {
                        title : self.yselect.val(),
                        type: 'rum',
                        what: self.yselect.val() + '-' + self.xselect.val()
                    },
                    width: 250, height: 250
                };
            }
        } );
        this.xydashmenu.render();
    },

    resize: function() {
        if (this.resize_timer) {
            clearTimeout(this.resize_timer);
        }
        
        var self = this;
        this.resize_timer = setTimeout(function() {
            self.map.resize();
            self.time_chart.resize();
            self.pie_chart.resize();
            self.xychart.resize();
        }, 500);
    },

    check_offscreen : function (event) {
        var window_width = window.innerWidth;
        var dropdown = $(event.target)
            .parent()
            .siblings('.jut-dropdown-menu');

        var right_offset = dropdown.parent().offset().left + dropdown.parent().width() + dropdown.width();
        if (window_width < right_offset) {
            dropdown.removeClass('pull-left')
                .addClass('pull-right');

            dropdown.find('#add-dashboard').data()['bs.popover'].options.placement = 'left';

        }
        else {
            dropdown.removeClass('pull-right').addClass('pull-left');
        }
    }

});

module.exports = RumView;
});
