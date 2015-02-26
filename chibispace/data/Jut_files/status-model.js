define(function(require, exports, module) {
var JutModel = require('core/jut-model');

var StatusModel = JutModel.extend({
    service: 'data',
    modelName: '_status',
    
    status: {},

    initialize: function(options) {
        this.app = options.app;
    },

    view_attached: function(options) {
        // For now just fetch the status once the view is
        // attached. May want instead to poll.
        this.fetch();
    }
});

module.exports = StatusModel;
});
