define(function(require, exports, module) {

var _ = require('underscore');
var $ = require('jquery');
var Logger = require('logger');
var crossfilter = require('crossfilter');
var facets = require('./facet');
var request_wrapper = require('request-wrapper');

var filter = require('./filter');

var null_es_query = { match_all: [] };

function _build_es_query(query, filters) {
    var q = {
        filtered: {
            query: query
        }
    };

    if (filters.length === 1) {
        q.filtered.filter = filters[0].to_elasticsearch();
    }
    else if (filters.length > 1) {
        var and = { and: [] };
        q.filtered.filter = and;
        _(filters).each(function(filt) {
            and.and.push(filt.to_elasticsearch());
        } );
    }

    return q;
}

// Used internally by Query to track each caller of matches()
function MatchesWaiter(options) {
    this.from = options.from || 0;
    this.size = options.size || 10;

    this.deferred = new $.Deferred();
}

MatchesWaiter.prototype.promise = function() {
    return this.deferred.promise();
};

// Used internally by Search to encapsulate all the parameters and
// callbacks related to an individual query
function Query(searchobj) {
    this.logger = Logger.get('search');
    this.matches_waiters = [];
    this.facets = [];
    this.searchobj = searchobj;
}

Query.prototype.add_matches_waiter = function(waiter) {
    this.matches_waiters.push(waiter);
};

Query.prototype.add_facet = function(facet) {
    this.facets.push(facet);
};

Query.prototype.execute = function(query, filters) {
    this.query = query;
    this.filters = filters;

    if (this.facets.length + this.matches_waiters.length === 0) {
        return;
    }

    var cache = this.searchobj.cache;
    var self = this;
    $.when.apply($, this.searchobj.filters_promises).done(function() {
        if (!self.searchobj.force_remote
            && cache !== null
            && cache.can_satisfy(self.query, self.filters)) {

            self.logger.debug('execute query locally');

            setTimeout(function() {
                cache.execute(self.query, self.filters,
                    self.matches_waiters, self.facets);
            }, 0);
        }
        else {
            self.logger.debug('execute query remotely');
            self._execute_remote();
        }
    });
};


Query.prototype._execute_remote = function() {
    // We do two separate queries -- one with all filters and
    // search terms applied to get actual "hits", and one with
    // just the base search to compute individual facets.
    var self = this;
    function addFacetQuery(base_query) {
        _(self.facets).each(function(facet, i) {
            var facet_json = facet.to_elasticsearch();

            var filters = _(self.filters).filter(function(filt) {
                return (filt.field() !== facet.field());
            } );

            filters = _.map(filters, function(filt) {
                return filt.to_elasticsearch();
            } );

            // XXX query term/prefix

            if (filters.length === 1) {
                facet_json.facet_filter = filters[0];
            }
            else if (filters.length > 1) {
                facet_json.facet_filter = { and: filters };
            }

            base_query.facets['facet' + i] = facet_json;
        } );

        return base_query;
    }

    var didCombineQueries = false;
    var query, query_json;
    if (this.matches_waiters.length > 0) {
        var extent = _(this.matches_waiters).reduce(
            function(extent, waiter) {
                return [
                    Math.min(waiter.from, extent[0]),
                    Math.max(waiter.from + waiter.size, extent[0] + extent[1])
                ];
            }, [0, 500]);

        query = {
            from: extent[0],
            size: extent[1] - extent[0],
            query: _build_es_query(this.query, _.values(this.filters))
        };

        if (this.filters.length === 0) {
            query = addFacetQuery(query);
            didCombineQueries = true;
        }

        query_json = JSON.stringify(query);
        this.logger.debug("executing query", query_json);

        var post = this.searchobj._request({
            method: 'POST',
            path: '/_search',
            data: query_json
        } );

        _(this.matches_waiters).each(function(w) {
            post.done(function(data) {
                // XXX
                var o = {
                    total: data.hits.total,
                    hits: data.hits.hits.slice(w.from, w.from+w.size)
                };
                w.deferred.resolve(o);
            } )
                .fail(function(err) {
                    // elasticsearch gives 404 if we search on a non-existent
                    // index.  since we create indices lazily, just treat this
                    // as an empty result
                    if (err.status === 404) {
                        w.deferred.resolve({ total: 0, hits: [] });
                    }
                    else {
                        w.deferred.reject(err);
                    }
                } );

        } );
    }

    if (this.facets.length > 0 && !didCombineQueries) {
        query = {
            from: 0, size: 0,
            // query: XXX build query from base_search
            facets: {}
        };

        query = addFacetQuery(query);

        query_json = JSON.stringify(query);
        this.logger.debug("executing query", query_json);

        var base_post = this.searchobj._request({
            method: 'POST',
            path: '/_search',
            data: query_json
        } );

        _(this.facets).each(function(f, i) {
            base_post.done(function(data) {
                var facet = data.facets['facet'+i];

                if (facet.terms) {
                    facet.terms = _(facet.terms).map(function(term) {
                        return {
                            key   : term.term,
                            value : (term.mean !== undefined) ? term.mean : term.count
                        };
                    });
                } else if (facet.entries) {
                    facet.entries = _(facet.entries).map(function(entry) {
                        return {
                            key   : entry.time,
                            value : (entry.mean !== undefined) ? entry.mean : entry.count
                        };
                    });
                }


                f.deferred.resolve(facet);
            } )
                .fail(function(err) {
                    // XXX put in logic to catch 404 and reutnr an empty facet?
                    f.deferred.reject(err);
                } );

        } );
    }
};

/*
 * The basic object representing a collection of logs to be searched.
 *
 * Fields in `opts` include:
 *
 * - `url`: Specify the location of the elasticsearch web service.
 * - `indices`: a string with a glob-style pattern of elasticsearch
 * indices to be searched, or the empty string to search everything.
 * - `base_filters`: A list of filter objects establishing the base
 * set of records this object is searching within.
 * - `analyzed_field`: Fields on which we might do free-text search.
 * It is an error to do a free-text query (i.e., prefix) on a field
 * that is not declared here when the Search object is created.
 *
 * `mapping_promise` must be a promise object that resolves to the
 * elasticsearch mapping for the index (or indices) this object will search.
 */
function Search(opts, mapping_promise) {
    this.logger = Logger.get('search');
    this.url = opts.url || 'http://localhost:9200';
    this.indices = opts.indices || '';
    this.base_filters = opts.base_filters || [];
    this.error_handler = opts.error_handler || function() {};
    this.analyzed_field = opts.analyzed_field;
    this.force_remote = false;

    this.mapping_promise = mapping_promise;

    var self = this;
    this.mapping_promise.done(function(mapping) {
        self.mapping = mapping;
    });

    this.query = null_es_query;
    this.filters = {};
    this.filters_promises = [];

    this.cache = null;
    this.index_list = null;

    this.holds = 0;
    this.held_query = null;
}

// Clear out any search terms and filters previously added to
// this search
Search.prototype.clear = function() {
    this._invalidate();
    this.query = null_es_query;
    this.filters = {};
    return this;
};

// Ask for logs in which the field `field` begins with `term`.
Search.prototype.query_prefix = function(field, term) {
    this._invalidate();
    this.query = { prefix: {} };
    this.query.prefix[field] = term;
    return this;
};

// Ask for logs in which the field `field` has the exact contents `term`.
Search.prototype.query_term = function(field, term) {
    this._invalidate();
    this.query = { term: {} };
    this.query.term[field] = term;
    return this;
};

// Create or remove a filter on the field named `field`.
// If `what` is null or undefined, all filters on `field` are removed.
//
// XXX the interface described next should/(will?) be changed to
// have `filter_range` and `filter_set` methods instead.
//
// If `what` is an object containing a field `range`, that field
// should contain a two element array `[min, max]` specifying that
// only records for which the value of `field` falls between `min`
// and `max` match this filter.  For example, this filter matches all
// records for which the field `size` is in the range 10-20:
//     search.filter('size', { range: [ 10, 20 ] } );
//
// If `what` is an object containing a field `inset`, that field
// should contain an array representing a set of values to check the
// value of `field` against -- records for which the value is a member
// of this set match the filter.  For example, this filter matches all
// records where the field `color` is either `red`, `white`, or `blue`:
//     search.filter('color', { inset: [ 'red', 'white', 'blue' ] } );
//
// If `merge` is true, the new filter is merged with any existing
// filters on `field`, otherwise the new filter replaces the current
// filter.
Search.prototype.filter = function(field, what, merge) {
    this._invalidate();

    if (what === undefined || what === null) {
        delete this.filters[field];
    }
    else if (merge && this.filters.hasOwnProperty(field)) {
        this.filters[field].merge(what);
    }
    else {
        var obj = _.extend(what, { field: field });

        var deferred = $.Deferred();
        this.filters_promises.push(deferred.promise());

        var self = this;
        this.mapping_promise.done(function() {
            try {
                var f = filter.make_filter(obj, self.getFieldType(field));
                self.filters[field] = f;
                deferred.resolve(f);
            }
            catch (err) {
                deferred.reject(err);
            }
        });
    }

    return this;
};

Search.prototype.get_filter = function(field) {
    if (this.filters.hasOwnProperty(field)) {
        return this.filters[field];
    } else {
        return null;
    }
};

// XXX
Search.prototype.filter_from_str = function(s) {
    this._invalidate();

    var obj = filter.obj_from_string(s);

    this.filter(obj.field, obj);

    return obj.field;
};

Search.prototype.getFieldType = function(fieldname) {
    var mapping = _(this.mapping).omit('_default_');

    if (mapping.length > 1) {
        throw new Error('multiple types in mapping!');
    }

    var o = _(mapping).values()[0];

    var L = fieldname.split('.');
    for (var i = 0; i < L.length; i++) {
        if (!o.properties || !o.properties.hasOwnProperty(L[i])) { return 'string'; }
        o = o.properties[L[i]];
    }

    return o.type;
};

// After this method is called, subsequent calls to query_prefix(),
// query_term(), and filter() will not cause a new query to be executed
// until release() is called.  In this way, a batch of filters and
// query terms can be added to a Search object while ensuring that only
// a single query will be executed after they have all been added.
//
// Every call to hold() should always be matched with a corresponding
// call to release()
Search.prototype.hold = function() {
    this.logger.debug("hold: holds=" + this.holds);
    if (this.holds++ === 0) {
        // assert(this.held_query === null);
        this.held_query = new Query(this);
    }

    //assert (this.held_query !== null);
};

// See hold()
Search.prototype.release = function() {
    this.logger.debug("release: holds=" + this.holds);
    if (this.holds === 0) {
        this.logger.warn("releasing when not held!");
        return;
    }

    if (--this.holds > 0) {
        return;
    }

    var q = this.held_query;
    this.held_query = null;

    q.execute(this.query, this.base_filters.concat(_.values(this.filters)));
};

Search.prototype.fetch_index_list = function() {
    var req = this._request({ path: '_aliases' });
    var self = this;
    req.done(function(data) {
        self.index_list = _.keys(data);
    } );
};

// is q2 strictly more specific than q1?
function _query_more_specific(q1, q2) {
    // if q1 is for everything than q2 is more specific
    if (q1.match_all !== undefined) {
        return true;
    }

    // if they're both prefix queries, then q2 must start with
    // exactly the contents of q1
    if (q1.prefix !== undefined && q2.prefix !== undefined
        && q2.prefix.slice(0, q1.prefix.length) === q1.prefix) {
        return true;
    }

    return false;
}

function CachedSearch(query, filters, hits, searchobj) {
    this.query = query;
    this.filters = filters;
    this.searchobj = searchobj;

    this.mapping = null;
    var self = this;
    this.searchobj.mapping_promise.done(function(m) { self.mapping = m; } );

    this.cf = crossfilter(hits);
    this.allDimension = this.cf.dimension(function(d) {
        return d._id;
    });
    this.dimensions = {};
}

CachedSearch.prototype.can_satisfy = function(query, filters) {
    if (! _query_more_specific(this.query, query)) {
        return (false);
    }

    return (_.every(this.filters, function(filter, field) {
        return (filters.hasOwnProperty(field)
                && filters[field].more_specific_than(filter));
    } ) );
};

CachedSearch.prototype._get_dimension = function(fieldname) {
    if (!this.dimensions.hasOwnProperty(fieldname)) {
        var fieldparts = fieldname.split('.');
        var isdate = (this.searchobj.getFieldType(fieldname) === 'date');
        this.dimensions[fieldname] = this.cf.dimension(function(d) {
            var v = d._source;
            for (var i=0; i<fieldparts.length; i++) {
                v = v[fieldparts[i]];
            }
            if (v === undefined) { v = ''; }  /*XXX read mapping for type */

            return isdate ? new Date(v) : v;
        } );
    }
    return (this.dimensions[fieldname]);
};

CachedSearch.prototype.execute = function(query, filters, waiters, facets) {
    if (this.mapping) {
        return this.do_execute(query, filters, waiters, facets);
    }
    else {
        var self = this;
        this.searchobj.mapping_promise.done(function() {
            self.do_execute(query, filters, waiters, facets);
        } );
    }
};

CachedSearch.prototype.do_execute = function(query, filters, waiters, facets) {
    var self = this;
    if (query.match_all !== undefined) {
        // nothing to do
    }
    else if (query.prefix !== undefined) {
        _(query.prefix).each(function(term, field) {
            if (term.length > 0) {
                if (field !== self.searchobj.analyzed_field) {
                    // XXX jsut fall back to remote search?
                    throw new Error('cannot search on non-analyzed field ' + field);
                }
                self._get_dimension('analyzed_' + field, true)
                    .filter(function(v) {
                        return _.any(v.split(' '), function(t) {
                            return (t.slice(0, term.length) === term);
                        } );
                    } );
            }
        } );
    }
    else {
        throw "XXX query type not implemented";
    }

    _(filters).each(function(filt) {
        self._get_dimension(filt.field()).filter(filt.make_crossfilter());
    } );

    if (waiters.length > 0) {
        _(waiters).each(function(w) {
            // XXX
            var all = self.allDimension.top(w.from+w.size);
            var o = {
                total: self.cf.groupAll().value(),
                hits: all.slice(w.from, w.from + w.size)
            };
            w.deferred.resolve(o);
        } );
    }

    _(facets).each(function(facet) {
        // XXX the do_crossfilter() functions construct data
        // structures that look like corresponding elasticsearch
        // api results.  refactor this somehow.
        var dim = self._get_dimension(facet.field());
        var o = facet.do_crossfilter(dim);

        facet.deferred.resolve(o);
    } );

    // clear all our filters
    _(this.dimensions).each(function(d) {
        d.filterAll();
    } );
};

// "Prime" the local cache of search results.
//
// If the set of matching results for this query is "small enough"
// (currently hard-coded to mean there are 100,000 or fewer records),
// fetch all the records and cache them in the browser so that
// subsequent queries can be evaluated locally.
//
// XXX update comments
Search.prototype.prime = function(obj) {
    this.cache = new CachedSearch(obj.query, obj.filters,
                                  obj.results.hits, this);
};

Search.prototype._start_prime = function() {
    var deferred = $.Deferred();

    var query = this.query;
    var filters = this.base_filters.concat(_.values(this.filters));
    var es_query = _build_es_query(query, _.values(filters));

    var req = this._request({
        method: 'POST',
        path: '/_count',
        data: es_query
    } );

    var self = this;
    req.done(function(data) {
        // XXX whats a good threshold
        if (data.count > 100000) {
            self.logger.debug('not grabbing ' + data.count + ' records');
            deferred.resolve(null);
            return;
        }

        self.logger.debug('pre-fetching ' + data.count + ' records');

        self.matches({
            from: 0,
            size: data.count,
            skip_search: true
        }).done(function(result) {
            self.logger.debug("prefetch complete", result);
            var msg;
            if (result.total !== data.count) {
                msg = 'expected total of ' + data.count
                    + ' but got ' + result.total;
                self.logger.error(msg);
                deferred.reject(msg);
                return;
            }
            if (result.total !== result.hits.length) {
                msg = 'expected ' + result.total
                    + ' hits but got ' + result.hits.length;
                self.logger.error(msg);
                deferred.reject(msg);
                return;
            }

            self.logger.debug('grabbed ' + result.hits.length + ' records');
            var obj = {
                query: query,
                filters: filters,
                results: result
            };
            self.prime(obj);
            deferred.resolve(obj);
        } );
    } );

    return deferred.promise();
};

Search.prototype._invalidate = function() {
};

Search.prototype._request = function(options) {
    var method = options.method || 'GET';
    var url = this.url + this.indices + options.path;

    this.logger.debug('_request', url);

    var self = this;

    return request_wrapper.request({
        type: method,
        url: url,
        data: options.data,
        dataType: 'json',
        contentType: 'application/json'
    } )
        .done(function() {
            self.logger.debug("_request", url, "done");
        })
        .fail(function(err) {
            self.logger.error("_request", url, "failure:", err.responseText);
        });
};

// Get a list of records matching the current query terms and filters.
// `options.from` and `options.size` specify exactly which records
// to fetch (e.g., `{ from: 0, size: 10 }` requests the first 10 records).
//
// Returns a promise object which will be resolved with an array
// of matching records.
Search.prototype.matches = function(options) {
    var waiter = new MatchesWaiter(options);

    var q;
    if (options.skip_search) {
        q = new Query(this);
        q.add_matches_waiter(waiter);
        q.execute(null_es_query, this.base_filters);
    }
    else if (this.held_query) {
        this.held_query.add_matches_waiter(waiter);
    }
    else {
        this.logger.debug('executing immediate query');
        q = new Query(this);
        q.add_matches_waiter(waiter);
        q.execute(this.query, this.base_filters.concat(_.values(this.filters)));
    }
    return waiter.promise();
};

// XXX describe
Search.prototype._add_facet = function(facet, skip_search) {
    var q;
    if (skip_search) {
        q = new Query(this);
        q.add_facet(facet);
        q.execute(null_es_query, this.base_filters);
    }
    else if (this.held_query) {
        this.held_query.add_facet(facet);
    }
    else {
        q = new Query(this);
        q.add_facet(facet);
        q.execute(this.query, this.base_filters.concat(_.values(this.filters)));
    }
};

// Get a histogram of the timestamps of records matching the
// current query terms and filters.
//
// `interval` specifies how big each histogram "bucket" should be.
//  It currently must be the string `hour` :-)
//
// Returns a promise object which will be resolved with an array
// of histogram entries.  Each entry is an object with fields `time`
// (the beginning of a time interval) and `count` (a count of the
// number of matching records in the given interval)
//
// XXX the structure of the histogram should be changed to make it
// consistent with the other facet_* methods below...
Search.prototype.facet_datehist = function(field, interval, value_field, skip_search) {
    var facet = new facets.DatehistFacet(this, field, interval, value_field);
    this._add_facet(facet, skip_search);
    return facet.promise();
};

// Get a histogram of the contents of the field `field` in records
// matching the current query terms and filters.
//
// Returns a promise object which will be resolved with an array
// of histogram entries.  Each entry is an object with fields `term`
// (a value that appears in `field`) and `count` (a count of the
// number of matching records in which `field` has the given value).
Search.prototype.facet_terms = function(key_field, value_field, skip_search, numTermsToReturn) {
    var facet = new facets.FieldFacet(this, key_field, value_field, numTermsToReturn);
    this._add_facet(facet, skip_search);
    return facet.promise();
};

function build_field_list(m) {
    var result = [];
    if (m && m.hasOwnProperty('properties')) {
        _(m.properties).each(function(value, name) {
            if (value.type) { result.push(name); }
            else if (value.properties) {
                var children = _.map(build_field_list(value),
                                     function(n) { return name + '.' + n; } );
                result = result.concat(children);
            }
        } );
    }
    return result;
}

// Get a list of all the fields in the current search
//
// Returns a promise object which will be resolved with a list
// of field names.
Search.prototype.get_all_fields = function(skip_search) {
    var deferred = $.Deferred();
    this.mapping_promise.done(function(mapping) {
        var result = [];
        _(mapping).each(function(value, name) {
            if (name === '_default') { return; }
            result = result.concat(build_field_list(value));
        } );
        deferred.resolve(result);
    } );
    return deferred.promise();
};

module.exports = Search;
});
