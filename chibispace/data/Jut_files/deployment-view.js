define(function(require, exports, module) {
var BaseView = require('../../base-view');
var Logger = require('logger');
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var Q = require('q');

var template = require("text!./deployments.html");
var add_edit_html = require("text!./add-edit-form.html");
var delete_html = require("text!./delete-form.html");

var DeploymentCollection = require('../../models/deployment-model');
var UserCollection = require('services/auth/models/account-model');

require('bootstrap_modal');
require('backbone_forms');

var logger = Logger.get('deployment-view');

var DeploymentAddEditView = BaseView.extend({
    events: {
        'click #add-deployment-submit': 'submit',
        'keypress input': 'keypress'
    },
    initialize: function(options) {
        this.success = options.success;
        this.error = options.error;
        this.action = 'Edit';

        if (this.model.isNew()) {
            this.action = 'Add';
        }

        var html = _.template(add_edit_html, {
            action: this.action
        });

        this.setElement($(html)[0]);
    },
    show: function() {
        var self = this;

        this.$el.modal({
            show: false
        });

        this.form = new Backbone.Form({
            model: this.model
        }).render();

        this.$el.find('.modal-body').append(this.form.el);

        this.$el.modal('show');

        this.$el.one('hidden.bs.modal', function() {
            self.remove();
        });

        return this;
    },
    submit: function(event) {
        event.preventDefault();

        var errors = this.form.commit({ validate: true });

        if (! errors) {
            this.success(this.model);
            
            this.$el.modal('hide');
        }
        else if (_.has(errors, '_others')) {
            this.$el.find('.error-message').html(errors._others.toString());
        }
    },
    keypress: function(event) {
        if (event.which === 13) {
            this.submit(event);
        }
    }
});

var DeleteView = BaseView.extend({
    events: {
        'click .deployment-delete': 'submit',
        'keypress input': 'keypress'
    },
    initialize: function(options) {
        this.success = options.success;
        this.error = options.error;

        var html = _.template(delete_html, {
            deploymentname: this.model.get('name')
        });

        this.setElement($(html)[0]);
    },
    show: function() {
        var self = this;

        this.$el.modal({
            show: false
        });

        this.$el.modal('show');

        this.$el.one('hidden.bs.modal', function() {
            self.remove();
        });

        return this;
    },
    submit: function() {
        this.success(this.model);

        this.$el.modal('hide');
    },
    keypress: function(event) {
        if (event.which === 13) {
            this.submit(event);
        }
    }

});

var DeploymentsView = BaseView.extend({
    events: {
        'click #add-deployment-link': 'add_deployment_form',
        'click .deployment-edit': 'edit_deployment_form',
        'click .deployment-delete-confirm': 'delete_deployment_confirm',
        'click .deployment-user-toggle': 'toggle_user'
    },

    initialize: function(options) {
        this.app = options.app;

        return this;
    },
    render: function() {
        var self = this;
        this.collection = new DeploymentCollection();
        this.user_collection = new UserCollection();

        Q.allSettled([
            (function() {
                var d = Q.defer();
                self.user_collection.fetch({
                    success: function() {
                        d.resolve();
                    },
                    error: function() {
                        logger.error('could not fetch users collection', arguments);
                        d.reject(arguments);
                    }
                });
                return d.promise;
            }()),
            (function() {
                var d = Q.defer();
                self.collection.fetch({
                    success: function() {
                        d.resolve();
                    },
                    error: function() {
                        logger.error('could not fetch deployments collection', arguments);
                        d.reject(arguments);
                    }
                });
                return d.promise;
            }())
        ])
        .done(function() {
            self.listenTo(self.collection, 'change', self.populate)
                .listenTo(self.collection, 'destroy', self.populate)
                .listenTo(self.collection, 'sort', self.populate)
                .listenTo(self.collection, 'reset', self.populate)
                .listenTo(self.collection, 'sync', self.populate)
                .listenTo(self.collection, 'remove', self.populate);
            self.populate();
            },
            function() {
                logger.error('error fetching collections', arguments);
            }
        );

        return this;
    },
    populate: function() {
        var self = this;
        $(this.el).html(_.template(template, 
            { 
                collection: this.collection,
                user_id: self.app.auth_status.get('account').id,
                get_username: function(user_id) {
                    var user = self.user_collection.findWhere({ id: user_id });
                    if (user) {
                        return user.get('username');
                    }
                    return '';
                }
            }
        ));
        return this;
    },
    add_deployment_form: function(event) {
        var self = this;

        var form_view = new DeploymentAddEditView({
            model: new this.collection.model(),
            success: function(model) {
                self.collection.add(model);
                
                model.save({}, {
                    error: function() {
                        logger.error('error saving new user', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    },
    edit_deployment_form: function(event) {
        var $target = $(event.target);

        // make sure we don't get an event from the contained icon element
        if (! $target.hasClass('deployment-edit')) {
            $target = $target.parents('.deployment-edit');
        }

        var deployment_id = parseInt($target.parents('[data-deployment-id]').attr('data-deployment-id'), 10);

        var model = this.collection.get(deployment_id);

        var form_view = new DeploymentAddEditView({
            model: model,
            success: function(model) {
                model.save({}, {
                    error: function() {
                        logger.error('error saving edited user', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    },
    delete_deployment_confirm: function(event) {
        var $target = $(event.target);

        // make sure we don't get an event from the contained icon element
        if (! $target.hasClass('deployment-delete-confirm')) {
            $target = $target.parents('.deployment-delete-confirm');
        }

        var deployment_id = parseInt($target.parents('[data-deployment-id]').attr('data-deployment-id'), 10);

        var model = this.collection.get(deployment_id);

        var form_view = new DeleteView({
            model: model,
            success: function(model) {
                model.destroy({}, {
                    error: function() {
                        logger.error('error saving edited deployment', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    },
    toggle_user: function(event) {
        var self = this;
        var $target = $(event.target);

        // make sure we don't get an event from the contained icon element
        if (! $target.hasClass('deployment-user-toggle')) {
            $target = $target.parents('.deployment-user-toggle');
        }

        var deployment_id = parseInt($target.parents('[data-deployment-id]').attr('data-deployment-id'), 10);

        var model = this.collection.get(deployment_id);

        var user_id = self.app.auth_status.get('account').id;

        var user_model = this.user_collection.findWhere({ id: user_id });

        var save_promises;

        if (model.has_user(user_id)) {
            save_promises = Q.allSettled([
                model.remove_user(user_id),
                user_model.remove_deployment(model.id)
            ]);
        }
        else {
            save_promises = Q.allSettled([
                model.add_user(user_id),
                user_model.add_deployment(model.id)
            ]);
        }

        save_promises.done(
            function() {
                self.app.app_view.navView.refresh_auth();
            },
            function(err) {
                logger.error('error saving', err);
            }
        );
    }
}, {
    needs_data_node : false,
    needs_deployment : false
});

module.exports = DeploymentsView;
});
