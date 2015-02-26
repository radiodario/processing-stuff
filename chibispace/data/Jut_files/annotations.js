define(function(require, exports, module) {

var base = require('./base-chart');
var d3 = require('d3');

var $ = require('jquery');
require('bootstrap_tooltip');

// Class to encapsulate annotations on a timeseries chart, rendered as
// bubbles on the appropriate date. This is used for showing events in
// conjunction with chart statistics.
function Annotations(parent, popover_container) {
    var _chart = base.ColorChart(base.BaseChart(parent.el));
    var _minRadiusWithLabel = 0;

    // Pulled from dc.js bubble charts
    _chart.BUBBLE_NODE_CLASS = "node";
    _chart.BUBBLE_CLASS = "bubble";
    _chart.MIN_RADIUS = 10;

    // Labels on by default. Override the default behavior to look for
    // a 'label' property instead of just the key.
    _chart.label(function(d) {
        return (typeof d.label !== 'undefined') ? d.label : d.key;
    });

    _chart.render = function () {
        if (! _chart.dataSet()) {
            throw new Error("annotations data not set");
        }

        var containerG = parent.g().selectAll("g.annotations");
        if (containerG.empty()) {
            containerG = parent.g()
                .append("g")
                .attr("class", "annotations");
        }
            
        var bubbleG = containerG
            .selectAll("g." + _chart.BUBBLE_NODE_CLASS)
            .data(_chart.data());

        renderNodes(bubbleG);

        updateNodes(bubbleG);

        removeNodes(bubbleG);
    };

    function renderNodes(bubbleG) {
        var bubbleGEnter = bubbleG.enter().append("g");

        bubbleGEnter
            .attr("class", _chart.BUBBLE_NODE_CLASS)
            .attr("transform", bubbleLocator)
            .append("circle").attr("class", function(d, i) {
                return _chart.BUBBLE_CLASS + " _" + i;
            })
            .on("click", _chart.onClick)
            .attr("fill", _chart.getColor)
            .attr("r", 0);

        doRenderPopover(bubbleGEnter);

        d3.transition(bubbleG, _chart.transitionDuration())
            .attr("r", function(d) {
                return _chart.bubbleR(d);
            })
            .attr("opacity", function(d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        doRenderLabel(bubbleGEnter);
    }

    function updateNodes(bubbleG) {
        d3.transition(bubbleG, _chart.transitionDuration())
            .attr("transform", bubbleLocator)
            .selectAll("circle." + _chart.BUBBLE_CLASS)
            .attr("fill", _chart.getColor)
            .attr("r", function(d) {
                return _chart.bubbleR(d);
            })
            .attr("opacity", 0.5)
        ;

        _chart.doUpdateLabels(bubbleG);
    }

    function removeNodes(bubbleG) {
        bubbleG.exit().remove();
    }

    // XXX/demmer fixme?
    _chart.bubbleR = function(d) {
        return 12;
    };

    // Use the parent's x axis to place the bubble
    function bubbleX(d) {
        var x = parent.x()(_chart.keyAccessor()(d));
        if (isNaN(x)) {
            x = 0;
        }
        return x;
    }
    
    // Place the event on top of the X axis line itself
    function bubbleY(d) {
//        return parent.xAxisY();
        return 15;

        // var y = _chart.margins().top + _chart.y()(_chart.valueAccessor()(d));
        // if (isNaN(y))
        //     y = 0;
        // return y;
    }

    function bubbleLocator(d) {
        return "translate(" + (bubbleX(d)) + "," + (bubbleY(d)) + ")";
    }

    var labelFunction = function (d) {
        return _chart.label()(d);
    };

    var labelOpacity = function (d) {
        return (_chart.bubbleR(d) > _minRadiusWithLabel) ? 1 : 0;
    };

    function doRenderLabel(bubbleGEnter) {
        if (_chart.renderLabel()) {
            var label = bubbleGEnter.select("text");

            if (label.empty()) {
                label = bubbleGEnter.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .on("click", _chart.onClick);
            }

            label
                .attr("opacity", 0)
                .text(labelFunction);
            d3.transition(label, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    }

    _chart.doUpdateLabels = function (bubbleGEnter) {
        if (_chart.renderLabel()) {
            var labels = bubbleGEnter.selectAll("text")
                .text(labelFunction);
            d3.transition(labels, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    };

    // The default behavior on a click is to do nothing
    _chart.onClick = function(d) {
    };

    // Add hover popover by default
    function doRenderPopover(bubbleGEnter) {
        bubbleGEnter.each(function(d) {
            var _this = $(this);
            _this.popover({title: d.title,
                           content: d.content,
                           html: true,
                           trigger: "manual",
                           container: popover_container ? popover_container : "body"});

            // Build a little state machine to support both hover to
            // automatically show/hide, but also support click to pin
            _this.data('popover_mode', 'hidden');
            
            _this.on('mouseenter', function(e) {
                if (_this.data('popover_mode') === 'hidden') {
                    _this.data('popover_mode', 'hover');
                    _this.popover('show');
                }
            });

            _this.on('mouseleave', function(e) {
                if (_this.data('popover_mode') === 'hover') {
                    _this.data('popover_mode', 'hidden');
                    _this.popover('hide');
                }
            });

            _this.click(function(e) {
                if (_this.data('popover_mode') === 'hidden') {
                    _this.data('popover_mode', 'pinned');
                    _this.popover('show');
                } else if (_this.data('popover_mode') === 'hover') {
                    _this.data('popover_mode', 'pinned');
                } else {
                    _this.data('popover_mode', 'hidden');
                    _this.popover('hide');
                }
            });
        });
    }

    // Hook up the chart's render function to be called whenever the
    // parent chart is rendered
    parent.renderlet(_chart.render);
    
    return _chart;
}

module.exports = Annotations;
});
