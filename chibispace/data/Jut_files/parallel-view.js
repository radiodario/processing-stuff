define(function(require, exports, module) {
var _ = require("underscore");
var $ = require('jquery');

var Backbone = require("backbone");
var d3 = require("d3");
var LogRecord = require('./../../models/log-record');
var HitsView = require("./hits-view");
var Logger = require('logger');
var template = require("text!./parallel.html");

require('bootstrap_alert');

function parallel(data, el, set_filter) {
    var self = {};
    var dragging = {};
    var highlighted = null;

    var container = d3.select(el[0]);
    var bounds = [ el.width(), el.height() ];
    if (bounds[1] === 0) { bounds[1] = 400; }

    var m = [30, 10, 10, 10];
    var w = bounds[0] - m[1] - m[3];
    var h = bounds[1] - m[0] - m[2];

    var svg = container.append("svg:svg")
            .attr('class', 'parallel')
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


    var line = d3.svg.line().interpolate('cardinal').tension(0.85);
    var axis = d3.svg.axis().orient("left");
    var glines, lines, axes;

    var dimensions = {};
    var dim_order = [];
    var x = d3.scale.ordinal().rangePoints([0, w], 1);

    // Handles a brush event, toggling the display of foreground lines.
    function brush(dim) {
        var filter = { };
        var extent = dim.brush.extent();

        if (dim.brush.empty()) {
            //filter[ dim.discrete ? 'inset' : 'range' ] = dim.scale.domain();
            filter[ dim.discrete ? 'inset' : 'range' ] = [];
        }
        else if (dim.discrete) {
            filter.inset = _.filter(dim.scale.domain(),
                                    function(o) {
                                        var v = dim.scale(o);
                                        return (v >= extent[0] && v <= extent[1]);
                                    } );
        }
        else {
            filter.range = [ Math.ceil(extent[0]), Math.floor(extent[1]) ];
        }

        set_filter(dim.name, filter);
    }

    self.add_dimension = function(options) {
        var dim = {
            name: options.name,
            discrete: options.discrete || false
        };

        if (options.discrete) {
            dim.scale = d3.scale.ordinal()
                .rangePoints([h, 0], 1.0);
            
            dim.rescale = function() {
                var values = _.uniq(_.map(data, function(p) { return LogRecord.getter(options.name)(p); }));
                values.sort();

                dim.scale.domain(values);
            };
        }
        else {
            dim.scale = d3.scale.linear()
                .range([h, 0]);

            dim.rescale = function() {
                dim.scale.domain(d3.extent(data, function(p) { return +LogRecord.getter(options.name)(p); }));
            };
        }

        dim.rescale();

        dim.brush = d3.svg.brush()
            .y(dim.scale)
            .on("brushend", function() { brush(dim); } );

        dimensions[options.name] = dim;
        
        dim_order.push(options.name);
        x.domain(dim_order);
    };

    function position(d) {
        var v = dragging[d];
        return v === undefined ? x(d) : v;
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dim_order.map(function(p) {
            return [position(p), dimensions[p].scale(LogRecord.getter(p)(d))];
        }) );
    }

    self.refresh = function(newdata, rescale) {
        rescale = rescale || false;
        data = newdata;

        if (rescale) {
            _(dimensions).each(function(d) { d.rescale(); } );
            axes.each(function(d) { d3.select(this).call(axis.scale(dimensions[d].scale)); });
        }

        lines = glines.selectAll("path")
            .data(data)
            .attr('d', path);
        
        lines.enter()
            .append("svg:path")
            .attr("d", path)
            .attr("style", "stroke:steelblue;");


        lines.exit().remove();
    };

    self.render = function() {
        svg.empty();
        
        glines = svg.append("svg:g")
            .attr("class", "foreground");

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
                .data(dim_order)
                .enter().append("svg:g")
                .attr("class", "dimension")
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                .call(d3.behavior.drag()
                      .on("dragstart", function(d) {
                          dragging[d] = this.__origin__ = x(d);
                      })
                      .on("drag", function(d) {
                          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                          lines.attr("d", path);
                          dim_order.sort(function(a, b) { return position(a) - position(b); });
                          x.domain(dim_order);
                          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
                      })
                      .on("dragend", function(d) {
                          delete this.__origin__;
                          delete dragging[d];
                          d3.select(this)
                              .transition().duration(500)
                              .attr("transform", "translate(" + x(d) + ")");
                          lines
                              .transition().duration(500)
                              .attr("d", path);
                      }));

        // Add an axis and title.
        axes = g.append("svg:g")
            .attr("class", "axis");

        axes
            .each(function(d) { d3.select(this).call(axis.scale(dimensions[d].scale)); })
            .append("svg:text")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(String);

        // Add and store a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function(d) { d3.select(this).call(dimensions[d].brush); })
            .selectAll("rect")
            .attr("x", -12)
            .attr("width", 24);
        
        self.refresh(data, true);

        self.highlight = function(log) {
            if (log === undefined) {
                glines.style('opacity', '1');
                highlighted.remove();
            } else {
                glines.style('opacity', '0.35');
                if (highlighted !== null) {
                    highlighted.remove();
                }
                highlighted = svg.append("svg:g")
                    .attr("class", "highlight")
                    .selectAll("path")
                    .data([log])
                    .enter().append("svg:path")
                    .attr("d", path);
            }
        };
    };

    return self;
}


var ParallelView = Backbone.View.extend({
    initialize: function(options) {
        this.search = options.search;
        
        this.hits = [];
        this.limit = 2000; // collection items fetched, lines drawn
        this.overflowed = false;
        
        this.search.fill_collection(this.limit);

        this.seen_full_hits = false;
        this.listenTo(this.search.hits, "change", this.hits_changed, this);
        this.render();
        this.hits_changed();
    },

    close: function() {
        this.hits_view.close();

        this.remove();
        this.unbind();
    },

    render: function() {
        this.$el.html(template);

        var search = this.search;
        this.pc = parallel(this.hits,
                           this.$el.find('#parcontainer'),
                           function(name, filt) {
                               Logger.get('parallel').debug('applying filters', name, filt.inset);
                               if (filt.inset && filt.inset.length === 0) {
                                   filt = null;
                               }
                               search.update_filter({field: name, what: filt});
                           } );

        // XXX/demmer this doesn't work yet
        // this.pc.add_dimension({name: "timestamp"});
        this.pc.add_dimension({name: "@source_host", discrete: true});
        this.pc.add_dimension({name: "clientip", discrete: true});
        this.pc.add_dimension({name: "client_browser", discrete: true});
        this.pc.add_dimension({name: "client_os", discrete: true});
        this.pc.add_dimension({name: "verb", discrete: true});
        this.pc.add_dimension({name: "response", discrete: true});
        this.pc.add_dimension({name: "url", discrete: true});
        this.pc.add_dimension({name: "bytes"});

        this.pc.render();

        this.hits_view = new HitsView({
            el: this.$el.find("table.hits"),
            model: this.search.hits,
            search: this.search
        } );
        this.hits_view.render();

        var self = this;
        this.listenTo(this.hits_view, 'hoverin', function(i) {
            self.pc.highlight(self.hits[i]);
        });
        this.listenTo(this.hits_view, 'hoverout', function(i) {
            self.pc.highlight();
        });
    },

    hits_changed: function() {
        var rescale = false;

        var full = (this.search.hits.get("size") >= this.limit
           || this.search.hits.get("size") === this.search.hits.get("total"));

        // XXX
        if (this.search.hits.get("total") > this.limit && !this.overflowed) {
            var alert = $('<div class="alert alert-danger alert-dismissable">');
            alert.append($('<button type="button" class="close" data-dismiss="alert">&times;</button>'));
            alert.append($('<p><strong>Warning:</strong> too many hits to handle locally, truncating list</p>'));
            this.$el.find("#notifications").append(alert);
            this.overflowed = true;
        }

        this.hits = this.search.hits.get("hits").slice(0, this.limit);

        if (!this.seen_full_hits) {
            rescale = true;
            this.seen_full_hits = full;
        }
        this.pc.refresh(this.hits, rescale);
    }
});

module.exports = ParallelView;
});
