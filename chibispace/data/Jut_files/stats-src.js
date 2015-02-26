define(function(require, exports, module) {

var requestWrapper = require('request-wrapper');
var _ = require('underscore');
var d3 = require('d3');

function get_stat_src(url, layer) {
    var data = [];
    var chart = null;
    var scale = d3.time.scale();
    // XXX this should be handled by the server model
    requestWrapper.request({
        type: 'GET',
        url: url,
        dataType: 'json'
    }).done(function(result) {
        data = _.map(result[0].dps, function(v, k) {
            // opentsdb values in miliseconds... convert to seconds for d3
            return { key: parseInt(k, 10) * 1000, value: v };
        } );
        if (chart) {
            chart.data(data, layer);
            chart.redraw();
        }
    });
    
    return function(_chart) {
        chart = _chart;
        chart
            .x(scale)
            .data(data, layer);
    };
}

module.exports = get_stat_src;

});
