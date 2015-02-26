define(function(require, exports, module) {

// The term *facet* is borrowed from Lucene/Elasticsearch -- it
// refers to a statistic derived from a query (as opposed to the
// actual objects that match the query).  Facets that we use in
// campfire include a histogram of log messages grouped by date/time
// which is rendered in the timeline at the top of the main search
// page and histograms grouped by arbitrary fields (e.g., http
// response code) which are displayed in the sidebar.
//
// The Search module presents a uniform interface for computing
// facets that can be mapped to [the elasticsearch facets api](http://www.elasticsearch.org/guide/reference/api/search/facets/)
// for efficient remote computation or to
// [crossfilter](http://square.github.io/crossfilter/) for local
// computation when logs are cached in the browser.

var _ = require("underscore");
var $ = require("jquery");
var Backbone = require('backbone');

// The Facet class is used internally by the Search module -- it is
// the base class for object that represent the different types of
// facets we support.  It is never instantiated directly, it just
// provides some useful methods that are used by all derived classes.
function Facet() {
    this.deferred = new $.Deferred();
    this.initialize.apply(this, arguments);
}

Facet.extend = Backbone.Model.extend;

_.extend(Facet.prototype, {
    initialize: function() {},

    // Return a [promise](http://wiki.commonjs.org/wiki/Promises/A)
    // that will be resolved when this facet is computed with the
    // computed facet as a parameter.
    promise: function() {
        return this.deferred.promise();
    },

    // Return the name of the field from log messages on which this
    // facet is computed.
    field: function() { return null; },

    // Construct an elasticsearch facet object suitable for being
    // embedded into the `facets` element of an elasticsearch query.
    to_elasticsearch: function() {
        throw "implement to_elasticsearch in derived class!";
    },

    // Use the crossfilter
    // [Dimension object](https://github.com/square/crossfilter/wiki/API-Reference#dimension) named `dimension` to compute this facet and return
    // the computed facet.
    do_crossfilter: function(dimension) {
        throw "implement do_crossfilter in derived class!";
    },

    // Shared functions for crossfilter reduce.
    reduceAdd : function(p, v) {
        var val = v._source[this.value_field];
        if (val !== undefined) {
            ++p.count; p.total += val;
        }

        return p;
    },

    reduceRemove : function(p, v) {
        var val = v._source[this.value_field];
        if (val !== undefined) {
            --p.count; p.total -= val;
        }

        return p;
    },

    reduceInitial : function() {
        return {
            count: 0,
            total: 0
        };
    },

    orderValue : function(p) {
        return p.count ? (p.total/p.count) : 0;
    }
} );

// These cached groups are never removed. In the future, when
// facets can be disabled, it will be a good idea to remove unused
// groups. The best option may be to track which groups haven't
// been used recently and reclaim old ones when the total number
// of groups gets too large.
Facet.cachedGroups = [];


var DatehistFacet = Facet.extend({
    initialize: function(search, field, interval, value_field) {
        this.search = search;
        this.key_field = field;
        this.value_field = value_field;
        this.interval = interval;
    },

    field: function() { return this.key_field; },

    to_elasticsearch: function() {
        var f = {
            date_histogram: {
                interval: this.interval
            }
        };
        if (this.value_field) {
            f.date_histogram.key_field = this.key_field;
            f.date_histogram.value_field = this.value_field;
        }
        else {
            f.date_histogram.field = this.key_field;
        }
        return f;
    },

    do_crossfilter: function(dimension) {
        var interval = this._interval_msec();

        var cacheValue = {
            dimension: dimension,
            value_field: this.value_field,
            group_interval: interval
        };

        var cachedGroup = _(DatehistFacet.cachedGroups).findWhere(cacheValue);

        var group;
        var self = this;
        if (!cachedGroup) {
            group = dimension.group(function(tm) {
                return Math.floor(tm / interval);
            });

            cacheValue.group = group;

            DatehistFacet.cachedGroups.push(cacheValue);

            if (this.value_field) {
                group.reduce(_.bind(this.reduceAdd, this),
                             _.bind(this.reduceRemove, this),
                             this.reduceInitial)
                    .order(this.orderValue);
            }
        } else {
            group = cachedGroup.group;
        }

        var o = { entries: _.map(group.top(Infinity), function(record) {
            var r = {
                key : record.key * interval // XXX fragile. see PROD-409
            };

            r.value = (self.value_field)
                ? (record.value.count)
                    ? (record.value.total / record.value.count)
                    : 0
                : record.value;

            return r;
        } ) };

        // XXX should this be here?
        o.entries.sort(function(a, b) { return a.key - b.key; } );

        return o;
    },

    _interval_msec: function() {
        if (this.interval === 'hour') {
            return 60 * 60 * 1000;
        }

        throw "XXX implement different datehist intervals!";
    }
});

var FieldFacet = Facet.extend({
    initialize: function(search, key_field, value_field, numTermsToReturn) {
        this.search = search;
        this.key_field = key_field;
        this.value_field = value_field;
        this.numTermsToReturn = numTermsToReturn || 10;
    },

    field: function() {
        return this.key_field;
    },

    to_elasticsearch: function() {
        if (this.value_field) {
            return {
                terms_stats: {
                    //all_terms: true,
                    key_field: this.key_field,
                    value_field: this.value_field
                }
            };
        }
        else {
            return {
                terms: {
                    all_terms: true,
                    field: this.key_field,
                    size : this.numTermsToReturn
                }
            };
        }
    },

    do_crossfilter: function(dimension) {
        var cacheValue = {
            dimension : dimension,
            value_field: this.value_field
        };

        var cachedGroup = _(FieldFacet.cachedGroups).findWhere(cacheValue);
        if (cachedGroup && cachedGroup.group_interval) {
            // XXX
            throw new Error('cannot combine datehist and field facets');
        }

        var group;
        var self = this;
        if (!cachedGroup) {
            group = dimension.group();

            cacheValue.group = group;

            FieldFacet.cachedGroups.push(cacheValue);

            if (this.value_field) {
                group.reduce(_.bind(this.reduceAdd, this),
                             _.bind(this.reduceRemove, this),
                             this.reduceInitial)
                    .order(this.orderValue);
            } else {
                group.reduceCount();
            }
        } else {
            group = cachedGroup.group;
        }

        var o = { terms: _.map(group.top(this.numTermsToReturn), function(record) {
                var r = {
                    key : record.key
                };

                r.value = (self.value_field)
                    ? (record.value.count)
                        ? (record.value.total / record.value.count)
                        : 0
                    : record.value;

                return r;
            })
        };
        // XXX add record for "other"

        return o;
    }
} );

module.exports = {
    DatehistFacet: DatehistFacet,
    FieldFacet: FieldFacet
};

});
