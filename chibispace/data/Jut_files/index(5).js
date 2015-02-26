define(function(require, exports, module) {

var pie = require('./pie-chart');
var row = require('./row-chart');
var bar = require('./bar-chart');
var line = require('./line-chart');
var map = require('./map');
var legend = require('./legend');
var annotations = require('./annotations');

module.exports = {
    bar: bar,
    row: row,
    pie: pie,
    map: map,
    line: line,
    legend: legend,
    annotations: annotations
};
});
