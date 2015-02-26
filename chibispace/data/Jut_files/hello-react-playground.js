define(function(require, exports, module) {
var renderHello = require('./hello-react');
var Backbone = require('backbone');

var AppView = Backbone.View.extend({
    render: function () {
        renderHello(this.el);
    }
});

module.exports = AppView;
});
