define(function(require, exports, module) {

var CoordinateChart = require('./coordinate-grid');

var d3 = require('d3');

function BarChart(el) {
    var MIN_BAR_WIDTH = 1;
    var DEFAULT_GAP_BETWEEN_BARS = 2;

    var _chart = CoordinateChart(el);

    var _gap = DEFAULT_GAP_BETWEEN_BARS;
    var _centerBar = false;

    _chart.plotData = function(animate) {
        var nbars = _chart.xUnitCount();

        var barw = Math.floor((_chart.xAxisLength() - (nbars - 1) * _gap) / nbars);
        if (barw == Infinity || isNaN(barw) || barw < MIN_BAR_WIDTH)
            barw = MIN_BAR_WIDTH;

        var layers = _chart.chartBodyG().selectAll("g.stack")
            .data(_chart.layers());
        
        layers.enter().append("g")
            .attr("class", function(d, i) { return "stack _" + i; })
            .style("fill", function (d, i) {
                return _chart.colors()(i);
            });
        
        var bars = layers.selectAll("rect.bar")
            .data(Object);
        
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .on('click', function(d) { _chart.raiseClick(d); })
            .append("title").text(_chart.title());


        bars
            .transition()
            .duration(_chart.transitionDuration())
            .attr("x", function (d) {
                var x = _chart.x()(_chart.keyAccessor()(d));
                if (_centerBar) x -= barw / 2;
                return x;
            })
            .attr("y", function(d) {
                return _chart.y()(d.y + d.y0);
            })
            .attr("width", barw)
            .attr("height", function (d) {
                //return dc.utils.safeNumber(_chart.y()(d.y0) - _chart.y()(d.y + d.y0));
                return (_chart.y()(d.y0) - _chart.y()(d.y + d.y0));
            })
            .select("title").text(_chart.title());

        bars.exit()
            .transition()
            .duration(_chart.transitionDuration())
            .attr("height", 0)
            .remove();
    };

    // The x range needs to contain enough space to render all
    // the bars.  For example, suppose we have 3 bars with x values
    // 0, 1, and 2.  The "natural" extent of the x domain is [0, 2]
    // but if we're drawing regular bars, the last one will cover
    // the space from 2-3.  If we're centering the bars, the first
    // one will go from -0.5 to 0.5 and the last one will go from
    // 1.5 to 2.5.  Adjust the x range here to handle this...
    _chart.base_xrange = _chart.xAxisRange;
    _chart.xAxisRange = function() {
        var e = _chart.base_xrange();
        var units = _chart.xUnits()(e[0], e[1]);
        if (units instanceof Array) { units = units.length; }
        var extra = (e[1] - e[0]) / units;
        if (_centerBar) {
            e[0] -= extra/2;
            e[1] += extra/2;
        }
        else {
            e[1] += extra;
        }
        return e;
    };

    // XXX
    var SELECTED_CLASS = 'selected';
    var DESELECTED_CLASS = 'deselected';
    
    _chart.fadeDeselectedArea = function () {
        var bars = _chart.chartBodyG().selectAll("rect.bar");
        var extent = _chart.brush().extent();

        if (_chart.isOrdinal()) {
            if (_chart.hasSelectedItems()) {
                bars.classed(SELECTED_CLASS, function (d) {
                    return _chart.isSelectedItem(d);
                });
                bars.classed(DESELECTED_CLASS, function (d) {
                    return !_chart.isSelectedItem(d);
                });
            } else {
                bars.classed(SELECTED_CLASS, false);
                bars.classed(DESELECTED_CLASS, false);
            }
        } else {
            if (!_chart.brushIsEmpty(extent)) {
                var start = extent[0];
                var end = extent[1];

                bars.classed(DESELECTED_CLASS, function (d) {
                    var xValue = _chart.keyAccessor()(d);
                    return xValue < start || xValue >= end;
                });
            } else {
                bars.classed(DESELECTED_CLASS, false);
            }
        }
    };

    _chart.centerBar = function (_) {
        if (!arguments.length) return _centerBar;
        _centerBar = _;
        return _chart;
    };

    _chart.gap = function (_) {
        if (!arguments.length) return _gap;
        _gap = _;
        return _chart;
    };

    _chart.extendBrush = function () {
        var extent = _chart.brush().extent();
        if (_chart.round() && !_centerBar) {
            extent[0] = extent.map(_chart.round())[0];
            extent[1] = extent.map(_chart.round())[1];

            _chart.chartBodyG().select(".brush")
                .call(_chart.brush().extent(extent));
        }
        return extent;
    };

    _chart.legendHighlight = function (d) {
        _chart.select('.chart-body').selectAll('rect.bar').filter(function () {
            return d3.select(this).attr('fill') == d.color;
        }).classed('highlight', true);
        _chart.select('.chart-body').selectAll('rect.bar').filter(function () {
            return d3.select(this).attr('fill') != d.color;
        }).classed('fadeout', true);
    };

    _chart.legendReset = function (d) {
        _chart.selectAll('.chart-body').selectAll('rect.bar').filter(function () {
            return d3.select(this).attr('fill') == d.color;
        }).classed('highlight', false);
        _chart.selectAll('.chart-body').selectAll('rect.bar').filter(function () {
            return d3.select(this).attr('fill') != d.color;
        }).classed('fadeout', false);
    };

    return _chart;
}

module.exports = BarChart;
});
