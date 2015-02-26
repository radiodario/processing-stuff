define(function(require, exports, module) {
var JutModel = require('core/jut-model');
var JutCollection = require('core/jut-collection');

var Authorization = JutModel.extend({
    defaults: {
        user_id: '0',
        client_id: '',
        client_secret: ''
    }
});

var Authorizations = JutCollection.extend({
    model: Authorization,
    service: 'auth',
    collectionName: 'authorizations'
});

module.exports = Authorizations;
});
