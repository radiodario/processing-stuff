define(function(require, exports, module) {
var _             = require('underscore');
var Backbone      = require('backbone');
var JutCollection = require('core/jut-collection');
var _ = require('underscore');

var Host = Backbone.Model.extend({
    validate : function(attributes, options) {
        if (typeof attributes.hostname !== 'string') {
            return 'hostname must be defined and must be a string';
        }

        if (attributes.services) {
            if (!(attributes.services instanceof Object)) {
                return 'Services must be an object.';
            }
            var error;
            _.each(attributes.services, function (service) {
                if (service.type === undefined) {
                    error = 'Services must have a type';
                } 
                if (service.options === undefined) {
                    error = 'Services must have options';
                }
            });

            if (error) {
                return error;
            }
        }
        return;
    }
});

var Hosts = JutCollection.extend({
    model : Host,
    collectionName : 'hosts'
});

module.exports = Hosts;
});
