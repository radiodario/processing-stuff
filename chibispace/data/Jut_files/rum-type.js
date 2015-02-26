define(function(require, exports, module) {
var rum_type = 'rum';

function init(search) {
    search.add_type(rum_type, {
        indices: '/*',
        base_filters: [ { field: 'record_type', inset: [ 'rum' ] } ]
    } );
}

module.exports = {
    init: init,
    rum_type: rum_type
};
});
