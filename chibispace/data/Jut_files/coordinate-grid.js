define(function(require, exports, module) {

var base = require('./base-chart');
var d3 = require('d3');
var _ = require('underscore');

// make sure all layers are the same length and have the same keys
// hard-coded logic for times right now...
function stack_prepare(data) {
    var x = -Infinity;
    var pos = [];
    for (var i=0; i<data.length; i++) { pos.push(0); }

    while (_.any(pos, function(v, i) { return v < data[i].length; } )) {
        var vals = data.map(function(a, i) {
            var p = pos[i];
            return (p >= a.length) ? Infinity : a[p].key;
        } );
        x = Math.min.apply(Math, vals);
        
        for (i=0; i<data.length; i++) {
            if (pos[i] >= data[i].length) {
                data[i].push({ key: x, value: 0});
            }
            else {
                var a = data[i];
                if (a[pos[i]].key > x) {
                    a.splice(pos[i], 0, { key: x, value: 0});
                }
            }
            pos[i] += 1;

        }
    }
    return data;
}

function CoordinateGridChart(el) {
    var GRID_LINE_CLASS = "grid-line";
    var HORIZONTAL_CLASS = "horizontal";
    var VERTICAL_CLASS = "vertical";

    var _chart = base.ColorChart(base.marginable(base.BaseChart(el)));

//    _chart.colors(d3.scale.category10());

    var _parent;
    var _g;
    var _chartBodyG;

    var _x;
    var _xOriginalDomain;
    var _xAxis = d3.svg.axis();
//    var _xUnits = dc.units.integers;
    var _xUnits = function(s, e) { return Math.abs(e-s); };
    var _xAxisPadding = 0;
    var _xElasticity = false;

    var _y;
    var _yAxis = d3.svg.axis().orient('left');
    var _yAxisPadding = 0;
    var _yElasticity = false;

    // XXX expose these with methods
    var _x_tick_spacing = 70;
    var _y_tick_spacing = 40;

    var _brush = d3.svg.brush();
    var _brushOn = true;
    var _round;

    var _renderHorizontalGridLine = false;
    var _renderVerticalGridLine = false;

    var _refocused = false;

    var _mouseZoomable = false;
    var _clipPadding = 0;

//    _chart.title(function (d) {
//        return d.data.key + ": " + d.data.value;
//    });

    _chart.generateG = function (parent) {
        if (parent === undefined)
            _parent = _chart.svg();
        else
            _parent = parent;

        _g = _parent.append("g");

        _chartBodyG = _g.append("g").attr("class", "chart-body")
            .attr("transform", "translate(" + _chart.margins().left + ", " + _chart.margins().top + ")")
            .attr("clip-path", "url(#" + getClipPathId() + ")");
        
        return _g;
    };

    _chart.g = function (_) {
        if (!arguments.length) return _g;
        _g = _;
        return _chart;
    };

    _chart.mouseZoomable = function (z) {
        if (!arguments.length) return _mouseZoomable;
        _mouseZoomable = z;
        return _chart;
    };

    _chart.chartBodyG = function (_) {
        if (!arguments.length) return _chartBodyG;
        _chartBodyG = _;
        return _chart;
    };

    _chart.x = function (_) {
        if (!arguments.length) return _x;
        _x = _;
        _xOriginalDomain = _x.domain();
        return _chart;
    };

    _chart.xOriginalDomain = function () {
        return _xOriginalDomain;
    };

    _chart.xUnits = function (_) {
        if (!arguments.length) return _xUnits;
        _xUnits = _;
        return _chart;
    };

    _chart.xAxis = function (_) {
        if (!arguments.length) return _xAxis;
        _xAxis = _;
        return _chart;
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _xElasticity;
        _xElasticity = _;
        return _chart;
    };

    _chart.xAxisPadding = function (_) {
        if (!arguments.length) return _xAxisPadding;
        _xAxisPadding = _;
        return _chart;
    };

    _chart.xUnitCount = function () {
        if (_chart.isOrdinal()) {
            return _x.domain().length;
        }
        else {
            var units = _chart.xUnits()(_x.domain()[0], _x.domain()[1]);
            return (units instanceof Array) ? units.length : units;
        }
    };

    _chart.isOrdinal = function () {
        // XXX is _x an instance of d3.scale.ordinal?
        return _x.hasOwnProperty('rangePoints');
    };

    
    var _stacked = false;
    var _layered = false;
    var _layers;

    _chart.stacked = function(v) {
        if (!arguments.length) return _stacked;
        _stacked = v;
        return _chart;
    };

    _chart.layered = function(v) {
        if (!arguments.length) return _layered;
        _layered = v;
        return _chart;
    };
    
    function prepare_data() {
        var data = _chart.data();
        if (! Array.isArray(data)) {
            throw new Error("data is not an array");
        }

        if (! Array.isArray(data[0])) {
            data = [ data ];
        }

        if (_stacked) {
            if (data.length > 1) {
                data = stack_prepare(data);
            }
            var stack = d3.layout.stack()
                .offset("zero")
                .order("default")
                .x(_chart.keyAccessor())
                .y(_chart.valueAccessor());

            _layers = stack(data);
        }
        else {
            _(data).each(function(a) {
                _(a).each(function(i) { i.y = i.value; i.y0 = 0; } );
            } );
            _layers = data;
        }
    }

    _chart.layers = function() { return _layers; };


    function prepareXAxis(g) {
        if (_chart.elasticX() && !_chart.isOrdinal()) {
            _x.domain(_chart.xAxisRange());
        }

        if (_chart.isOrdinal()) {
            _x.rangeBands([0, _chart.xAxisLength()]);
        } else {
            _x.range([0, _chart.xAxisLength()]);
        }

        _xAxis = _xAxis.scale(_chart.x()).orient("bottom");
        if (!_xAxis.tickValues() && _x_tick_spacing) {
            var nticks = Math.round(_chart.xAxisLength() / _x_tick_spacing);
            nticks = Math.min(nticks, 10);
            _xAxis.ticks(nticks);
        }
    }

    _chart.renderXAxis = function(g, animate) {
        var axisXG = g.selectAll("g.x");

        if (axisXG.empty())
            axisXG = g.append("g")
                .attr("class", "axis x");
        
        var axisg = animate
            ? axisXG.transition().duration(_chart.transitionDuration())
            : axisXG;

        axisg
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.xAxisY() + ")")
            .call(_xAxis);

        if (_chart.isOrdinal()) {
            var w = _chart.width() / _x.domain().length;
            if (w < 30) {
                axisXG.selectAll("text")
                    .attr("transform", "rotate(-90)")
                    .style('text-anchor', 'end');
            }
            else if (w < 100) {
                axisXG.selectAll("text")
                    .attr("transform", "rotate(-45)")
                    .style('text-anchor', 'end');
            }
                
        }

        var gridLineG = g.selectAll("g." + VERTICAL_CLASS);

        if (_renderVerticalGridLine) {
            if (gridLineG.empty())
                gridLineG = g.insert("g", ":first-child")
                    .attr("class", GRID_LINE_CLASS + " " + VERTICAL_CLASS)
                    .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

            var ticks = _xAxis.tickValues() ? _xAxis.tickValues() : _x.ticks(_xAxis.ticks()[0]);

            var lines = gridLineG.selectAll("line")
                .data(ticks);

            // enter
            var linesGEnter = lines.enter()
                .append("line")
                .attr("x1", function (d) {
                    return _x(d);
                })
                .attr("y1", _chart.xAxisY() - _chart.margins().top)
                .attr("x2", function (d) {
                    return _x(d);
                })
                .attr("y2", 0)
                .attr("opacity", 0);
            
            linesGEnter
            if (animate) {
                linesGEnter = linesGEnter
                    .transition()
                    .duration(_chart.transitionDuration());
            }
            linesGEnter.attr("opacity", 1);

            var update = animate
                ? lines.transition().duration(_chart.transitionDuration())
            : lines;

            update
                .attr("x1", _x)
                .attr("y1", _chart.xAxisY() - _chart.margins().top)
                .attr("x2", _x)
                .attr("y2", 0);

            // exit
            lines.exit().remove();
        }
        else {
            gridLineG.selectAll("line").remove();
        }

    };

    _chart.xAxisY = function () {
        return (_chart.height() - _chart.margins().bottom);
    };

    _chart.xAxisLength = function () {
        return _chart.effectiveWidth();
    };

    var _discretey = false;
    _chart.discretey = function(v) {
        if (arguments.length === 0) return _discretey;
        _discretey = v;
        return _chart;
    };

    var _null_yscale = d3.scale.linear().domain([0, 5]);
    function render_yaxis(animate) {
        var g = _chart.g();

        if (!_layered && !_y) {
            _y = d3.scale.linear();
        }

        var scale = _y || _null_yscale;
        scale.rangeRound([_chart.yAxisHeight(), 0]);

        if (_chart.elasticY() && !_layered) {
            scale.domain(_chart.yAxisRange())
        }

        _yAxis.scale(scale);

        if (!_yAxis.tickValues() && _y_tick_spacing) {
            var nticks = Math.round(_chart.yAxisHeight() / _y_tick_spacing);
            nticks = Math.min(nticks, 10);
            _yAxis.ticks(nticks);
        }


        var axisYG = g.selectAll("g.y");
        if (axisYG.empty())
            axisYG = g.append("g")
                .attr("class", "axis y")
                .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

        var domain = scale.domain();
        var n = Math.abs(domain[1] - domain[0]);
        if (_discretey && n < 10) {
            _yAxis.ticks(n);
        }

        if (_layered) {
            if (scale === _null_yscale) {
                _yAxis
                    .tickFormat('');
            }
            else {
                _yAxis.tickFormat(null);
            }
        }

        var yg = axisYG;
        if (animate) {
            yg = yg.transition().duration(_chart.transitionDuration());
        }

        yg.call(_yAxis);

        var gridLineG = g.selectAll("g." + HORIZONTAL_CLASS);
        if (_renderHorizontalGridLine) {
            var ticks = _yAxis.tickValues()
                ? _yAxis.tickValues() : scale.ticks(_yAxis.ticks()[0]);

            if (gridLineG.empty())
                gridLineG = g.insert("g", ":first-child")
                    .attr("class", GRID_LINE_CLASS + " " + HORIZONTAL_CLASS)
                    .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

            var lines = gridLineG.selectAll("line")
                .data(ticks);

            // enter
            var linesGEnter = lines.enter()
                .append("line")
                .attr("x1", 1)
                .attr("y1", scale)
                .attr("x2", _chart.xAxisLength())
                .attr("y2", scale)
                .attr("opacity", 0);

            if (animate) {
                linesGEnter = linesGEnter
                    .transition()
                    .duration(_chart.transitionDuration());
            }

            linesGEnter
                .attr("opacity", 1);

            var update = lines;
            if (animate) {
                update = lines
                    .transition()
                    .duration(_chart.transitionDuration());
            }

            update
                .attr("x1", 1)
                .attr("y1", scale)
                .attr("x2", _chart.xAxisLength())
                .attr("y2", scale)

            // exit
            lines.exit().remove();
        }
        else {
            gridLineG.selectAll("line").remove();
        }
    }

    _chart.show_y_layer = function(i) {
        if (i === null) {
            _y = null;
        }
        else {
            _y = d3.scale.linear()
                .domain([0, d3.max(_layers[i], function(d) { return (d.y + d.y0); } )]);
        }
        render_yaxis(false);
    };

    _chart.yAxisX = function () {
        return _chart.margins().left;
    };

    _chart.y = function (_) {
        if (!arguments.length) return _y;
        _y = _;
        return _chart;
    };

    _chart.yAxis = function (y) {
        if (!arguments.length) return _yAxis;
        _yAxis = y;
        return _chart;
    };

    _chart.elasticY = function (_) {
        if (!arguments.length) return _yElasticity;
        _yElasticity = _;
        return _chart;
    };

    _chart.renderHorizontalGridLines = function (_) {
        if (!arguments.length) return _renderHorizontalGridLine;
        _renderHorizontalGridLine = _;
        return _chart;
    };

    _chart.renderVerticalGridLines = function (_) {
        if (!arguments.length) return _renderVerticalGridLine;
        _renderVerticalGridLine = _;
        return _chart;
    };

    // function passed to Array.reduce to compute the aggregate
    // extent of an array of extents
    function _extent_reduce(r1, r2) {
        return [ Math.min(r1[0], r2[0]), Math.max(r1[1], r2[1]) ];
    }

    _chart.xAxisRange = function() {
        var ranges = _layers.map(function(l) {
            var e = d3.extent(l, _chart.keyAccessor());
            if (e[0] === undefined) { e[0] = Infinity; }
            if (e[1] === undefined) { e[1] = -Infinity; }
            return e;
        } );
        return ranges.reduce(_extent_reduce, [ Infinity, -Infinity ]);
    };

    _chart.yAxisRange = function() {
//        var ranges = _layers.map(function(l) {
//            return d3.extent(l, _chart.valueAccessor());
//        } );
//        return ranges.reduce(_extent_reduce, [ Infinity, -Infinity ]);

        var top = _layers[_layers.length-1];
        return [ 0, d3.max(top, function(d) { return (d.y + d.y0); } ) ];
    };

    _chart.yAxisPadding = function (_) {
        if (!arguments.length) return _yAxisPadding;
        _yAxisPadding = _;
        return _chart;
    };

    _chart.yAxisHeight = function () {
        return _chart.effectiveHeight();
    };

    _chart.round = function (_) {
        if (!arguments.length) return _round;
        _round = _;
        return _chart;
    };

    _chart.brush = function (_) {
        if (!arguments.length) return _brush;
        _brush = _;
        return _chart;
    };

    function brushHeight() {
        return _chart.xAxisY() - _chart.margins().top;
    }

    _chart.renderBrush = function (g) {
        if (_chart.isOrdinal())
            _brushOn = false;

        if (_brushOn) {
            _brush.on("brushstart", brushStart)
                .on("brush", brushing)
                .on("brushend", brushEnd);

            var gBrush = g.append("g")
                .attr("class", "brush")
                .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")")
                .call(_brush.x(_chart.x()));
            gBrush.selectAll("rect").attr("height", brushHeight());
            gBrush.selectAll(".resize").append("path").attr("d", _chart.resizeHandlePath);

//            if (_chart.hasFilter()) {
//                _chart.redrawBrush(g);
//            }
        }
    };

    function brushStart(p) {
    }

    _chart.extendBrush = function () {
        var extent = _brush.extent();
        if (_chart.round()) {
            //extent[0] = extent.map(_chart.round())[0];
            //extent[1] = extent.map(_chart.round())[1];
            extent = extent.map(_chart.round());

            _g.select(".brush")
                .call(_brush.extent(extent));
        }
        return extent;
    };

    _chart.brushIsEmpty = function (extent) {
        return _brush.empty() || !extent || extent[1] <= extent[0];
    };

    var _selectfn = null;  // XXX use d3.dispatch
    _chart.onselect = function(fn) {
        _selectfn = fn;
    };

    function brushing(p) {
        var extent = _chart.extendBrush();
        _chart.redrawBrush(_g);
        if (_selectfn) { _selectfn(_chart.brushIsEmpty(extent) ? null : extent); }
    }

    function brushEnd(p) {
    }

    _chart.redrawBrush = function (g) {
        if (_brushOn) {
//            if (_chart.filter() && _chart.brush().empty())
//                _chart.brush().extent(_chart.filter());

            var gBrush = g.select("g.brush");
            gBrush.call(_chart.brush().x(_chart.x()));
            gBrush.selectAll("rect").attr("height", brushHeight());
        }

        _chart.fadeDeselectedArea();
    };

    _chart.fadeDeselectedArea = function () {
        // do nothing, sub-chart should override this function
    };

    // borrowed from Crossfilter example
    _chart.resizeHandlePath = function (d) {
        var e = +(d == "e"), x = e ? 1 : -1, y = brushHeight() / 3;
        return "M" + (0.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (0.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
    };

    function getClipPathId() {
        var id = _chart.element().attr('id');
        return id + '-clip';
    }

    _chart.clipPadding = function (p) {
        if (!arguments.length) return _clipPadding;
        _clipPadding = p;
        return _chart;
    };

    // XXX
    function appendOrSelect(parent, name) {
        var element = parent.select(name);
        if (element.empty()) element = parent.append(name);
        return element;
    };

    function generateClipPath() {
        var defs = appendOrSelect(_parent, "defs");
        
        var id = getClipPathId();
        var clip = defs.select('#' + id);
        if (clip.empty()) {
            clip = defs.append('clipPath').attr('id', id);
        }
            
        var padding = _clipPadding * 2;
            
        appendOrSelect(clip, "rect")
            .attr("width", _chart.xAxisLength() + padding)
            .attr("height", _chart.yAxisHeight() + padding);
    }

    _chart.doRender = function () {
        if (_x === undefined) {
            throw new Error('coordinate chart missing x axis');
        }

        _chart.generateG();
        generateClipPath();

        prepare_data();

        prepareXAxis(_chart.g());
        _chart.renderXAxis(_chart.g(), false);

        render_yaxis(false);

        if (_chart.dataSet()) {
            _chart.plotData(false);
        }
        _chart.renderBrush(_chart.g());
        enableMouseZoom();

        return _chart;
    };

    function enableMouseZoom() {
        if (_mouseZoomable) {
            _chart.root().call(d3.behavior.zoom()
                .x(_chart.x())
                .scaleExtent([1, 100])
                .on("zoom", function () {
                    _chart.focus(_chart.x().domain());
                    _chart.invokeZoomedListener(_chart);
                }));
        }
    }

    _chart.doResize = function() {
        generateClipPath();

        prepareXAxis(_chart.g());
        _chart.renderXAxis(_chart.g(), false);

        render_yaxis(false);
        
        _chart.plotData(false);
        _chart.redrawBrush(_chart.g());

        return _chart;
    };

    _chart.doRedraw = function () {
        prepare_data();

        if (_chart.elasticX() || _refocused) {
            prepareXAxis(_chart.g());
            _chart.renderXAxis(_chart.g(), true);
        }

        if (_chart.elasticY()) {
            render_yaxis(true);
        }

        _chart.plotData(true);
        _chart.redrawBrush(_chart.g());

        return _chart;
    };

    _chart.brushOn = function (_) {
        if (!arguments.length) return _brushOn;
        _brushOn = _;
        return _chart;
    };

    function hasRangeSelected(range) {
        return range instanceof Array && range.length > 1;
    }

    _chart.focus = function (range) {
        _refocused = true;

        if (hasRangeSelected(range)) {
            _chart.x().domain(range);
        } else {
            _chart.x().domain(_chart.xOriginalDomain());
        }

        _chart.redraw();

        if (!hasRangeSelected(range))
            _refocused = false;
    };

    _chart.refocused = function () {
        return _refocused;
    };

    return _chart;
}

module.exports = CoordinateGridChart;

});
