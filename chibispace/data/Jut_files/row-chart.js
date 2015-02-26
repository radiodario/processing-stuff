define(function(require, exports, module) {

var base = require('./base-chart');

var d3 = require('d3');

function RowChart(el) {
    var _g;
    var _labelOffsetX = 10;
    var _labelOffsetY = 8;
    var _gap = 5;
    var _rowCssClass = "row";
    var _chart = base.marginable(base.ColorChart(base.BaseChart(el)));
    var _x;
    var _elasticX;
    var _xAxis = d3.svg.axis().orient("bottom");

    function calculateAxisScale() {
        if (!_x || _elasticX) {
            _x = d3.scale.linear()
                .domain([0, d3.max(_chart.data(), _chart.valueAccessor())])
                .range([0, _chart.effectiveWidth()]);

            _xAxis.scale(_x);
        }
    }

    function drawAxis() {
        var axisG = _g.select("g.axis");

        calculateAxisScale();

        if (axisG.empty())
            axisG = _g.append("g").attr("class", "axis")
                .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");

        axisG
            .transition()
            .duration(_chart.transitionDuration())
            .call(_xAxis);
    }

    _chart.doRender = function () {
        _g = _chart.svg()
            .append("g")
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

        drawAxis();
        drawGridLines();
        drawChart();

        return _chart;
    };

    _chart.title(function (d) {
        return _chart.keyAccessor()(d) + ": " + _chart.valueAccessor()(d);
    });

    _chart.label(function (d) {
        return _chart.keyAccessor()(d);
    });

    _chart.x = function(x){
        if(!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    function drawGridLines() {
        _g.selectAll("g.tick")
            .select("line.grid-line")
            .remove();

        _g.selectAll("g.tick")
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", function (d) {
                return -_chart.effectiveHeight();
            });
    }

    function drawChart() {
        drawAxis();
        drawGridLines();

        var rows = _g.selectAll("g." + _rowCssClass)
            .data(_chart.data());

        var rowEnter = rows.enter()
            .append("g")
            .attr("class", function (d, i) {
                return _rowCssClass + " _" + i;
            });

        rowEnter.append("rect")
            .attr("width", 0);

        rows.exit().remove();

        var nrows = _chart.data().length;
        var height = (_chart.effectiveHeight() - (nrows + 1) * _gap) / nrows;

        rows.attr("transform",function (d, i) {
            return "translate(0," + ((i + 1) * _gap + i * height) + ")";
        });

        var rects = rows.select("rect")
            .attr("height", height)
            .attr("fill", _chart.getColor)
            .on("click", _chart.raiseClick);

        if (_chart.renderLabel()) {
            rowEnter.append("text")
                .on("click", _chart.raiseClick);
            rows.select("text")
                .attr("x", _labelOffsetX)
                .attr("y", _labelOffsetY)
                .attr("class", function (d, i) {
                    return _rowCssClass + " _" + i;
                })
                .text(function (d) {
                    return _chart.label()(d);
                });
        }

        if (_chart.hasSelectedItems()) {
            rects
                .classed("deselected", function (d) {
                    return !_chart.isSelectedItem(d);
                })
                .classed("selected", function (d) {
                    return _chart.isSelectedItem(d);
                });
        }
        else {
            rects.classed("selected", null)
                .classed("deselected", null);
        }

        rects
            .transition()
            .duration(_chart.transitionDuration())
            .attr("width", function (d) {
                return _x(_chart.valueAccessor()(d));
            });

        if (_chart.renderTitle()) {
            rects.selectAll("title").remove();
            rects.append("title").text(_chart.title());
        }
    }

    _chart.doRedraw = function () {
        drawChart();
        return _chart;
    };

    _chart.xAxis = function () {
        return _xAxis;
    };

    _chart.gap = function (g) {
        if (!arguments.length) return _gap;
        _gap = g;
        return _chart;
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _elasticX;
        _elasticX = _;
        return _chart;
    };

    _chart.labelOffsetX = function (o) {
        if (!arguments.length) return _labelOffsetX;
        _labelOffsetX = o;
        return _chart;
    };

    _chart.labelOffsetY = function (o) {
        if (!arguments.length) return _labelOffsetY;
        _labelOffsetY = o;
        return _chart;
    };

    return _chart;
}

module.exports = RowChart;
});
