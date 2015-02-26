define(function(require, exports, module) {

var log_type = require('query/log-type');
var SearchModel = require('query/search-model');

function make_dashboard_src(app, source, view, layer) {
    var data = [];
    var chart = null;
    
    var search = app.search.get_search(log_type.log_type);

    var modelopts = {};
    if (source.query) {
        modelopts.state_str = source.query;
    }
    var smodel = new SearchModel(search, modelopts);

    smodel._hold();
    var model = smodel.enable_field(source.field).model;
    smodel._release();

    view.listenTo(model, 'after:change', function() {
        data = model.toJSON();
        
        if (chart) {
            chart.data(data, layer);
            chart.redraw();
        }
    } );
    
    return function(_chart) {
        chart = _chart;
        chart.data(data, layer);
    };
}

module.exports = make_dashboard_src;
});
