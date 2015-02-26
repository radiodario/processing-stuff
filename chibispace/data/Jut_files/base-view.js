define(function(require, exports, module) {

var Backbone = require('backbone');

// XXX explain
var BaseView = Backbone.View.extend({
    close: function() {
        this.remove();
        this.unbind();
    }
},{
    needs_deployment: true,
    needs_data_node: true
});

module.exports = BaseView;
});
