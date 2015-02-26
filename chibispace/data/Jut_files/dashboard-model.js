define(function(require, exports, module) {
var JutCollection = require('core/jut-collection');
var Backbone = require('backbone');

var Dashboard = Backbone.Model.extend({
    
    defaults : {
        graphs : [],
        description : '',
        owner : ''
    },

    addGraph : function (graph) {
        var graphs = this.get('graphs');
        graphs.push(graph);
        this.set('graphs', graphs);
        this.save();
    }
});


var Dashboards = JutCollection.extend({

    model : Dashboard,
    collectionName : 'dashboards',
    service: 'config'

});


module.exports = Dashboards;
});
