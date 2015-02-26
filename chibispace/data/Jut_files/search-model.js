define(function(require, exports, module) {

var _ = require('underscore');
var Backbone = require('backbone');
var Logger = require('logger');

//XXX
var LogCollection = require('./log-collection');


function Field(name, search) {
    this.name = name;
    this.search = search;
    this.values = new Backbone.Collection();

    this.values.on("change:selected", this.update_selected, this);

    // XXX seems like this might be overkill?
    this.values.on("all", this.sync_from_search, this);
}

Field.prototype.make_filter = function() {
    var selected = _.map(this.values.where({selected: true}), function(m) { return m.get('key'); });
    return (selected.length > 0) ? { inset: selected } : null;
};

Field.prototype.update_selected = function(model, value) {
    this.search.update_filter( {
        field: this.name,
        what: this.make_filter()
    } );
};

Field.prototype._get_selected = function() {
    var filt = this.search.search.filters[this.name];

    // XXX only works for SetFilters...

    return (filt === undefined) ? [] : filt.selected();
};

Field.prototype.sync_from_search = function() {
    var selected = _(this._get_selected());
    this.values.each(function(v) {
        if (v.get('selected') !== undefined) {
            v.set('selected', selected.contains(v.get('key')));
        }
    } );
};

// XXX
Field.prototype.update_from_es = function(facet) {
    var selected = _(this._get_selected());
    var data = _.map(facet.terms, function(e) {
        e.selected = selected.contains(e.key);

        return new Backbone.Model(e);
    } );

    //XXX
    if (facet.other) {
        data.push(new Backbone.Model({
            key: 'other',
            value: facet.other,
            selected: false
        } ));
    }

    this.values.trigger("before:change", data);
    this.values.set(data);
    this.values.trigger("after:change", data);
};



// Perhaps this is confusing but SearchModel isn't an actual
// Backbone model, it is a container for the models and collections
// that comprise the current search parameters (currently a term and
// a collection of filters)
function SearchModel(search, options) {
    this.logger = Logger.get('search-model');

    this.search = search;
    
    this.prefix = new Backbone.Model({ term: '' });
    this.prefix.on('change', this.change_prefix, this);

    this.hits = new LogCollection();
    this.pending_fetch = null;

    this.fields = {};
    this.datehists = [];
    this.term_stats = [];
    this.next_facet_id = 0;

    this.search_changed = false;

    if (options.state_str) {
        this.set_state_str(options.state_str);
    }
}

SearchModel.prototype.get_state_str = function() {
    var els = [];
    
    var t = this.prefix.get('term');
    if (t.length > 0) {
        els.push('t=' + t);
    }


    els = els.concat(_.map(this.search.filters, function(filt) {
        return filt.to_state_str();
    } ) );

    return els.join(',');
};

SearchModel.prototype.set_state_str = function(str) {
    this._hold();

    this.search.clear();
    this.search_changed = true;
    if (str.length > 0) {
        var self = this;
        _.each(str.split(','), function(s) {
            self.search.filter_from_str(s);
        } );
    }


    _(this.fields).each(function(f) {
        f.sync_from_search();
    } );

    _(this.datehists).each(function(dh) {
        dh._sync_filter();
    } );

    this._release(true);
};

SearchModel.prototype.change_prefix = function() {
    this._hold();
    this.search_changed = true;
    this.search.query_prefix('message', this.prefix.get('term'));
    this._release(true);
};

SearchModel.prototype.update_filter = function(obj) {
    var old_filter = this.search.get_filter(obj.field);

    // XXX/demmer handle this for range as well
    if ((obj.what !== null) && obj.what.hasOwnProperty('inset')) {
        if (old_filter === null && obj.what.inset.length === 0) {
            return; /// no filter;
        }
        else if (old_filter !== null) {
            // yuck
            if (_.isEqual({field: obj.field, inset: obj.what.inset}, old_filter.obj)) {
                return;
            }
        }
    }

    this._hold();
    this.search_changed = true;
    this.search.filter(obj.field, obj.what);
    this._release(true);
};

// XXX make a Datehist object like Facet
SearchModel.prototype.enable_datehist = function(field, interval, value_field) {
    var self = this;
    var obj = _(this.datehists).findWhere({
        field: field,
        interval: interval,
        value_field: value_field
    } );
    if (!obj) {
        var id = this.next_facet_id++;
        var filter_model =  new Backbone.Model({ start: null, end: null });
        filter_model.on('change', function() {
            var start = filter_model.get('start');
            var end = filter_model.get('end');
            var range = (start === null || end === null) ? null : { range: [start,end] };
            self._hold();
            self.search_changed = true;
            self.search.filter(field, range);
            self._release(true);
        } );

        obj = {
            field: field,
            interval: interval,
            value_field: value_field,
            count: 0,
            model: new Backbone.Collection(),
            filter_model: filter_model,
            id: 'datehist-' + id
        };

        obj._sync_filter = function() {
            var range = { start: null, end: null };
            var filt = self.search.filters[field];
            if (filt !== undefined) { 
                var r = filt.range();
                range.start = r[0];
                range.end = r[1];
            }
            filter_model.set(range);
        };
        
        this.datehists.push(obj);

        this.search_changed = true;
        if (this.search.holds === 0) {
            this.search.hold();
            this._execute(false);
            this.search.release();
        }
    }
    obj.count++;

    return {
        id: obj.id,
        model: obj.model,
        filter_model: obj.filter_model
    };
};

SearchModel.prototype._cancel_datehist = function(id) {
    for (var i=0; i<this.datehists.length; i++) {
        if (this.datehists[i].id === id) {
            break;
        }
    }
    if (i >= this.datehists.length) {
        throw new Error('cannot find matching date histogram');
    }

    this.datehists[i].count--;
    if (this.datehists[i].count === 0) {
        this.datehists.splice(i, 1);
    }
};

SearchModel.prototype.global_datehist = function(field, interval, value_field) {
    var collection = new Backbone.Collection();
    this.search.facet_datehist(field, interval, value_field, true)
        .done(function(hist) {
            collection.reset(hist.entries);
        } );
    return collection;
};

// XXX unify this with enable_field() ?
SearchModel.prototype.enable_field_stats = function(key_field, value_field) {
    var obj = _(this.term_stats).findWhere({
        key_field: key_field,
        value_field: value_field
    } );
    if (!obj) {
        var id = this.next_facet_id++;
        obj = {
            key_field: key_field,
            value_field: value_field,
            count: 0,
            model: new Backbone.Collection(),
            id: 'fieldstats-' + id
        };
        this.term_stats.push(obj);
        this.search_changed = true;

        if (this.search.holds === 0) {
            this.search.hold();
            this._execute(false);
            this.search.release();
        }
    }
    obj.count++;

    return {
        id: obj.id,
        model: obj.model
    };
};

SearchModel.prototype._cancel_field_stats = function(id) {
    for (var i=0; i<this.term_stats.length; i++) {
        if (this.term_stats[i].id === id) { break; }
    }
    if (i >= this.term_stats.length) {
        throw new Error('cannot find matching term stats entry');
    }

    this.term_stats[i].count--;
    if (this.term_stats[i].count === 0) {
        this.term_stats.splice(i, 1);
    }
};

SearchModel.prototype.enable_field = function(name) {
    if (! this.fields.hasOwnProperty(name)) {
        this.fields[name] = new Field(name, this);
        this.search_changed = true;

        if (this.search.holds === 0) {
            this.search.hold();
            this._execute(false);
            this.search.release();
        }
    }

    return {
        id: 'field-' + name,
        model: this.fields[name].values
    };
};

SearchModel.prototype.cancel = function(id) {
    var L = id.split('-');
    if (L[0] === 'datehist') {
        this._cancel_datehist(id);
    }
    else if (L[0] === 'fieldstats') {
        this._cancel_field_stats(id);
    }
    else if (L[0] === 'field') {
        this.logger.error('cancel field facet!');
    }
    else {
        throw new Error('do not recognize SearchModel id ' + id);
    }
};


SearchModel.prototype._hold = function() {
    this.search.hold();
};

SearchModel.prototype._release = function(reset) {
    var saw_change = this.search_changed;
    this.search_changed = false;

    if (saw_change) {
        this._execute(reset);
    }
    else {
        this.logger.debug('nothing to do in _release');
    }

    this.search.release();
};

SearchModel.prototype._execute = function(reset) {
    var self = this;
    _(this.fields).each(function(field) {
        self.search.facet_terms(field.name)
            .done(function(facet) {
                field.update_from_es(facet);
            } );
    } );

    _(this.datehists).each(function(dh) {
        self.search.facet_datehist(dh.field, dh.interval, dh.value_field)
            .done(function(hist) {
                dh.model.reset(hist.entries);
            } );
    } );

    _(this.term_stats).each(function(ts) {
        self.search.facet_terms(ts.key_field, ts.value_field)
            .done(function(facet) {
                ts.model.reset(facet.terms);
            } );
    } );

    if (reset) {
        this.pending_fetch = this.search.matches({});
        this.pending_fetch.done(function(hits) {
            self.fetch_done(hits, true);
        } );
    }

};

SearchModel.prototype.fill_collection = function(requested) {
    var total = this.hits.get("total");
    var size = this.hits.get("size");

    this.logger.debug("fill", "requested", requested,
                      "total", total, "size", size, 
                      "fill_target", this.fill_target);

    // XXX/demmer fixme
    var max = 1000;
    
    // If the total is undefined then that means this is the
    // first time any request has been made to the server, so
    // pick an arbitrary large number to fetch.
    if (total === undefined) {
        total = max;
    }
        
    if (requested === undefined) {
        requested = total;
    }

    var start = size;
    if (isFinite(this.fill_target)) {
        start = Math.max(this.fill_target);
    }

    // If the requested number is covered by the amount either
    // in the collection already or in the process of being
    // fetched, then we have nothing to do.
    if (requested <= start) {
        this.logger.debug("fill: request already covered");
        return;
    }

    this.fill_target = requested;
    this.fetch(start, requested);
},

SearchModel.prototype.fetch = function(from, to) {
    // limit fetch to 1000
    to = Math.min(to, from + 1000);

    if (this.pending_fetch !== null) {
        return;
    }

    this.pending_fetch = this.search.matches({
        from: from,
        size: to - from
    });

    var self = this;
    this.pending_fetch.done(function(hits) {
        self.fetch_done(hits, false);
    } );
};

SearchModel.prototype.fetch_done = function(hits, reset) {
    this.pending_fetch = null;
    if (reset) {
        this.hits.reset_to(hits);
    }
    else {
        this.hits.append(hits);
    }
    
    var total = this.hits.get("total");
    var size = this.hits.get("size");

    this.logger.debug("fetch done", "total", total, "size", size, 
                      "fill_target", this.fill_target);

    this.fill_target = Math.min(this.fill_target, total);
        
    if (this.fill_target > size) {
        this.fetch(size, this.fill_target);
    }
};


module.exports = SearchModel;
});
