define(function(require, exports, module) {

var Backbone = require('backbone');
var _ = require('underscore');
var d3 = require('d3');
var SearchModel = require('query/search-model');
var rum_type = require('./rum-type').rum_type;

var country_map = {
    US: 'USA',
    CA: 'CAN',
    FR: 'FRA',
    IN: 'IND',
    IE: 'IRL',
    NZ: 'NZL',
    GB: 'GBR',
    CN: 'CHN',
    DE: 'DEU',
    IT: 'ITA',
    AU: 'AUS',
    BR: 'BRA',
    JP: 'JPN'
};

function RumSource(options) {
    this.url = options.url;
    this.interactive = options.interactive;

    var search = options.app.search.get_search(rum_type);
    this.model = new SearchModel(search, {});
}

_.extend(RumSource.prototype, Backbone.Events);

RumSource.prototype.hold = function() {
    this.model._hold();
};
RumSource.prototype.release = function() {
    return this.model._release();
};

// format a small time interval (i.e., something less than an hour)
function format_small_time(t) {
    var minutes = Math.floor(t/60000);
    var seconds = Math.floor((t/1000)%60);
    var s = minutes.toString() + ':'
        + (seconds < 10 ? '0' : '') + seconds.toString();
    if (t < 10000) {
        var hs = Math.floor((t % 1000) / 10).toString();
        while (hs.length < 2) { hs = '0' + hs; }
        s += '.' + hs;
    }
    return s;
}

RumSource.prototype._get_model = function(type, what) {
    if (type === 'timeline') {
        if (what === 'visits') {
            return this.model.enable_datehist('start_time', 'hour');
        }
        else if (what === 'loadtime') {
            return this.model.enable_datehist('start_time', 'hour',
                                              'full_load_time');
        }
        else if (what === 'visittime') {
            return this.model.enable_datehist('start_time', 'hour',
                                              'visit_time');
        }
        else {
            throw new Error('do not know timeline type ' + what);
        }
    }
    else if (type === 'pie') {
        if (what === 'device') {
            return this.model.enable_field('browser.type');
        }
        else if (what === 'browser') {
            return this.model.enable_field('browser.name');
        }
        else {
            throw new Error('do not know pie type ' + what);
        }
    }
    else if (type === 'bar') {
        var pair = what.split('-');
        if (pair.length !== 2) {
            throw new Error('do not recognize bar type ' + type);
        }

        var key_field, value_field;
        // XXX domain?

        if (pair[0] === 'visits') {
            // leave value_field undefined
        }
        else if (pair[0] === 'loadtime') {
            value_field = 'full_load_time';
        }
        else if (pair[0] === 'visittime') {
            value_field = 'visit_time';
        }
        else {
            throw new Error('do not recognize bar type ' + pair[0]);
        }
        
        if (pair[1] === 'device') {
            key_field = 'browser.type';
        }
        else if (pair[1] === 'browser') {
            key_field = 'browser.name';
        }
        else {
            throw new Error('do not recognize bar type ' + pair[1]);
        }
        return this.model.enable_field_stats(key_field, value_field);
    }
    else if (type === 'map') {
        //XXX look at what param?
        return this.model.enable_field('geo.country');
    }
    else {
        throw new Error('do not know rum chart type ' + type);
    }
    
    return null;
};

RumSource.prototype.get_source = function(type, what, layer) {
    var searchinfo = null;
    var chart = null;
    var parent = this;

    function set_data() {
        if (!searchinfo) { return; }
        var data = searchinfo.model.models.map(function(d) {
            return {
                key: d.get('key'),
                value: d.get('value')
            };
        } );

        /* XXX HACKS!
         * fix for the first is to set domain from within chart */
        if (type === 'bar') {
            chart.x().domain(_(data).pluck('key'));
        }
        else if (type === 'map') {
            _(data).each(function(d) {
                d.key = d.key ? country_map[d.key.toUpperCase()] : null;
            } );
        }

        chart.data(data, layer);
    }

    function model_callback() {
        set_data();
        chart.redraw();
    }

    searchinfo = this._get_model(type, what);

    var ret = function(ch) {
        chart = ch;

        if (ret.hasOwnProperty('setup_select')) {
            ret.setup_select();
        }

        if (type === 'timeline') {
            chart.x(d3.time.scale());
            if (false /*XXX get units */) {
                chart.yAxis().tickFormat(format_small_time);
            }
        }
        else if (type === 'bar') {
            chart.x(d3.scale.ordinal());
        }
        
        set_data(chart);

        if (!searchinfo) { return; }
        
        /* XXX use listenTo on the view */
        searchinfo.model.on('after:change reset', model_callback);
    };

    ret.close = function() {
        searchinfo.model.off('after:change reset', model_callback);
        parent.model.cancel(searchinfo.id);
    };

    if (this.interactive) {
        if (type === 'timeline') {
            ret.setup_select = function() {
                chart.onselect(function(extent) {
                    var start, end;
                    if (extent === null) {
                        start = end = null;
                    }
                    else {
                        start = extent[0];
                        end = extent[1];
                    }

                    searchinfo.filter_model.set({
                        start: start, end: end
                    } );
                } );
            };
        }
        else {
            ret.setup_select = function() {
                chart.on('click', function(d) {
                    if (d === null) {
                        ret.chart.clearSelectedItems();

                        searchinfo.model.each(function(i) {
                            i.set('selected', false);
                        } );
                    }
                    else {
                        chart.toggleSelected(d);

                        var i = (type === 'map')
                            ? searchinfo.model.find(function(e) {
                                return country_map[e.get('key')] === d.key;
                            } )
                            : searchinfo.model.findWhere({key: d.key});
                        i.set('selected', !i.get('selected'));
                    }
                } );
            };
        }
    }

    return ret;
};

module.exports = RumSource;
});
