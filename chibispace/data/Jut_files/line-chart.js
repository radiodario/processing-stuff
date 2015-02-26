define(function(require, exports, module) {

var CoordinateChart = require('./coordinate-grid');
var d3 = require('d3');

function LineChart(el) {
    var DEFAULT_DOT_RADIUS = 5;
    var TOOLTIP_G_CLASS = "dc-tooltip";
    var DOT_CIRCLE_CLASS = "dot";
    var Y_AXIS_REF_LINE_CLASS = "yRef";
    var X_AXIS_REF_LINE_CLASS = "xRef";

    var _chart = CoordinateChart(el);
    var _renderArea = false;
    var _dotRadius = DEFAULT_DOT_RADIUS;
    var _hoverSelect = false;
    var _minGap = 5; // minimum spacing between points
    var _downsample = d3.mean;

    // To avoid rendering charts that are too busy for the given
    // resolution, enforce a minimum pixel width between data points
    // by merging data points together.
    function downsampleData(_layers) {
        var ticks = _chart.x().ticks((_chart.xAxisLength() / _chart.minGap()) + 1);
        var interval = ticks[1] - ticks[0]; // XXX what if only 1 tick
        var base = ticks[0] - interval;

        if (_chart.stacked()) {
            // XXX/demmer ??
        } else {
            var new_layers = _layers.map(function(l) {
                var new_l = d3.nest(l)
                        .key(function(d) { 
                            return base + (interval * Math.floor((d.key - base) / interval));
                        })
                        .rollup(function(elts) { 
                            return _downsample(elts, function(d) { return d.value; });

                        })
                        .entries(l)
                        .map(function(d) {
                            return {key: d.key, value: d.values, y: d.values, y0: 0};
                        });
                return new_l;
            });

            _layers = new_layers;
        }

        return _layers;
    }
    
    _chart.plotData = function(animate) {
        var downsampled = downsampleData(_chart.layers());
        var layers = _chart.chartBodyG().selectAll("g.stack")
            .data(downsampled);

        var enter = layers.enter().append("g")
            .attr("class", "stack");

        var yscales = _.map(_chart.layers(), function(a) {
            return d3.scale.linear()
                .domain([0, d3.max(a, _chart.valueAccessor())])
                .rangeRound([_chart.yAxisHeight(), 0]);
        } );

        var line_generators = [];
        var area_generators = [];
        
        _.each(_chart.layers(), function(a, i) {
            var scale = yscales[i];

            var line = d3.svg.line()
                .x(function(d) {
                    return _chart.x()(_chart.keyAccessor()(d));
                })
                .y(function(d) {
                    return scale(d.y + d.y0);
                } )
                .interpolate("basis");

            var area = d3.svg.area()
                .x(function (d) {
                    return _chart.x()(_chart.keyAccessor()(d));
                })
                .y(function (d) {
                    return scale(d.y + d.y0);
                })
                .y0(function (d) {
                    return scale(d.y0);
                })
                .interpolate("basis");

            line_generators.push(line);
            
            if (_renderArea) {
                area_generators.push(area);
            }
        } );

        var lines = enter.append("path")
            .attr("class", "line")
            .attr("stroke", function (d, i) {
                return _chart.colors()(i);
            });

        var path_lines = layers.select('path.line');
        if (animate) {
            path_lines = path_lines
                .transition().duration(_chart.transitionDuration());
        }

        path_lines
            .attr("d", function(d, i) {
                return d.length === 0 ? 'M0,0' : line_generators[i](d);
            } );

        if (_renderArea) {
            var areas = enter.append("path")
                .attr("class", "area")
                .attr("fill", function (d, i) {
                    return _chart.colors()(i);
                });

            var path_areas = layers.select('path.area');
            if (animate) {
                path_areas = path_areas
                    .transition().duration(_chart.transitionDuration());
            }
            path_areas
                .attr('d', function(d, i) { return area_generators[i](d); } );
        }

        if (_hoverSelect) {
            var shadowg = _chart.chartBodyG().selectAll("g.shadows");
            if (shadowg.empty()) {
                shadowg = _chart.chartBodyG()
                  .append("g")
                    .attr("class", "shadows");
            }
            
            shadowg.selectAll("path.shadowline")
              .data(downsampled)
                .enter()
              .append("path")
                .attr("class", "shadowline")
                .attr('stroke', 'white')
                .attr('stroke-width', 20)
                .attr('fill', 'none')
                .attr('opacity', 0)
                .on('mouseover', function(d, i) {
                    _chart.highlight(i);
                })
                .on('mouseout', function(d, i) {
                    _chart.unhighlight(i);
                } );
            shadowg.selectAll("path.shadowline")
                .attr('d', function(d, i) {
                    return d.length === 0 ? 'M0,0' : line_generators[i](d);
                } );
            
                
/*
            enter.append("path")
                .attr("class", "shadowline")
                .attr('stroke', 'white')
                .attr('stroke-width', 20)
                .attr('fill', 'none')
                .attr('opacity', 0)
                .on('mouseover', function(d, i) {
                    _chart.highlight(i);
                })
                .on('mouseout', function(d, i) {
                    _chart.unhighlight(i);
                } );
            
            layers.select('path.shadowline')
                .attr('d', function(d, i) {
                    return d.length === 0 ? 'M0,0' : line_generators[i](d);
                } );
*/
/*
            _chart.svg().on('mousemove', function() {
                // XXX why parent?
                var mouse = d3.mouse(_chart.chartBodyG().node().parentNode);
                var x = _chart.x().invert(mouse[0]);
                var bisect = d3.bisector(_chart.keyAccessor());

                var distances = _.map(_chart.layers(), function(layer, i) {
                    var val = bisect.left(layer, x.getTime());
                    if (val === 0 || val >= layer.length) { return Infinity; }

                    var yval = _chart.valueAccessor()(layer[val]);
                    var y = yscales[i](yval);

                    return Math.abs(y - mouse[1]);
                } );
                var selected = null;
                for (var j=0; j<distances.length; j++) {
                    if (distances[j] < 15
                        && (selected === null || distances[j] < distances[selected])) {
                        selected = j;
                    }
                }

                if (selected !== null) {
                    _chart.highlight(selected);
                }
                else {
                    _chart.unhighlight();
                }
            } );
*/
        }

    };

    _chart.hoverSelect = function(_) {
        if (!arguments.length) return _hoverSelect;
        _hoverSelect = _;
        return _chart;
    };

    _chart.renderArea = function (_) {
        if (!arguments.length) return _renderArea;
        _renderArea = _;
        return _chart;
    };

    _chart.minGap = function (_) {
        if (!arguments.length) return _minGap;
        _minGap = _;
        return _chart;
    };

    _chart.downsample = function (_) {
        if (!arguments.length) return _downsample;
        _downsample = _;
        return _chart;
    };

    _chart.highlight = function(layer) {
        if (layer >= _chart.layers().length) {
            // skip events bullshit
            return;
        }

        _chart.selectAll('path.line')
            .classed('highlight', function(d, i) { return i === layer; })
            .classed('fadeout', function(d, i) { return i !== layer; });
        _chart.selectAll('path.area')
            .classed('highlight', function(d, i) { return i === layer; })
            .classed('fadeout', function(d, i) { return i !== layer; });

        _chart.show_y_layer(layer);
    };

    _chart.unhighlight = function() {
        _chart.selectAll('path')
            .classed('highlight', false)
            .classed('fadeout', false);

        _chart.show_y_layer(null);
    };

    _chart.legendHighlight = function (d) {
        _chart.selectAll('.chart-body').selectAll('path').filter(function () {
            return d3.select(this).attr('fill') == d.color;
        }).classed('highlight', true);
        _chart.selectAll('.chart-body').selectAll('path').filter(function () {
            return d3.select(this).attr('fill') != d.color;
        }).classed('fadeout', true);
    };

    _chart.legendReset = function (d) {
        _chart.selectAll('.chart-body').selectAll('path').filter(function () {
            return d3.select(this).attr('fill') == d.color;
        }).classed('highlight', false);
        _chart.selectAll('.chart-body').selectAll('path').filter(function () {
            return d3.select(this).attr('fill') != d.color;
        }).classed('fadeout', false);
    };


    return _chart;
};

module.exports = LineChart;
});
