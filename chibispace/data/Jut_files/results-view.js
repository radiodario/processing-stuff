define(function(require, exports, module) {
var Backbone = require("backbone");
var HitsView = require("./hits-view");
var Sidebar = require("./sidebar");
var TimelineView = require("./timeline-view");
var TimelineNavView = require("./timeline-nav-view");
var template = require("text!./results.html");

var ResultsView = Backbone.View.extend({
    initialize: function(options) {
        this.app = options.app;
        this.search = options.search;
    },

    close: function() {
        this.hits_view.close();
        this.sidebar.close();
        this.timeline_view.close();

        this.remove();
        this.unbind();
    },

    render: function() {
        this.$el.html(template);

        this.hits_view = new HitsView({
            el: this.$el.find("table.hits"),
            model: this.search.hits,
            search: this.search
        } );

        this.sidebar = new Sidebar({
            el: this.$el.find("div.jut-sidebar"),
            search: this.search,
            app: this.app
        } );

        this.timeline_view = new TimelineView({
            el: this.$el.find(".timeline"),
            search: this.search
        } );

        var nav = this.$el.find(".timeline-nav");
        if (nav.length > 0) {
            this.timeline_nav_view = new TimelineNavView({
                el: nav,
                search: this.search
            } );
        }

        var self = this;
        nav.find("a.timeline-back").click(function() {
            self._time_zoom({ start: -1 });
            return false;
        } );

        nav.find("a.timeline-out").click(function() {
            self._time_zoom({ start: -0.5, end: +0.5 });
            return false;
        } );
        
        nav.find("a.timeline-in").click(function() {
            self._time_zoom({ start: +0.25, end: -0.25 });
            return false;
        } );
        
        nav.find("a.timeline-forward").click(function() {
            self._time_zoom({ end: +1 });
            return false;
        } );
        
        var topbars = nav.find("a.timeline-topbars");
        var notopbars = nav.find("a.timeline-notopbars");

        (self.timeline_view.uppers_visible ? topbars : notopbars).hide();
        topbars.click(function() {
            self.timeline_view.toggle_uppers();
            topbars.hide();
            notopbars.show();
            return false;
        } );
        notopbars.click(function() {
            self.timeline_view.toggle_uppers();
            topbars.show();
            notopbars.hide();
            return false;
        } );
    },

    _time_zoom: function(opts) {
        var start = this.search.time_selection.get('start');
        var end = this.search.time_selection.get('end');
        
        // XXX buttons should be disabled if we don't have a time selection?
        if (start === null || end === null) { return; }

        var interval = Math.max(1000, end - start);
        if (opts.start) {
            start += opts.start * interval;
        }
        if (opts.end) {
            end += opts.end * interval;
        }
        
        this.search.time_selection.set({start: start, end: end});
    }
});

module.exports = ResultsView;
});
