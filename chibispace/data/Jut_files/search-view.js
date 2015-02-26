define(function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var QueryView = require("./query-view");
var ResultsView = require("./results-view");
var ParallelView = require("./parallel-view");
var SunburstView = require("./sunburst-view");
var SearchModel = require('query/search-model');
var log_type = require('query/log-type');
var template = require("text!./search.html");


var SearchBase = Backbone.View.extend({
    all_views: {
        'standard': ResultsView,
        'parallel': ParallelView,
        'sunburst': SunburstView
    },
    
    initialize: function(options) {
        this.app = options.app;
        this.initialized = false;

        this.current_view = null;

        var L = this._parse_fragment(options.fullpath);
        this.mode = L[0];

        var modelopts = {};
        if (L[1].length > 0) {
            modelopts.state_str = L[1];
        }

        var search = this.app.search.get_search(options.search_type);
        this.search = new SearchModel(search, modelopts);

        // XXX this is a pretty strange way to trigger the navigation
        this.listenTo(this.search.hits, 'reset', this.navigate, this);
    },

    _parse_fragment: function(fragment) {
        var statestr = '';
        var mode = 'standard';

        var i = fragment.indexOf('?');
        if (i === -1) {
            this.fragment = fragment;
        } else {
            this.fragment = fragment.substr(0, i);

            var opts = fragment.slice(i+1).split('&');
            for (var oi in opts) {
                var L = opts[oi].split("=");
                var opt = L[0];
                var val = L[1];
                
                if (opt === "q") {
                    statestr = val;
                } else if (opt === "mode") {
                    mode = val;
                } else {
                    // XXX/demmer error log?
                }
            }
        }
        
        return [ mode, statestr ];
    },

    set_fragment: function(fragment) {
        var L = this._parse_fragment(fragment);
        this.search.set_state_str(L[1]);
        if (L[0] !== this.mode) {
            this.show(L[0]);
        }
    },
    
    navigate : function() {
        var opts = [];
        var state = this.search.get_state_str();
        if (state.length > 0) {
            opts.push("q=" + state);
        }
            
        if (this.mode !== "standard") {
            opts.push("mode=" + this.mode);
        }
            
        var target = this.fragment;
        if (opts.length !== 0) {
            target += "?" + opts.join("&");
        }
            
        //self.app.navigate(target, { replace: true });
        this.app.navigate('campfire/' + target);
    },
    
    close: function() {
        if (this.current_view) {
            this.current_view.close();
            this.current_view = null;
        }
        this.remove();
        this.unbind();
    },

    show: function(which) {
        if (this.current_view) {
            this.current_view.close();
        }
        
        var cls = this.all_views[which];

        var el = $("<div>");
        this.$el.append(el);

        this.search._hold();
        this.current_view = new cls({ 
                el: el,
                search: this.search,
                app: this.app
            } );
        this.current_view.render();
        this.search._release();

        this.mode = which;
        _(this.buttons).each(function(value, name) {
            if (name === which) {
                value.addClass("active");
            }
            else {
                value.removeClass("active");
            }
        } );
        this.navigate();
    },
    
    render: function() {
        $(this.el).addClass('col-md-12');
        $(this.el).html(template);

        var query_el = $(this.el).find("form.queryform");
        this.query_view = new QueryView({el: query_el, search: this.search});
        this.query_view.render();

        var self = this;
/*
        Disable as per CAM-104

        this.$el.find("button[name=drill]").on("click", function() {
            self.options.container.drill(self);
        } );
*/

        this.buttons = {};
        _(_(this.all_views).keys()).each(function(vt) {
            var b = self.$el.find("button[name=" + vt + ']');
            self.buttons[vt] = b;
            b.on("click", function(e) {
                e.preventDefault();
                self.show(vt);
            } );
        } );

        this.show(this.mode);
    }
});

var SearchView = SearchBase.extend({
    initialize: function(options) {
        options.search_type = log_type.log_type;
        SearchBase.prototype.initialize.apply(this, [options]);
    }
} );

var EventsView = SearchBase.extend({

    initialize: function(options) {
        options.search_type = log_type.events_type;
        SearchBase.prototype.initialize.apply(this, [options]);
    }
});

module.exports = {
    SearchView: SearchView,
    EventsView: EventsView
};

});
