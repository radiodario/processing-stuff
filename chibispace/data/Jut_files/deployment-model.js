define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var Q = require('q');

var Logger = require('logger');
var JutCollection = require('core/jut-collection');

var logger = Logger.get('deployment-model');

var Deployment = Backbone.Model.extend({
    defaults: {
        name: '',
        users: []
    },
    schema: {
        name: { type: 'Text', validators: ['required'] }
    },
    validate: function(attrs, options) {
        if (!attrs.name) {
            return "Full name is required";
        }
    },
    // users field should be sorted
    has_user: function(user_id) {
        var users = this.get('users') || [];
        return (_.indexOf(users, user_id, true) !== -1 ? true : false);
    },
    add_user: function(user_id) {
        var deferred = Q.defer();

        if (this.has_user(user_id)) {
            deferred.resolve();
            return deferred.promise;
        }

        var users = this.get('users') || [];
        var i = _.sortedIndex(users, user_id);
        users.splice(i, 0, user_id);

        this.save({ users: users }, {
            success: function() {
                deferred.resolve();
            },
            error: function() {
                logger.error('error saving model');
                deferred.reject(arguments);
            }
        });

        return deferred.promise;
    },
    remove_user: function(user_id) {
        var deferred = Q.defer();

        var users = this.get('users') || [];
        var i = _.indexOf(users, user_id, true);

        if (i !== -1) {
            users.splice(i, 1);
            this.save({ users: users }, {
                success: function() {
                    deferred.resolve();
                },
                error: function() {
                    logger.error('error saving model');
                    deferred.reject(arguments);
                }
            });
        }
        else {
            deferred.resolve();
        }
        return deferred.promise;
    }
});

var Deployments = JutCollection.extend({
    model: Deployment,
    service : 'config',
    collectionName: 'deployments'
});

module.exports = Deployments;
});
