define(function(require, exports, module) {
var d3 = require('d3');
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var charts = require('charts');
//var EventSource = require('search/event-src');

var TimelineView = Backbone.View.extend({
    initialize: function(options) {
        this.search = options.search;

        // XXX get this from global color settings
        this.bar_color = options.bar_color || "#4ab0ce";
        this.shadow_bar_color = options.shadow_bar_color
            || d3.interpolate('white', this.bar_color)(0.4);

        this.all_hits_histogram = this.search.global_datehist('timestamp', 'hour');
        this.listenTo(this.all_hits_histogram, "reset", this.layout_top, this);
        
        this.datehist = this.search.enable_datehist('timestamp', 'hour');
        this.listenTo(this.datehist.model, "reset", this.refresh, this);

        var self = this;
        this.listenTo(this.datehist.filter_model, 'change', function() {
            self.reset_brush(true);
            self.refresh();
        } );

        // XXX/demmer hack for events
//        this.evtsrc = new EventSource({
//            url: this.search.search.url
//        } );
        
        this.render();

        $(window).on('resize', _.bind(this.resize, this) );
        setTimeout(_.bind(this.resize, this), 500);
    },

    close: function() {
        this.search.cancel(this.datehist.id);

        this.svg = null;
        this.brushg = null;
        this.brushobj.on('brush', null);
        this.brushobj.on('brushend', null);

        this.remove();
        this.unbind();

        // XXX too aggressive, this unbinds *all* resize handlers
        // but anything else appears to leak, ugh.
        $(window).off('resize');
    },

    brush: function() {
        var selection;
        if (this.brushobj.empty()) {
            selection = { start: null, end: null };
        }
        else {
            var e = this.brushobj.extent();
            selection = { start: e[0], end: e[1] };
        }
        this.datehist.filter_model.set(selection);
    },

    getsize: function() {
        var w = Math.max(600, this.$el.width());
        var h = Math.max(240, this.$el.height());
        var changed = (w !== this.width) || (h !== this.height);
        this.width = w;
        this.height = h;
        return changed;
    },

    render: function() {
        this.getsize();

        this.xpad = 40;
        this.bpad = 30;
        this.tpad = 10;
        this.ypad = this.bpad + this.tpad;

        var popover_container = $('<div>').attr("class", "jut-events-container");
        this.$el.append(popover_container);

        this.svg = d3.select(this.el).append("svg")
            .attr("class", "timeseries")
            .attr("width", "100%")
            .attr("height", "100%");
        
        // XXX right edge
        this.xscale = d3.time.scale()
            .range([this.xpad, this.width - 10]);

        this.xaxis = d3.svg.axis()
            .scale(this.xscale)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");
        this.xg = this.svg.append("g")
            .attr("transform", "translate(0," + (this.height-this.bpad) + ")");

        // XXX hard code the x axis to have fewer ticks and the tick
        // format since the automatic tick formatting logic looks
        // crappy in the demo
        this.xaxis.ticks(5);
        this.xaxis.tickFormat(d3.time.format("%b %d"));

        this.yscale = d3.scale.linear()
            .range([0, this.height-this.ypad]);
        this.yscale2 = d3.scale.linear()
            .range([this.height - this.ypad, 0]);
        this.yaxis = d3.svg.axis()
            .scale(this.yscale2)
            .tickSize(0)
            .orient("left");

        // XXX put in logic to choose number of ticks based on height
        // in pixels (as in src/charts/)
        this.yaxis.ticks(5);

        this.yg = this.svg.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + this.xpad + "," + this.tpad + ")");
        
        this.xgrid = this.svg.append("g")
            .attr('class', 'gridlines');
        this.ygrid = this.svg.append("g")
            .attr('class', 'gridlines');
        this.draw_gridlines(false);

        this.xedge = this.svg.append("line")
            .attr("x1", this.xpad)
            .attr("x2", this.width)
            .attr("y1", this.height - this.bpad)
            .attr("y2", this.height - this.bpad)
            .style("stroke", "#000");

        this.yedge = this.svg.append("line")
            .attr("x1", this.xpad)
            .attr("x2", this.xpad)
            .attr("y1", 0)
            .attr("y2", this.height - this.ypad)
            .style("stroke", "#000");

        // XXX/demmer need to put the bars before the events and the brush
        this.rect_g = this.svg.append("g");
        this.annotations_g = this.svg.append("g");

        var brush = this.brushobj = d3.svg.brush()
            .x(this.xscale)
            .on("brushend", _.bind(this.brush, this));
        
        var brushg = this.brushg = this.annotations_g.append("g")
            .attr("class", "x brush");

        brush.on("brush", function() {
            // XXX
            brush.extent(_.map(brush.extent(), d3.time.hour.round));
            brushg.call(brush);
        } );

        // XXX/demmer add this shim so that the timeline looks enough
        // like a regular chart for the event annotations to work.
        var self = this;
        var parent = {
            el: self.el,
            g : function() { return self.annotations_g; },
            x : function() { return self.xscale; },
            margins: function() { return {left: self.xpad}; },
            xAxisY : function() { return self.height-self.bpad; },
            renderlet: function (chart) { }
        };

        // XXX/demmer
        var show_events = false;
        if (show_events) {
            var evtsrc = this.evtsrc;
            self.events = null;
            evtsrc.ready(function() {
                setTimeout(function() {
                    self.events = charts.annotations(parent, popover_container)
                        .data(evtsrc.get_event_list())
                        .colors(['orange']);
                    self.events.render();
                }, 100);
            });
        }
    },

    resize: function() {
        if (this.getsize() === false) { return; }

        this.xscale
            .range([this.xpad, this.width - 10]);
        this.xg
            .attr("transform", "translate(0," + (this.height-this.bpad) + ")");
        this.xg.call(this.xaxis);

        this.xedge
            .attr("x1", this.xpad)
            .attr("x2", this.width)
            .attr("y1", this.height - this.bpad)
            .attr("y2", this.height - this.bpad);

        
        this.yscale
            .range([0, this.height-this.ypad]);
        this.yscale2
            .range([this.height - this.ypad, 0]);
        this.yg
            .attr("transform", "translate(" + this.xpad + "," + this.tpad + ")");
        this.yg.call(this.yaxis);
        this.draw_gridlines();

        this.yedge
            .attr("x1", this.xpad)
            .attr("x2", this.xpad)
            .attr("y1", 0)
            .attr("y2", this.height - this.bpad);

        this.size_bars();
        this.reset_brush(true);
        
        if (this.events) {
            this.events.render();
        }
    },

    reset_brush: function(redraw) {
        var start = this.datehist.filter_model.get('start');
        var end = this.datehist.filter_model.get('end');
        
        if (start === null || end === null) {
            this.brushobj.clear();
        }
        else {
            this.brushobj.extent([start, end]);
        }

        if (redraw && this.brushg) {
            this.brushg.call(this.brushobj);
        }
    },

    draw_gridlines: function(animate) {
        var yticks = this.yscale.ticks.apply(this.yscale, this.yaxis.ticks());
        var update = this.ygrid
          .selectAll('line')
            .data(yticks);

        update.enter()
          .append('line');
        update.exit().remove();
        
        if (animate) { update = update.transition(); }
        update
            .attr('x1', this.xpad)
            .attr('y1', this.yscale)
            .attr('x2', this.width-10)
            .attr('y2', this.yscale);

        /*
        var xticks = this.xscale.ticks.apply(this.xscale, this.xaxis.ticks());
        update = this.xgrid
          .selectAll('line')
            .data(xticks);

        update.enter()
          .append('line');
        update.exit().remove();
        
        if (animate) { update = update.transition(); }
        update
            .attr('x1', this.xscale)
            .attr('y1', 0)
            .attr('x2', this.xscale)
            .attr('y2', this.height - this.ypad);
        */
        
    },

    set_yaxis: function() {
        // XXX duplicated code here, refactor this at some point
        var ymax = (this.uppers_visible) ? this.uppers_extent[1] : 0;
        if (this.lowers_extent) {
            ymax = Math.max(ymax, this.lowers_extent[1]);
        }

        var yd = [0, ymax];
        this.yscale.domain(yd);
        this.yscale2.domain(yd);
    },

    layout_top: function() {
        var values = _.map(this.all_hits_histogram.models, function(m) {
            return { time: m.get("key"), count: m.get("value") };
        } );
        if (values.length === 0) { return; }

        var range = d3.extent(values, function(d) { return d.time; });
        range[1] += 60*60*1000;
        this.xscale.domain(range);
        this.xg.call(this.xaxis);
        this.reset_brush(false);


        this.uppers_extent = d3.extent(values, function(d) { return d.count; });
        var ymax = this.uppers_extent[1];
        if (this.lowers_extent) {
            ymax = Math.max(ymax, this.lowers_extent[1]);
        }

        var yd = [0, ymax];
        this.yscale.domain(yd);
        this.yscale2.domain(yd);
        this.yg.call(this.yaxis);

        var brushHeight = this.height - this.ypad;

        this.brushg
            .call(this.brushobj)
          .select("rect")
            .attr("height", brushHeight);

        this.brushg.select("rect.extent")
            .style({
                "background": "#000",
                "fill-opacity": 0.5,
                "fill" : "steelblue",
                "shape-rendering": "crispEdges"
            });

        // borrowed from Crossfilter example
        function resizeHandlePath(d) {
            var e = +(d === "e"), x = e ? 1 : -1, y = brushHeight / 3;
            return "M" + (0.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (0.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
        }

        this.brushg.selectAll(".resize")
            .append("path")
            .attr("d", resizeHandlePath);

        this.nintervals = (values[values.length-1].time - values[0].time)
            / (60 * 60 * 1000); // XXX/interval
        
        var upper_bars = this.rect_g.selectAll("rect.upper")
            .data(values);

        upper_bars.enter().append("rect")
            .attr("class", "upper")
            .style("fill", this.shadow_bar_color);
        
        upper_bars.exit().remove();
        this.size_bars(false);

        this.refresh();
    },

    size_bars: function(transition) {
        if (!this.nintervals) { return; }
        this.barwidth = 0.8 * (this.width - this.xpad) / this.nintervals;

        var self = this;
        
        this.rect_g.selectAll("rect.upper")
            .attr("x", function(d) { return self.xscale(d.time); })
            .attr("y", function(d) { return self.height - self.bpad - self.yscale(d.count); })
            .attr("width", this.barwidth)
            .attr("height", function(d) { return self.yscale(d.count); });

        this.rect_g.selectAll("rect.lower")
            .attr("x", function(d) { return self.xscale(d.time); })
            .attr("y", function(d) { return self.height - self.bpad - self.yscale(d.value); })
            .attr("width", this.barwidth)
            .attr("height", function(d) { return self.yscale(d.value); });
    },

    refresh: function() {
        var values = _.map(this.datehist.model.models, function(m) {
            return { time: m.get("key"), value: m.get("value") };
        } );
        if (values.length === 0) { return; }

        this.lowers_extent = d3.extent(values, function(d) { return d.value; } );
        this.set_yaxis();

        var self = this;
        var lower_bars = this.rect_g.selectAll("rect.lower")
            .data(values, function(d) { return d.time; });
        
        lower_bars.enter().append("rect")
            .attr("class", "lower")
            .attr("y", self.height - self.bpad)
            .attr("height", 0)
            .style({fill: this.bar_color});
        
        var start = self.datehist.filter_model.get('start');
        var end = self.datehist.filter_model.get('end');
        lower_bars
          .transition()
            .attr("x", function(d) { return self.xscale(d.time); })
            .attr("y", function(d) {
                return self.height - self.bpad - self.yscale(d.value);
            })
            .attr("width", this.barwidth)
            .attr("height", function(d) {
                return ((!start || d.time >= start) && (!end || d.time <= end))
                    ? self.yscale(d.value) : 0;
                } );
        
        lower_bars.exit()
          .transition()
            .attr("y", self.height - self.bpad)
            .attr("height", 0)
            .remove();

        this.yg
          .transition()
            .call(this.yaxis);

        this.draw_gridlines(true);

        //XXX this was set above, who is clobbering it?
        this.brushg.select("rect.extent")
            .attr("height", this.height - this.bpad);

    },

    toggle_uppers: function() {
        this.uppers_visible = !this.uppers_visible;
        this.set_yaxis();
        var self = this;

        var t0 = this.svg.transition().duration(100);
        var t1 = t0.transition().duration(250);
        var t2 = t1.transition().duration(250);
        var t3 = t2.transition().duration(100);

        t0.selectAll('.yaxis text')
            .style('opacity', 0.0);

        if (this.uppers_visible) {
            t1.selectAll('rect.lower')
                .attr("y", function(d) { return self.height - self.bpad - self.yscale(d.value); })
                .attr("height", function(d) { return self.yscale(d.value); });
            t2.selectAll('rect.upper')
                .style('opacity', 1.0);
        }
        else {
            t1.selectAll('rect.upper')
                .style('opacity', 0.0);

            t2.selectAll('rect.lower')
                .attr("y", function(d) { return self.height - self.bpad - self.yscale(d.value); })
                .attr("height", function(d) { return self.yscale(d.value); });
        }

        t3.each("start", function() {
            self.yg.call(self.yaxis);
        });
        t3.selectAll('.yaxis text')
            .style('opacity', 1.0);
    }
});

module.exports = TimelineView;    
});
