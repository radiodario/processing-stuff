define(function(require, exports, module) {
var $ = require('jquery');
var Backbone = require("backbone");

var QueryView = Backbone.View.extend({

    events: {
        "keyup input.jut-query-text" : "query_changed",
        "submit" : 'sendQueryNow'
    },

    timer : null,

    query_changed: function(e) {
        e.preventDefault();

        clearTimeout(this.timer);
        if (e.keyCode === 13) {
            this.sendQuery();
        }
        else {
            var self = this;
            this.timer = setTimeout(function () {
                self.sendQuery();
            }, 250);
        }
    },

    sendQuery : function() {
        var val = $(this.el).find("input.jut-query-text").val();
        this.options.search.prefix.set('term', val.toLowerCase());
    },

    sendQueryNow : function() {
        clearTimeout(this.timer);

        this.sendQuery();
    }
});

module.exports = QueryView;    
});
