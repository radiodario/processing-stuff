define(function(require, exports, module) {

var _ = require('underscore');
var $ = require('jquery');
var Search = require('./search');
var request_wrapper = require('request-wrapper');
var filter = require('./filter');


// Compare two elasticsearch mappings and determine if they are
// compatible.  m1 may be a subset of m2 (that is, m2 may contain
// fields that are not present in m1) but everything in m1 *must*
// be present in m2 with the same value.
// Disabled for now (PROD-971)
/*
function _compare_mapping(m1, m2) {
    return _(m1).every(function(value, name) {
        if (!m2.hasOwnProperty(name)) { return false; }
        return _.isObject(value)
            ? _compare_mapping(value, m2[name]) : (value === m2[name]);
    } );
}
*/

function SearchType(options, error_handler) {
    if (options.base_filters) {
        options.base_filters = _.map(options.base_filters, function(f) {
            // XXX type arg ugh
            return filter.make_filter(f, 'string');
        } );
    }

    this.options = options;

    this.saved = null;
    this.pending_prime = null;

    this.mapping = null;
    this.fetch_mapping = request_wrapper.request({
        type: 'GET',
        url: options.url + (options.indices || '') + '/_mapping',
        dataType: 'json'
    } );

    var self = this;
    var deferred = $.Deferred();
    this.mapping_promise = deferred.promise();
    this.fetch_mapping.done(function(mappings) {
        // If we're querying on a full index level, we get mappings
        // for each individual index and each type within each index.
        // If we're querying a specific type, we just get the mapping
        // for that type.  To keep everything simple, make the second
        // case look like the first...
        var components = self.options.indices.split('/');
        if (components.length === 3) {
            var _mappings = {};
            _mappings[components[1]] = mappings;
            mappings = _mappings;
        }

        var first_index = null;
        _(mappings).each(function(mapping, index) {
            if (self.mapping) {
                if (mapping && mapping.record) {
                    _.extend(self.mapping.record.properties, mapping.record.properties);
                }
                // disable inconsistent mappings check for now.  This should 
                // be more permanently resolved (PROD 971)
                /*
                if (!_compare_mapping(self.mapping, mapping)) {
                    error_handler('mappings for ' + index + ' and '
                                  + first_index + ' are inconsistent');
                }
                */
            }
            else {
                first_index = index;
                self.mapping = mapping;
            }
        } );

        deferred.resolve(self.mapping);
    } );
    if (error_handler) {
        this.fetch_mapping.fail(function(err) {
            /*
             * Don't complain if mappings aren't present since it's
             * not a problem if there isn't data of every type.
             */
            if (err.status !== 404) {
                error_handler('fetch mapping for ' + options.indices + ' failed: ' +
                              ((err.responseText && (err.responseText !== "")) ?
                               err.responseText : err.statusText));
            }
        } );
    }
}

SearchType.prototype.get_search = function() {
    this.search = new Search(this.options, this.mapping_promise);

    // if we already have saved hits, prime the Search object
    // with them here, go get hits to prime this object (and future ones)
    var self = this;
    if (this.saved) {
        this.search.prime(this.saved);
    }
    else if (! this.pending_prime) {
        var req = this.pending_prime = this.search._start_prime();
        req.done(function(obj) {
            self.saved = obj;
            self.analyzeFields(self.saved.results.hits);
        } );
    }
    else {
        this.pending_prime
            .done(function(obj) { if (obj) { self.search.prime(obj); }  } );
    }

    return this.search;
};

SearchType.prototype.analyzeFields = function(hits) {
    // do a crude aproximation of elasticsearch analysis
    if (this.search.analyzed_field) {
        var srcfield = this.search.analyzed_field;
        var dstfield = 'analyzed_' + srcfield;
        var re = /[-[\]()":\/&=;?_]/g;
        var spacere = /[ ]+/g;
        _(hits).each(function(h) {
            if (h['_source'] && h['_source'][srcfield]) {
                h['_source'][dstfield] = h['_source'][srcfield]
                    .toLowerCase()
                    .replace(re, ' ')
                    .replace(spacere, ' ');
            }
        } );
    }
};

/*
 * This is a placeholder for an object intended to be the single
 * entry point to the "split query" system.  The idea is that a
 * single instance of this object can provide centralized control
 * over local caching of search results.  So, as a user navigates
 * through different parts of the system (i.e., look at some logs,
 * look at a dashboard, back to logs, over to server stats, etc.)
 * each app/view/page/whatever does not have to start from scratch
 * but can use the saved results from a previous remote query.
 * This single object can then implement a centralized policy for
 * retention of these results so we don't end up using too much
 * (or too little!) memory.
 * 
 * XXX describe the api in detail
 */
function SearchMaster(url, error_handler) {
    this.url = url;
    this.error_handler = error_handler;
    this.types = {};
}

/*
 * XXX describe all options
 */
SearchMaster.prototype.add_type = function(name, options) {
    if (this.types.hasOwnProperty(name)) { return; }
    this.types[name] = new SearchType(_.extend( { url: this.url }, options),
                                      this.error_handler);
};

SearchMaster.prototype.get_search = function(type) {
    if (!this.types.hasOwnProperty(type)) {
        throw new Error('unknown search type ' + type);
    }

    return this.types[type].get_search();
};

module.exports = SearchMaster;
});
