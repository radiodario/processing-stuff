define(function(require, exports, module) {
var JutModel = require('core/jut-model');
var JutCollection = require('core/jut-collection');
var _ = require('underscore');
var Q = require('q');

var Account = JutModel.extend({
    defaults: {
        full_name: '',
        username: '',
        password: '',
        is_google: false,
        enabled: false
    },
    schema: {
        full_name: { type: 'Text', validators: ['required'] },
        username: { type: 'Text', validators: ['required', 'email'] },
        password: 'Password',
        is_google: 'Checkbox',
        enabled: 'Checkbox'
    },
    validate: function(attrs, options) {
        if (!attrs.full_name) {
            return "Full name is required";
        }
        
        if (!attrs.username) {
            return "Username is required";
        }

        if (!attrs.password && !attrs.is_google) {
            return "The user must have a password set or be a Google user";
        }
    },
    has_deployment: function(deployment_id) {
        var deployments = this.get('deployments') || [];
        return (_.indexOf(deployments, deployment_id, true) !== -1 ? true : false);
    },
    add_deployment: function(deployment_id) {
        var deferred = Q.defer();

        if (this.has_deployment(deployment_id)) {
            deferred.resolve();
            return deferred.promise;
        }

        var deployments = this.get('deployments') || [];
        var i = _.sortedIndex(deployments, deployment_id);
        deployments.splice(i, 0, deployment_id);

        this.save({ deployments: deployments }, {
            success: function() {
                deferred.resolve();
            },
            error: function() {
           //     logger.error('error saving model');
                deferred.reject(arguments);
            }
        });

        return deferred.promise;
    },
    remove_deployment: function(deployment_id) {
        var deferred = Q.defer();

        var deployments = this.get('deployments') || [];
        var i = _.indexOf(deployments, deployment_id, true);

        if (i !== -1) {
            deployments.splice(i, 1);
            this.save({ deployments: deployments }, {
                success: function() {
                    deferred.resolve();
                },
                error: function() {
        //            logger.error('error saving model');
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

var Accounts = JutCollection.extend({
    model: Account,
    service: 'auth',
    collectionName: 'accounts'
});

module.exports = Accounts;
});
