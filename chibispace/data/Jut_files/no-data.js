define(function(require, exports, module) {
// an indicator of no data
var d3 = require('d3');


var NoData = function() {

    var height = 400;
    var width = 300;

    function chart(selection) {

        selection.each(function(data) {


            var svg = d3.select(this).selectAll("svg").data([data]);
            var gEnter = svg.enter().append("svg").attr("class", "citrus-charts").append("g");
            gEnter.append('text').attr("class", "noData");


            svg
                .attr('height', height)
                .attr('width', width);

            var txt = svg.select('text.noData');

            txt
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')')
                .style('font-size', '2em')
                .text('No data available for your current selection');

        });
        
    }

    chart.height = function(_) {
        if (!arguments.length) {
            return height;
        }
        height = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) {
            return width;
        }
        width = _;
        return chart;
    };

    return chart;


};


module.exports = NoData;});
