define(function(require, exports, module) {
/**
 * Simple wrapper object to provide an abstraction around accessing
 * the various fields in the log entries.
 */

function get_timestamp(d) {
    if (d._timestamp === undefined) {
        d._timestamp = new Date(d._source["timestamp"]);
    }
    return d._timestamp;
}

var LogRecord = {
    getter : function getter(fld, default_value) {
        if (fld === "timestamp") {
            return get_timestamp;
        }
        else {
            return function(d) {
                return d._source[fld];
            };
        }
    },

    // Statically define getters for the common fields
    get_type        : function(d) { return d._type; },
    get_timestamp   : function(d) { return LogRecord.getter('timestamp')(d); },
    get_source_host : function(d) { return LogRecord.getter('@source_host')(d); },
    get_message     : function(d) { return LogRecord.getter('message')(d); }
};

module.exports = LogRecord;
});
