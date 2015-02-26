define(function(require, exports, module) {

function model_wrapper(chart, collection, obj) {
    function get_data() {
        return collection.models.map(function(d) {
            return { key: d.get('key'), value: d.get('value') };
        } );
    }

    chart.data(get_data());
    chart.on('click', function(d) {
        var model = collection.findWhere({key: d.key});
        var sel = !model.get('selected');
        chart.selectItem(d, sel);
        model.set('selected', sel);
    } );

    obj.listenTo(collection, 'after:change', function() {
        chart.data(get_data());
        chart.redraw();
    } );

    return chart;
}

module.exports = model_wrapper;
});
