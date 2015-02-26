define(function(require, exports, module) {

var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var DelayedOnce = require('applib/utilities/delayed-once');

require('bootstrap_multiselect');

var FacetView = require('./facet-view');
var DashboardModel = require('services/config/models/dashboard-model');

var Facet = function(field, model, sticky) {
    this.field = field;
    this.name = this.pretty_name();
    this.model = model;
    this.score = 0;
    this.view = null;
    this.chosen = []; //chosen || [];
    this.sticky = sticky;
    this.visible = false; // XXX/demmer fixme #CAM-146
    this.model.on("after:change", this.recalculate, this);
};

// Pretty up the display of the field names, stripping out the @
// characters, splitting by _, and capitalizing words
Facet.prototype.pretty_name = function() {
    return _.map(this.field.replace("@", "").split("_"), 
                 function(s) { 
                     if (s === "os") { // XXX
                         return "OS";
                     }
                     return s.substr(0, 1).toUpperCase() + s.substr(1); 
                 }).join(" ");
};

// compute how "interesting" this facet is.  the initial idea is
// to use the notion of entropy (sum of p_i * log(1/p_i) ) where
// p_i is the frequency of the ith facet but to only use the terms
// for the 10 most frequent elements.  this would give a low score (0)
// for a facet with a single element and also give a low score if
// every element is unique.  a facet where we have a few elements
// that appear multiple times should get a reltiavely high score.
// this still seems kind of weak, should work on refining it.
Facet.prototype.recalculate = function() {
    var total = _.reduce(this.model.models,
                         function(c, m) { 
                             return c + m.get("value"); 
                         }, 0);
        
    var components = _.map(_.first(this.model.models, 10),
                           function(m) {
                               if (m.get("id") === "other") {
                                   return 0;
                               }
                               
                               var v = m.get("value");
                               return (v/total) * Math.log(total/v);
                           } );
    var score = 0;
    if (components.length > 0) {
        score = _.reduce(components, function(c, n) { return c+n; });
    }

    this.score = score;
    this.model.trigger("change:score");
};

// widget that looks at all the facets we get back from queries,
// decides which ones look interesting, and shows them in a sidebar.
// this implementation is clunky and inefficient but this is the
// first draft...
var Sidebar = Backbone.View.extend({
    initialize: function(options) {
        this.search = options.search;
        this.facets = [];
        this.show_facets = 5;
        this.redisplay_once = new DelayedOnce(this.redisplay, this);

        this.dashboards = new DashboardModel([], {db_container : options.app.active_deployment});
        this.dashboards.fetch();

        var initial_facets = ["type", "@source_host"];

        for (var i in initial_facets) {
            // XXX get id from enable_field, cancel it in close()
            var model = this.search.enable_field(initial_facets[i]).model;
            this.add_child(initial_facets[i], model, true /* sticky */);
        }

        var self = this;
        this.search.search.get_all_fields()
            .done(function(fields) { self.got_field_list(fields); } );
    },

    close: function() {
        _(this.facets).each(function(f) {
            if (f.view) { f.view.close(); }
        } );
        
        this.remove();
        this.unbind();

        this.redisplay_once.cancel();
    },

    add_child: function(field, model, sticky) {
        for (var i = 0; i < this.facets.length; i++) {
            if (this.facets[i].field === field) { return; }
        }

        this.facets.push(new Facet(field, model, sticky));

        // If a bunch of facets change score and/or are added at once,
        // only call redisplay once when the batch is done.
        this.listenTo(model, "change:score", this.redisplay_once.schedule);

        this.redisplay_once.schedule();
    },

    got_field_list: function(fields) {
        var self = this;
        this.search._hold();
        _(fields).each(function(field) {
            //XXX ignore these...
            if (field === 'timestamp' || field === 'message') { return; }
            
            // XXX/demmer threshold for whether it's "interesting"
            // XXX save id and cancel field later
            var model = self.search.enable_field(field).model;
            self.add_child(field, model, false /* not sticky */);
        } );
        this.search._release();
    },
    
    redisplay: function() {
        if (this.field_selector) {
            this.field_selector.remove();
        }

        this.render_field_select();

        // Sort the facets by score, ensuring that the sticky elements
        // are forced to the top
        this.facets.sort(function(a, b) {
            if (a.sticky && !b.sticky) { 
                return -1; 
            }
            
            if (!a.sticky && b.sticky) { 
                return 1; 
            }
            
            if (b.score > a.score) {
                return 1;

            } else if (a.score > b.score) {
                return -1;
            }

            return 0;
        } );

        var self = this;
        var i;

        function addListener(view, facet) {
            self.listenTo(view, "change:selection", function(v, e) {
                self.drilldown(facet, v, e);
            } );
        }

        // XXX/demmer this whole model is kinda busted
        var num_sticky = _.reduce(this.facets, function(num, f) { 
            if (f.sticky) { num++; }
            return num;
        }, 0);

        this.show_facets = Math.max(this.show_facets, num_sticky);
  
        for (i=0; i<Math.min(this.show_facets, this.facets.length); i++) {
            this.facets[i].visible = true;

            if (this.facets[i].view === null) {
                var field = this.facets[i].field;
                if (field.substr(0, 1) === "@") {
                    field = field.substr(1);
                }
                var div = $('<div class="facet_' + field + '">');
                var facet_view = new FacetView({
                    facet: this.facets[i],
                    search : this.search,
                    model: this.dashboards,
                    el: div
                });

                this.facets[i].view = facet_view;
                
                addListener(facet_view, this.facets[i]);
            }
            this.facets[i].view.$el.css('display', 'inherit');

            // move this one to the end, when we're done we'll
            // have them sorted from most to least interesting
            this.$el.append(this.facets[i].view.el);
        }
        for (; i<this.facets.length; i++) {
            if (this.facets[i].view) {
                this.facets[i].visible = false;
                this.facets[i].view.$el.css('display', 'none');
            }
        }
    },

    render_field_select: function() {
        var select = $('<select multiple="multiple"></select>');
        var facets = _.sortBy(this.facets, "name");
        for (var j = 0; j < facets.length; ++j) {
            var option = $("<option>");
            option.attr("value", facets[j].name);
            option.attr("selected", facets[j].sticky);
            option.text(facets[j].name);
            select.append(option);
        }
           
        this.field_selector = $('<div class="field_selector">');
        this.field_selector.append(select);
        this.$el.append(this.field_selector);
        var self = this;
        select.multiselect({
            buttonWidth: '200px',
            buttonClass: 'btn btn-default',
            buttonText: function(options, select) {
                return 'Sidebar Fields <b class="caret"></b>';
            },
            onChange: function(element, checked) {
                var name = element.attr('value');
                for (var i = 0; i < self.facets.length; ++i) {
                    if (self.facets[i].name === name) {
                        self.facets[i].sticky = checked;
                        break;
                    }
                }
                
                self.redisplay();
            }
        });
    },

    drilldown: function(facet, value, enabled) {
        facet.model.get(value).set({"selected": enabled});
        
        // XXX old dynamic sidebar stuff:
//        if (facet.chosen.length > 0) {
//            if (!facet.sticky) {
//                facet.sticky = true;
//                this.show_facets++;
//            }
//        }
//        else {
//            if (facet.sticky) {
//                facet.sticky = false;
//                this.show_facets--;
//            }
//        }
    },

    render: function() {
    }
} );

module.exports = Sidebar;
});
