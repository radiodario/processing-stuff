define(function(require, exports, module) {
var JutModel = require('core/jut-model');

var AuthStatus = JutModel.extend({

    defaults: {
    },

    service: 'auth',

    modelName: 'status'
});

module.exports = AuthStatus;
});
