define(function(require, exports, module) {
var log_type = 'logstash';
var events_type = 'events';

function init(search) {
    search.add_type(log_type, {
        analyzed_field: 'message',
        indices: '/*',
        base_filters: [ { field: 'record_type', inset: [ 'log' ] } ]
    } );

    search.add_type(events_type, {
        analyzed_field: 'message',
        indices: '/*',
        base_filters: [ { field: 'record_type', inset: [ 'event' ] } ]
    } );
}


module.exports = {
    init: init,
    log_type: log_type,
    events_type: events_type
};
});
