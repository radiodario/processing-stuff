define(function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var SearchView = require("./search-view").SearchView;

var SearchContainer = Backbone.View.extend({

    initialize: function(options) {
        this.panes = [];
        this.$el.html('');
        this._make_pane(options);
    },
    
    close: function() {
        _(this.panes).each(function(p) {
            p.view.close();
        } );
        
        this.remove();
        this.unbind();
    },

    _make_pane: function(options) {
        
        // Change due to CAM-104
        //var el = $('<div class="drilldowndiv">');
        var el = $('<div>');
        
        
        // XXX use some nice arrow icons or something

/* 
 Comment out as per CAM-104 

        var nm = options.name || 'search root';
        
        var shbutton = $('<i class="fa fa-chevron-up">');
        el.append(shbutton);

        el.append('<span>' + nm + '</span>');
*/

        var pane = { };

        if (options.drilled) {
            var b = $('<button name="dismiss">&times;</button>');
            el.append(b);
            var self = this;
            b.on("click", function() {
                $(el).remove();
                var i = self.panes.indexOf(pane);
                self.panes.splice(i, 1);
            } );
        }

        var content = $("<div>");
        el.append(content);
        
        pane.view = new SearchView(_.extend(options, {
            el: content,
            container: this
        }));

/*
 Comment out as per CAM-104 

        var shown = true;
        //var shbutton = el.find("button[name=showhide]");
        pane.toggle = function() {
            if (shown) {
                content.hide(250);
                shbutton.removeClass("fa fa-chevron-up");
                shbutton.addClass("fa fa-chevron-down");
                shown = false;
            }
            else {
                content.show(250);
                shbutton.removeClass("fa fa-chevron-down");
                shbutton.addClass("fa fa-chevron-up");
                shown = true;
            }
        };
        shbutton.on("click", pane.toggle);
*/

        this.panes.push(pane);
        this.$el.append(el);
    },

    // XXX navigate should be here
    
    set_fragment: function(fragment) {
        // XXX
        this.panes[0].view.set_fragment(fragment);
    },

    render: function() {
        this.panes[0].view.render();
    },

    drill: function(view) {
        //console.log('drill baby drill!');

        var p = _.findWhere(this.panes, { view: view } );
        p.toggle();

        this._make_pane({
            app: this.options.app,
            fullpath: '',
            name: 'a drilldown',
            drilled: true,
            query: view.qm._build_query()
        } );

        // XXX
        this.panes[this.panes.length-1].view.render();
    }
            
});

module.exports = SearchContainer;
});
