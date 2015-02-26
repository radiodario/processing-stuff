define(function(require, exports, module) {

var _ = require('underscore');
var Backbone = require('backbone');
var d3 = require('d3');
var SearchModel = require('query/search-model');
var events_type = require('query/log-type').events_type;

var EventSource = function(options) {
    this.model = null;
    this._ready = false;

    var search = options.app.search.get_search(events_type);
    var modelopts = {};
    if (options.query) {
        modelopts.state_str = options.query;
    }
        
    this.model = new SearchModel(search, modelopts);
    this.model.fill_collection();

    this.listenTo(this.model.hits, 'reset', this.update_hits, this);
    this.listenTo(this.model.hits, "change:hits", this.update_hits, this);
};

// Call the given handler when the event source is ready.
EventSource.prototype.ready = function(cb, context) {
    if (this._ready) {
        cb.call(context, this);
    } else {
        this.once('ready', cb, context);
    }
};

_.extend(EventSource.prototype, Backbone.Events);

EventSource.prototype.update_hits = function() {
    this._ready = true;
    this.trigger('ready');
};

function eventSummary(e) {
    var event_type = e._type;
    if (event_type === 'git') {

        // XXX/demmer hack!
        var hash = e._source.hash.substr(0, 7);
        if (e._source['@source_host'] === 'github.com') {
            if (e._source.repository) {
                var repo = e._source.repository;
                var url = 'https://github.com/osprey-labs/' + repo + '/commit/' + hash;
                hash = '<a onClick="window.open(\'' + url + '\');">' + hash + '</a>';
            }
        }
        var username = e._source.username;
        var summary = e._source.summary;
        return hash + " [" + username + "]: " + summary;
    } else {
        throw new Error("XXX handle event type " + event_type);
    }
}

EventSource.prototype.get_event_list = function() { 
    if (!this._ready) { 
        throw new Error("EventSource.get_event_list called when not ready");
    }

    // Coalesce the events into 6 hour intervals
    var interval = 6 * 60 * 60 * 1000;
    if (! this._event_list) {
        var buckets = {};
        _.each(this.model.hits.get("hits"), function(e) {
            var i = new Date(e._source['timestamp']).getTime();
            i -= i % interval;
            
            if (! buckets[i]) {
                buckets[i] = [];
            }

            buckets[i].push(eventSummary(e));
        });
        
        this._event_list = _.map(buckets, function(value, key, list) {
            key = parseInt(key, 10);

            var start = d3.time.format("%b %e %I:%M%p")(new Date(key));
            var end   = d3.time.format("%b %e %I:%M%p")(new Date(key + interval)); 

            var loglink = '/#logs?q=range:timestamp_raw:'
                + key + ':' + (key+interval);
            var datestring = start + '-' + end;
            var title = '<a href="' + loglink + '"><b>' + datestring
                + '</b></a>';
           
            return {key: key,
                    label: value.length, 
                    title: title,
                    content : value.join("<br>")};
        });
    }

    return this._event_list;
};
  
module.exports = EventSource;

});
