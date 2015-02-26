define(function(require, exports, module) {
var _ = require("underscore");
var Backbone = require('backbone');


function copy_filter_obj(o) {
    var r = _.extend({}, o);

    // XXX arrays embedded in the object are just handled by
    // reference, we want a real deep copy (github/stackoverflow/etc
    // are full of discussions about why this is difficult and
    // ambiguous in javascript, yuck).  for now we know these filter
    // objects aren't very deep so this hack will work.
    _(r).each(function(value, name) {
        if (_.isArray(value)) { r[name] = value.slice(0); }
    } );
    
    return r;
}

function Filter(obj, type) {
    this.obj = copy_filter_obj(obj);
    this.type = type;

    this.initialize.apply(this, arguments);
}

Filter.extend = Backbone.Model.extend;

_.extend(Filter.prototype, {
    initialize: function() {},

    field: function() { return this.obj.field; },

    merge : function(obj) {
        if (this.obj.hasOwnProperty('obj')) {
            this.merge_obj(this.obj.obj);
        }
        else {
            this.merge_obj(this.obj);
        }
    },

    to_elasticsearch: function() {
        throw "implement to_elasticsearch in derived class!";
    },

    to_state_str: function() {
        throw "to_state_str() should be called on Filter subclass";
    },

    more_specific_than : function() {
        throw "more_specific_than() should be called on Filter subclass";
    }
});


var RangeFilter = Filter.extend({

    to_elasticsearch: function() {
        var f = {};

        if (this.type === 'date') {
            f[this.obj.field] = {
                gte : new Date(this.obj.range[0]),
                lt  : new Date(this.obj.range[1])
            };
        }
        else {
            f[this.obj.field] = {
                gte : this.obj.range[0],
                lt  : this.obj.range[1]
            };
        }

        return { range : f };
    },

    to_state_str: function() {

        if (this.type === 'date') {
            return 'range:' + this.obj.field
                + ':' + this.obj.range[0].valueOf()
                + ':' + this.obj.range[1].valueOf();
        } else {
            return 'range:' + this.obj.field
                + ':' + this.obj.range[0]
                + ':' + this.obj.range[1];
        }
    },

    more_specific_than: function(filt) {
        if (filt === undefined) {
            return true;
        }
        if (! filt.obj.hasOwnProperty("range")) {
            throw "comparing different filters!";
        }

        return (this.obj.range[0] >= filt.obj.range[0]
                && this.obj.range[1] <= filt.obj.range[1]);
    },

    merge_obj: function(obj) {
        if (this.type === 'date') {
            this.obj.range[0] = new Date(Math.max(this.obj.range[0], obj.range[0]));
            this.obj.range[1] = new Date(Math.min(this.obj.range[1], obj.range[1]));
        } else {
            this.obj.range[0] = Math.max(this.obj.range[0], obj.range[0]);
            this.obj.range[1] = Math.min(this.obj.range[1], obj.range[1]);
        }
    },
    
    make_crossfilter: function() {
        return [ this.obj.range[0], this.obj.range[1] ];
    },

    range: function() { return this.obj.range; }
});

var SetFilter = Filter.extend({

    to_elasticsearch: function() {
        function make_one_match(field, value) {
            var t = {};
            //t[field] = encodeURIComponent(value);
            t[field] = value;
            return { query: { match: t } };
        }

        if (this.obj.inset.length === 0) {
            return make_one_match(this.obj.field, '__bogus__');
        }
        else if (this.obj.inset.length === 1) {
            return make_one_match(this.obj.field, this.obj.inset[0]);
        }
        else {
            var self = this;
            return { or: _.map(this.obj.inset, function(v) {
                return make_one_match(self.obj.field, v);
            } ) };
        }
    },

    to_state_str: function() {
        var encoded = _(this.obj.inset).map(encodeURIComponent);
        return 'set:' + this.obj.field + ':' + encoded.join(':');
    },

    more_specific_than: function(filt) {
        if (filt === undefined) {
            return true;
        }
        if (! filt.obj.hasOwnProperty("inset")) {
            throw "comparing different filters!";
        }
        return (_.difference(this.obj.inset, filt.obj.inset).length === 0);
    },

    merge_obj: function(obj) {
        this.obj.inset = _.union(this.obj.inset, obj.inset);
    },

    make_crossfilter: function() {
        var values = this.obj.inset;
        if (values.length === 1) { return (values[0]); }
        return function(v) { return _.contains(values, v); };
    },

    selected: function() {
        return this.obj.inset;
    }
});

function obj_from_string(str) {
    // parse from state string
    // XXX refactor to move to sub-classes
    var L = str.split(':');

    var obj = {
        field: L[1]
    };

    if (L[0] === 'range') {
        obj.range = [ new Date(parseInt(L[2], 10)), new Date(parseInt(L[3], 10)) ];
    }
    else if (L[0] === 'set') {
        obj.inset = L.slice(2).map(decodeURIComponent);
    } else {
        throw new Error("don't recognize filter");
    }

    return obj;
}

function make_filter(obj, type) {
    if (obj.range !== undefined) {
        return new RangeFilter(obj, type);
    }
    else if (obj.inset !== undefined) {
        return new SetFilter(obj, type);
    }
    else {
        throw new Error('cannot recognize filter');
    }
}

module.exports = {
    make_filter: make_filter,
    obj_from_string: obj_from_string
};

});
