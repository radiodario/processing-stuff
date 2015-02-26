define(function(require, exports, module) {
// The legend box
var d3 = require('d3');


var Legend = function() {
    var margin = {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
    };
    var height = 200;
    var width = 200;
    // var style = 'stack';
    // var offset = 'zero';
    // var order = 'default';
    var colors = d3.scale.category10();
    var title = 'Chart Title';
    var duration = 1000;
    var itemLineSpacing = 20;
    // var xPadding = "1em";
    var nameValue = function(d) { 
        return d.name;
    };
    var dispatch = d3.dispatch('legendClick', 'legendMouseover', 'legendMouseout');
    var numData;

    function chart(selection) {
        selection.each(function(data) {


            numData = data.length;
            // set up scaffolding
            var svg = d3.select(this).selectAll("svg").data([data]);
            var gEnter = svg.enter().append("svg").attr('class', 'legend').append("g");
            gEnter.append("g").attr("class", 'legend');

            //update outer dimensions
            svg
                .attr("width", width)
                .attr("height", height);

            //update inner dimensions
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // reassign the data to trigger addition / deletion
            var gLegendItem = g.select(".legend").selectAll('.legendItem')
                .data(function (d) { return d; });

            // add g for each legend item
            var gLegendItemEnter = gLegendItem.enter()
                .append("g")
                .attr("class", "legendItem")
                .on('click', function(d, i) {
                    dispatch.legendClick(d, i);
                    gLegendItem.classed('disabled', function(d) { return d.disabled; });

                    gLegendItem
                        .select('circle')
                        .style('fill-opacity', '1');

                    gLegendItem
                        .filter('.disabled')
                        .select('circle')
                        .style('fill-opacity', '0');




                })
                .on('mouseover', function(d, i) {
                    dispatch.legendMouseover(d, i);
                })
                .on('mouseout', function(d, i) {
                    dispatch.legendMouseout(d, i);
                });

            // add circles and text elements
            gLegendItemEnter.append("circle")
                .attr("class", "circle")
                .attr("cx", 0)
                .attr("cy",function(d,i) {
                    // //console.log(d,i)
                    return -0.25+"em";
                })
                .attr("r", 5)
                .attr("stroke-width", 1)
                .attr("stroke", function(d, i) {
                    return colors(i);
                })
                .attr("fill", function(d, i) {
                    return colors(i);
                });

            gLegendItemEnter.append("text")
                .attr("class", "text")
                .attr("y", 0)
                .attr("x", 11)
                .attr("width", width-11)
                .text(nameValue);


            gLegendItem.classed('disabled', function(d) { return d.disabled; });

            gLegendItem.exit()
                .remove();

            var yPos = 5;
            var newYpos = 0;
            var xPos = 5;
            var maxLength = 0;

            gLegendItem
                .attr("opacity", 0)
                .attr('transform', function(d, i) {

                        if (length > maxLength) {
                            maxLength = length;
                        }
                         yPos += itemLineSpacing;

                     // if y has reached the vertical limit
                     // if (yPos > height - margin.top - margin.bottom) {
                     //     yPos = 5;
                     //     xPos += width;
                     // }

                     // TO DO: handle horizonal limit cut-off remaining legendItems?
                     // // if x has reached the horizontal limit
                     // ...



                     newYpos = this.getBoundingClientRect().height + 5; // a bit of padding

                     return 'translate(' + xPos + ',' + yPos + ')';
                })
                .transition()
                .duration(duration)
                .attr("opacity", 1);
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

    chart.duration = function(_) {
        if (!arguments.length) {
            return duration;
        }
        duration = _;
        return chart;
    };

    chart.colors = function(_) {
        if (!arguments.length) {
            return colors;
        }
        colors = _;
        return chart;
    };

    chart.nameValue = function(_) {
        if (!arguments.length) {
            return nameValue;
        }
        nameValue = _;
        return chart;
    };
    chart.numData = function(_) {
        if (!arguments.length) {
            return numData;
        }
        numData = _;
        return chart;
    };

    return chart;
};

module.exports = Legend;});
