define(function(require, exports, module) {
var _ = require("underscore");
var $ = require('jquery');
var LogRecord = require('../../models/log-record');
var Backbone = require('backbone');
var Logger = require('logger');

var HitsView = Backbone.View.extend({
    // Load another set when within this many px of the end of the table.
    scrollSensitivity : 300,

    // Cache number of rendered hits to save on DOM traversal.
    numRenderedHits : 0,

    initialize: function(options) {
        this.logger = Logger.get('logs-table');
        this.search = this.options.search;

        this.listenTo(this.model, "reset", this.reset, this);
        this.listenTo(this.model, "change:hits", this.update_table, this);

        this.init_table();

        // Start table with 50 rows.
        //
        // Note : If the initial number of rows is less than the number
        //        required to scroll, the infiniteScrollHandler function
        //        will have to be bound to the $(window).scroll() event
        //        as well. Otherwise, additional rows won't be loaded.
        this.search.fill_collection(50);
        this.update_table();
    },

    close: function() {
        this.remove();
        this.unbind();
    },
        
    init_table : function() {
        this.$hits_container_info = $('.jut-hits-container-info');
        this.$hits_container      = $('.jut-hits-container');
        this.$hits_table          = this.$hits_container.find('table');
        this.$hits_table_body     = this.$hits_table.find('tbody');

        // Set up infinite scroll.
        this.$hits_table.find('tbody').scroll(_.bind(this.infiniteScrollHandler, this));

        // Ensure the last column is no wider than the table.
        $(window).resize(_.bind(this.setFluidColumnSize, this));

        this.bind_hover();
        this.bind_time_click();
    },

    //
    // Render an updated set of hits into the table.
    //
    update_table : function() {
        var total = this.model.get("total");
        var hits  = this.model.get("hits");

        for (var i = this.numRenderedHits; i < hits.length; i++) {
            this.$hits_table_body.append(this.renderHitRow(hits[i], i+1));
        }

        this.numRenderedHits = hits.length;

        this.setFluidColumnSize();

        this.scrollThreshold = this.$hits_table_body[0].scrollHeight
                                - this.$hits_table_body.height()
                                - this.scrollSensitivity;

        // Update counter.
        this.$hits_container_info.html('Showing 1 to '+ this.numRenderedHits +' of '+ total +' entries');
    },

    reset: function() {
        this.$hits_table_body.html('');
        this.numRenderedHits = 0;
    },

    //
    // Expand all table cells when hovering over row.
    //
    bind_hover: function() {
        this.$hits_table.on('mouseenter', 'td', function() {
            $(this).css({"white-space": 'normal'});
        });

        this.$hits_table.on('mouseleave', 'td', function() {
            $(this).css({"white-space": 'nowrap'});
        });
    },

    bind_time_click: function() {
        var self = this;

        this.$hits_table.on('click', 'td.time a', function() {
            var ts = $(this).html();
            var time = new Date(ts);

            self.search.time_selection.set({ start: time, end: time });

            return false;
        });
    },

    renderHitRow : function(hit, index) {
        var re = /(critical|full)/i;

        var message = LogRecord.get_message(hit);

        if (re.test(message)) {
            message = '<p class="text-error">' + message + '</p>';
        }

        var alternatingClass = (index % 2) ? 'odd' : 'even';

        var renderedHit = $('<tr>').addClass('data').addClass(alternatingClass);

        renderedHit.append($('<td/>').addClass('index').html(index));
        renderedHit.append($('<td/>').addClass('time').html(LogRecord.get_timestamp(hit).toLocaleString()));
        renderedHit.append($('<td/>').addClass('type').html(LogRecord.get_type(hit)));
        renderedHit.append($('<td/>').addClass('source_host').html(LogRecord.get_source_host(hit)));
        renderedHit.append($('<td/>').addClass('message').html(message));

        return renderedHit;
    },

    infiniteScrollHandler : function(event) {
        if ($(event.currentTarget).scrollTop() > this.scrollThreshold) {
            var total = this.model.get("total");
            var hits  = this.model.get("hits");

            if (hits.length < total && this.search.fill_target < hits.length + 50) {
                this.search.fill_collection(hits.length + 50);
            }
        }
    },

    setFluidColumnSize : function() {
        this.$hits_table.find('td.message').css('width',
            this.$hits_container.width()
                - this.$hits_table.find('th.message').offset().left
                + this.$hits_container.offset().left
                + 'px');
    }
} );

module.exports = HitsView;
});
