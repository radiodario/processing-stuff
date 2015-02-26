define(function(require, exports, module) {
// a Bar chart
var d3 = require('d3');
var Legend = require('./legend');
var tooltip = require('./tooltip');


var BarChart = function () {

    var mode = "stacked"; // could be stacked or grouped
    var margin = {
        top: 50,
        bottom: 30,
        left: 100,
        right: 30
    };
    var padding = 20;
    var height = 400;
    var width = 1000;
    var xValue = function(d) {
        return d.x;
    };
    var yValue = function(d) {
        return d.y;
    };
    var nameValue = function(d) {
        return d.name;
    };
    var offset = 'zero';
    var order = 'default';
    var yScale = d3.scale.linear().nice();
    var colors = d3.scale.category10();

    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    var title = 'Chart Title';
    var yAxisTitle = 'Axis Title';
    var duration = 1000;
    var legend = Legend();

    var xScale = d3.scale.ordinal();
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSize(5)
        .orient("bottom");

    // var tickFormat = d3.time.format("%Y-%m-%d");
    // var xAxisFontSize = 10;
    // var yAxisFontSize = 10;

    var formatterX = function (d) {
        if (d.length > 20) {
            return d.slice(0,19) + '…';
        } else {
            return d;
        }
    };
    var formatterY = d3.format(".02f");

    // function toDate(e) {
    //     return new Date(e);
    // }
    // var sortByDateDesc = function(a, b) {
    //     return toDate(xValue(a)) > toDate(xValue(b)) ? 1 : -1;
    // };
    // var sortByDateAsc = function(a, b) {
    //     return toDate(xValue(b)) < toDate(xValue(a)) ? 1 : -1;
    // };
    var dispatch = d3.dispatch('showTooltip', 'hideTooltip', "pointMouseover", "pointMouseout");

    function chart(selection) {
        selection.each(function(rawData) {
            var containerID = this;
            // preserve rawData variable (needed to control updates of legend module)
            var data = rawData.filter(function(d) {
                return !d.disabled;
            });
            // //sort the data points in each layer
            // data.forEach(function(layer) {
            //     layer.values.sort(sortByDateDesc)
            // });

            // convert the data to an appropriate representation
            data = d3.layout.stack()
                .offset(offset)
                .order(order)
                .values(function(d) {
                    return d.values;
                })
                .x(xValue)
                .y(yValue)
                (data); // we pass the data as context

            var legendWidth = legend.width();
            legend
                .height(height)
                .nameValue(nameValue);


            var xDomain = data[0].values.map(function(d) {
                    return xValue(d);
                });

            // set up scales and axes
            xScale
                .domain(xDomain)
                .rangeRoundBands([0, width - (margin.right + legendWidth)], 0.1);

            // how many data points are there in each layer on average
            // var avgDataPoints = function() {
            //     var sumPoints = 0;
            //     data.forEach(function(layer) {
            //         sumPoints += layer.values.length;
            //     });
            //     return (sumPoints / data.length);
            // };

            // xAxis
            //     .tickValues(xScale.domain().filter(function(d, i) {
            //     var nthLabel = Math.ceil(200 / (width / avgDataPoints()));
            //     // //console.log(nthLabel)
            //     return !(i % nthLabel);
            // }))

            var yGroupMax = d3.max(data, function(layer) {
                return d3.max(layer.values, function(d) {
                return d.y;
                });
            });

            var yStackMax = d3.max(data, function(layer) {
                return d3.max(layer.values, function(d) {
                return d.y0 + d.y;
                });
            });

            var numLayers = data.length;

            // var maxLayerLength = d3.max(data, function(layer) {
            //     return layer.values.length;
            // });

            yScale.range([height - (margin.top + margin.bottom), 0]);

            if (mode === "stacked") {
                yScale.domain([0, Math.ceil(yStackMax)]);
            } else {
                yScale.domain([0, Math.ceil(yGroupMax)]);
            }


            // functions for rect attributes depending on stacked/group mode
            var xScaleMode = function(d, i, j) {
                if (mode === "stacked") {
                    return xScale(xValue(d));
                } else {
                    return xScale(xValue(d)) + xScale.rangeBand() / numLayers * j;
                }
            };
            var yScaleMode = function(d) {
                if (mode === "stacked") {
                    return yScale(d.y0 + d.y);
                } else {
                    return yScale(d.y);
                } 
            };
            var heightMode = function(d) {
                if (mode === "stacked") {
                    return yScale(d.y0) - yScale(d.y0 + d.y);
                } else {
                    return height - yScale(d.y) - margin.top - margin.bottom;
                } 
            };
            var widthMode = function() {
                if (mode === "stacked") {
                    return xScale.rangeBand();
                } else {
                    return xScale.rangeBand() / numLayers;
                } 
            };

            // set up the scaffolding
            // note: enter only fires if data is empty
            var svg = d3.select(containerID).selectAll("svg").data([data]);
            var gEnter = svg.enter().append("svg").attr("class", "citrus-charts").append("g");
            gEnter.append("g").attr("class", "rects");
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis").append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".72em")
                .attr("class", "y axis label")
                .attr("text-anchor", "middle");
            gEnter.append("svg:text").attr("class", "chartTitle label")
                .attr("text-anchor", "middle")
                .attr("dy", "1em");
            gEnter.append("g")
                .attr("class", "legend")
                .style("font-size", "12px");

            // update the outer dimensions
            svg
                .attr("width", width)
                .attr("height", height);

            // update the inner dimensions
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // reasign the data to trigger points
            // specify a key function based on *name*,
            // so that entering/exiting works properly when filters are triggered
            var gLayer = g.select('.rects').selectAll('g.layerrects')
                .data(function(d) {
                    return d;
                }, function(d) {
                    return nameValue(d);
                })
                .classed('hover', function(d) {
                    return d.hover;
                });

            gLayer
                .exit()
                .transition()
                .duration(duration)
                .style('stroke-opacity', 1e-6)
                .style('fill-opacity', 1e-6)
                .remove();

            var gLayerEnter = gLayer.enter();

            // update entering rects
            gLayerEnter.append("g")
                .attr("class", "layerrects")
                .attr("id", function(d) {
                    return nameValue(d);
                })
                .attr("fill", function(d, i) {
                    return colors(nameValue(d));
                });


            var gRects = gLayer
                .selectAll('rect')
                .data(function(d) {
                    d.values.forEach(function(v) {
                        v.name = nameValue(d);
                    });
                    return d.values;
                }, xValue);

            gRects
                .exit()
                .remove();

            gRects.enter()
                .append('rect')
                .attr('id', xValue);
                
            // update the chillin rects
            gRects
                .attr("opacity", 0.1)
                .attr("x", xScaleMode)
                .attr("y", function(d) {
                    return height - margin.top - margin.bottom;
                })
                .attr("height", 0)
                .attr("width", widthMode)
                .on('mouseover', function(d, i, j) {
                    dispatch.pointMouseover({
                        el: this,
                        x: xValue(d),
                        y: yValue(d),
                        series: d.name,
                        pos: [xScale(xValue(d)), yScaleMode(d)],
                        pointIndex: i,
                        seriesIndex: j
                    });
                })
                .on('mouseout', function(d) {
                    dispatch.pointMouseout({
                    // point: d,
                    // series: data[d.series],
                    // pointIndex: d.point,
                    // seriesIndex: d.series
                    });
                })
                .transition()
                .duration(duration)
                .attr("opacity", 0.9)
                .attr("y", yScaleMode)
                .attr("height", heightMode);
                

            // update the title
            g.select("text.chartTitle")
                .attr("transform", "translate(" + (width - margin.left - margin.right + padding) / 2 + "," + (-margin.top) + ")")
                .text(title);

            // update the x-axis
            g.select(".x.axis")
                .attr("transform", "translate(0," + yScale.range()[0] + ")")
                .call(xAxis)
                .selectAll("text")
                .text(formatterX)
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-45)";
                });



            // update the y-axis
            g.select(".y.axis")
                .transition()
                .duration(duration)
                .call(yAxis);

            g.select(".y.axis.label")
                .attr("y", -margin.left)
                .attr("x", (-height + margin.top + margin.bottom) / 2)
                .attr("dy", "1em")
                .text(yAxisTitle);

            // handle change from/to stacked/grouped
            d3.selectAll("input.modeChanger").on("change", change);

            function change() {
                //console.log("mode change")
                if (this.value === "grouped") {
                mode = "grouped";
                yScale.domain([0, yGroupMax]);
                transitionGrouped();
                } else {
                mode = "stacked";
                yScale.domain([0, yStackMax]);
                transitionStacked();
                }
            }


            // transition to grouped layout
            function transitionGrouped() {
                // update the y-axis
                g.select(".y.axis")
                    .call(yAxis);

                g.selectAll('g.layerrects').selectAll('rect')
                    .transition()
                    .duration(500)
                    .delay(function(d, i) {
                        return i * 10;
                    })
                    .attr("x", function(d, i, j) {
                    // //console.log(d,i,j)
                        return xScale(xValue(d)) + xScale.rangeBand() / numLayers * j;

                    })
                    .attr("width", xScale.rangeBand() / numLayers)
                    .transition()
                    .attr("y", function(d) {
                        return yScale(d.y);
                    })
                    .attr("height", function(d) {
                        return height - yScale(d.y) - margin.top - margin.bottom;
                    });
            }

            //transition to stacked layout
            function transitionStacked() {

                // update the y-axis
                g.select(".y.axis")
                    .call(yAxis);

                g.selectAll('g.layerrects').selectAll('rect')
                    .transition()
                    .duration(500)
                    .delay(function(d, i) {
                        return i * 10;
                    })
                    .attr("y", function(d) {
                        return yScale(d.y0 + d.y);
                    })
                    .attr("height", function(d) {
                        return yScale(d.y0) - yScale(d.y0 + d.y);
                    })
                    .transition()
                    .attr("x", function(d) {
                        return xScale(xValue(d));
                    })
                    .attr("width", xScale.rangeBand());
            }



            // redraw the legend only if the data has changed
            if (legend.numData() !== rawData.length) {
                // update the legend
                g.select('.legend')
                    .datum(data)
                    .call(legend);
            }

            // always adjust the position of the legend
            g.select('.legend')
                .attr("transform", "translate(" + (width - (margin.right + legendWidth) + padding) + "," + 0 + ")");

            // listen for click events from the legend module,
            // filter the relevant data series
            legend.dispatch.on('legendClick', function(d, i) {
                d.disabled = !d.disabled;

                var filteredData = data.filter(function(d) {
                    return !d.disabled;
                });

                if (!filteredData.length) {
                    data.forEach(function(d) {
                        d.disabled = false;
                    });
                }

                selection.call(chart);
            });

            // listen for mouseover events from legend module
            // flag 'hover' on data series
            legend.dispatch.on('legendMouseover', function(d, i) {
                d.hover = true;
                return selection.call(chart);
            });

            // listen for mouseout events from legend module
            // remove 'hover' from data series
            legend.dispatch.on('legendMouseout', function(d, i) {
                d.hover = false;
                return selection.call(chart);
            });

            // listen for mouseover events within this module
            // (i.e. on rectangles) and show tooltip
            dispatch.on('pointMouseover.tooltip', function(e) {
                var bRect = e.el.getBoundingClientRect();
                
                var left = bRect.left + ((bRect.right - bRect.left)*0.45);
                var top = bRect.top;
                var content = '<h5>' + e.series + '</h5>' +
                '<p>' +
                '<span class="value">[' + formatterX(e.x) + ', ' + formatterY(e.y) + ']</span>' +
                '</p>';

                tooltip.show([left, top], content, 'n');
            });

            // listen for mouseout events within this module
            // hide tooltip
            dispatch.on('pointMouseout.tooltip', function(e) {
                tooltip.cleanup();
            });


        });
    }

    chart.dispatch = dispatch;

    chart.margin = function(_) {
        if (!arguments.length) {
            return margin;
        }
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) {
            return width;
        }
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) {
            return height;
        }
        height = _;
        return chart;
    };

    chart.title = function(_) {
        if (!arguments.length) {
            return title;
        }
        title = _;
        return chart;
    };

    chart.xAxis = function(_) {
        if (!arguments.length) {
            return xAxis;
        }
        xAxis = _;
        return chart;
    };

    chart.yAxis = function(_) {
        if (!arguments.length) {
            return yAxis;
        }
        yAxis = _;
        return chart;
    };

    chart.yAxisTitle = function(_) {
        if (!arguments.length) {
            return yAxisTitle;
        }
        yAxisTitle = _;
        return chart;
    };

    chart.duration = function(_) {
        if (!arguments.length) {
            return duration;
        }
        duration = _;
        return chart;
    };

    chart.formatterX = function(_) {
        if (!arguments.length) {
            return formatterX;
        }
        formatterX = _;
        return chart;
    };

    chart.formatterY = function(_) {
        if (!arguments.length) {
            return formatterY;
        }
        formatterY = _;
        return chart;
    };

    chart.legend = function(_) {
        if (!arguments.length) {
            return legend;
        }
        legend = _;
        return chart;
    };

    chart.xValue = function(_) {
        if (!arguments.length) {
            return xValue;
        }
        xValue = _;
        return chart;
    };

    chart.yValue = function(_) {
        if (!arguments.length) {
            return yValue;
        }
        yValue = _;
        return chart;
    };

    chart.nameValue = function(_) {
        if (!arguments.length) {
            return nameValue;
        }
        nameValue = _;
        return chart;
    };

    chart.colors = function(_) {
        if (!arguments.length) {
            return colors;
        }
        colors = _;
        return chart;
    };

    chart.mode = function(_) {
        if (!arguments.length) {
            return mode;
        }
        mode = _;
        return chart;
    };

    return chart;
};

module.exports = BarChart;

});
