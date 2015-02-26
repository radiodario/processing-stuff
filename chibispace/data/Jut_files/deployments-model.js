define(function(require, exports, module) {
var Backbone = require('backbone');
var JutCollection = require('core/jut-collection');

var Deployment = Backbone.Model.extend({

});


var Deployments = JutCollection.extend({
    service : 'config',
    model : Deployment,
    collectionName : 'deployments'
}); 

module.exports = Deployments;
});
