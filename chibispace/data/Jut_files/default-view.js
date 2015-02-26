define(function(require, exports, module) {
var $ = require('jquery');
var _ = require('underscore');

var d3 = require('d3');
var charts = require('charts');

var RumSource = require('./screens/rum/rum-source');

var BaseView = require('./base-view');

var template = require('text!./home-static.html');

var Environment = require('core/environment');
require('bootstrap_tab');

var HomeView = BaseView.extend({

   initialize: function(options) {
        this.source = new RumSource({
            app: options.app,
            url: Environment.get('data_url'),
            interactive: true
        } );

        this.source.hold();
        this.timesrc = this.source.get_source('timeline', 'visits');
        this.source.release();

        $(window).resize(_.bind(this.resize, this));
    },
    render: function(options) {
        $(this.el).html(template);

        // TODO: not sure why the following is needed
        setTimeout(function() {
            if ($('.event-comment-panel .nav-tabs .active').length === 0) {
                $('[data-target="#home-events"]').tab('show');
            }
        }, 0);

        // most of the following is graph code stolen from RUM
        this.time_chart = charts.line('.site-traffic .graph-area')
            .transitionDuration(500)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .elasticY(true)
        //            .centerBar(true)
        //            .gap(1)
            .xUnits(d3.time.hours)
            .round(d3.time.hours.round)
            .elasticX(true)
            .discretey(true);
        this.timesrc(this.time_chart);

        this.time_chart.render();
        this.time_chart.resize();


        this.resize();
    },
    resize: function() {
        if (this.resize_timer) {
            clearTimeout(this.resize_timer);
        }
        
        var self = this;
        this.resize_timer = setTimeout(function() {
            self.time_chart.resize();
        }, 600);
    }
});

module.exports = HomeView;
});
