define(function(require, exports, module) {

var base = require('./base-chart');

var d3 = require('d3');

function PieChart(el) {
    var DEFAULT_MIN_ANGLE_FOR_LABEL = 0.5;

    var _sliceCssClass = "pie-slice";

    var _radius,
        _effective_radius,
        _innerRadius = 0;

    var _g;

    var _minAngleForLabel = DEFAULT_MIN_ANGLE_FOR_LABEL;

    var _chart = base.ColorChart(base.BaseChart(el));

    _chart.label(function (d) {
        return _chart.keyAccessor()(d.data);
    });

    _chart.renderLabel(true);

    _chart.title(function (d) {
        return _chart.keyAccessor()(d.data) + ": " + _chart.valueAccessor()(d.data);
    });

    _chart.transitionDuration(350);

    function center(animate) {
        var s = animate
            ? _g.transition().duration(_chart.transitionDuration()) : _g;
        
        s.attr("transform", "translate(" + _chart.cx() + "," + _chart.cy() + ")");
    }

    _chart.doRender = function () {
        _g = _chart.svg()
            .append("g");
        center(false);
        drawChart(false);

        return _chart;
    };

    function drawChart(animate) {
        center(animate);
        if (_chart.dataSet() && _g) {
            var pie = d3.layout.pie()
                .sort(null)
                .value(_chart.valueAccessor());

            // set radius on basis of chart dimension if missing
            _effective_radius = _radius ? _radius
                : d3.min([_chart.width(), _chart.height()]) /2;

            var arc = _chart.buildArcs();
            var pieData = pie(_chart.data());
            var slices = _g.selectAll("g." + _sliceCssClass)
                .data(pieData, function(d) {
                    return _chart.keyAccessor()(d.data);
                });

            var paths = slices.select('path');

            if (animate) {
                paths
                  .transition().duration(_chart.transitionDuration())
                    .attrTween('d', tweenPie);
            }
            else {
                paths
                    .attr("d", function (d, i) {
                        return safeArc(d, i, arc);
                    });
            }

            var enter = slices.enter();
            var newg = enter.append("g")
                .attr("class", function (d, i) {
                    return _sliceCssClass + " _" + i;
                });
            newg.append("path")
                .attr("fill", _chart.getColor)
                .on("click", onClick)
              .transition().duration(_chart.transitionDuration())
                .attrTween("d", tweenPie);

            slices.exit().remove();



            if (_chart.renderTitle()) {
                newg.append("title");
                slices.select("title")
                    .text(_chart.title());
            }

            if (_chart.renderLabel()) {
                newg.append("text")
                    .attr("class", function(d, i) {
                        return _sliceCssClass + "_" + i;
                    })
                    .on("click", onClick)
                    .attr("text-anchor", "middle")
                    .text(function(d) {
                        return _chart.label()(d);
                    });
                
                var labels = slices.select("text")
                if (animate) {
                    labels = labels
                      .transition()
                        .duration(_chart.transitionDuration());
                }

                labels
                    .attr('visibility', function(d) {
                        return (sliceHasNoData(d.data) || sliceTooSmall(d))
                            ? 'hidden' : 'visible';
                    } )
                    .attr("transform", function (d) {
                        d.innerRadius = _chart.innerRadius();
                        d.outerRadius = _effective_radius;
                        var centroid = arc.centroid(d);
                        if (isNaN(centroid[0]) || isNaN(centroid[1])) {
                            return "translate(0,0)";
                        } else {
                            return "translate(" + centroid + ")";
                        }
                    });
            }

            if (_chart.hasSelectedItems()) {
                _chart.selectAll("g." + _sliceCssClass).each(function (d) {
                    if (_chart.isSelectedItem(d.data)) {
                        _chart.highlightSelected(this);
                    } else {
                        _chart.fadeDeselected(this);
                    }
                });
            } else {
                _chart.selectAll("g." + _sliceCssClass).each(function (d) {
                    _chart.resetHighlight(this);
                });
            }
        }
    }

    _chart.innerRadius = function (r) {
        if (!arguments.length) return _innerRadius;
        _innerRadius = r;
        return _chart;
    };

    _chart.radius = function (r) {
        if (!arguments.length) return _radius;
        _radius = r;
        return _chart;
    };

    _chart.cx = function () {
        return _chart.width() / 2;
    };

    _chart.cy = function () {
        return _chart.height() / 2;
    };

    _chart.buildArcs = function () {
        return d3.svg.arc()
            .outerRadius(_effective_radius)
            .innerRadius(_innerRadius);
    };

    _chart.doRedraw = function () {
        drawChart(true);
        return _chart;
    };

    _chart.doResize = function() {
        drawChart(false);
        return _chart;
    };

    _chart.minAngleForLabel = function (_) {
        if (!arguments.length) return _minAngleForLabel;
        _minAngleForLabel = _;
        return _chart;
    };

    function sliceTooSmall(d) {
        var angle = (d.endAngle - d.startAngle);
        return isNaN(angle) || angle < _minAngleForLabel;
    }

    function sliceHasNoData(data) {
        return _chart.valueAccessor()(data) === 0;
    }

    function tweenPie(b) {
        b.innerRadius = _chart.innerRadius();
        var current = this._current;
        if (isOffCanvas(current))
            current = {startAngle: 0, endAngle: 0};
        var i = d3.interpolate(current, b);
        this._current = i(0);
        return function (t) {
            return safeArc(i(t), 0, _chart.buildArcs());
        };
    }

    function isOffCanvas(current) {
        return !current || isNaN(current.startAngle) || isNaN(current.endAngle);
    }

    function onClick(d) {
        _chart.raiseClick(d.data);
    }

    function safeArc(d, i, arc) {
        var path = arc(d, i);
        if (path.indexOf("NaN") >= 0)
            path = "M0,0";
        return path;
    }

    return _chart;
}

module.exports = PieChart;
});
