define(function(require, exports, module) {

var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var LogRecord = require('./../../models/log-record');

// quick & dirty hack.  todo:
// - replace svg title elements with better labels
// - provide a way to select the fields(facets) rendered

var SunburstView = Backbone.View.extend({
    initialize: function(options) {
        this.search = options.search;

        this.listenTo(this.search.hits, "change", this.hits_changed, this);
        this.hits_changed();
    },

    close: function() {
        this.remove();
        this.unbind();
    },

    buildhist: function(logs, facets) {
        var getter = LogRecord.getter(facets[0]);
        var hist = {};
        
        for (var i=0; i<logs.length; i++) {
            var val = getter(logs[i]);
            if (! hist.hasOwnProperty(val)) {
                hist[val] = [];
            }
            hist[val].push(logs[i]);
        }
        
        var self = this;
        return _(hist).map(function(value, name) {
            var o = { name: name };
            if (facets.length > 1) {
                o.children = self.buildhist(value, facets.slice(1));
            }
            else {
                o.size = value.length;
            }
            return o;
        } );
    },

    render: function() {
        var width = 960,
            height = 700;

        this.radius = Math.min(width, height) / 2 - 20;
        this.svg = d3.select(this.el).append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");
    },

    hits_changed: function() {
        var limit = 5000;

        // XXX alert if we're truncating to limit
        var full = (this.search.hits.get("size")
                    === Math.min(limit, this.search.hits.get("total")));
        if (!full) {
            this.search.fill_collection(limit);
            return;
        }

        var facets = [ 'response', 'verb', 'clientip' ];

        var root = {
            name: 'root',
            children: this.buildhist(this.search.hits.get('hits'), facets)
        };
        

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, this.radius]);

        var color = d3.scale.category20c();

        var partition = d3.layout.partition()
            .value(function(d) { return d.size; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

        function click(d) {
            path.transition()
                .duration(750)
                .attrTween("d", arcTween(d));
        }

        var path = this.svg.selectAll("path")
            .data(partition.nodes(root))
          .enter().append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.name); })
            .on("click", click);
        
        path
            .append("title").text(function(d) {
                return d.name + ' (' + d.value + ')';
            } );

//            .style("fill", function(d) { return color((d.children ? d : d.parent).name); })

        var radius = this.radius;

        // Interpolate the scales!
        function arcTween(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function(d, i) {
                return i
                    ? function(t) { return arc(d); }
                    : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
            };
        }
        
    }
} );

module.exports = SunburstView;
});
