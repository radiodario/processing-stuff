define(function(require, exports, module) {
var BaseView = require('../../base-view');
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');

var template = require("text!./accounts.html");
var add_edit_html = require("text!./add-edit-form.html");
var delete_html = require("text!./delete-form.html");

var AccountCollection = require('services/auth/models/account-model');

require('bootstrap_modal');
require('backbone_forms');

var AccountAddEditView = BaseView.extend({
    events: {
        'click #add-account-submit': 'submit'
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
    }
});

var DeleteView = BaseView.extend({
    events: {
        'click .account-delete': 'submit'
    },
    initialize: function(options) {
        this.success = options.success;
        this.error = options.error;

        var html = _.template(delete_html, {
            username: this.model.attributes.username
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
    }

});

var AccountsView = BaseView.extend({
    events: {
        'click #add-account-link': 'add_account_form',
        'click .account-edit': 'edit_account_form',
        'click .account-delete-confirm': 'delete_account_confirm'
    },

    initialize: function(options) {
        return this;
    },
    render: function() {
        this.collection = new AccountCollection();

        this.listenTo(this.collection, 'change', this.populate)
            .listenTo(this.collection, 'destroy', this.populate)
            .listenTo(this.collection, 'sort', this.populate)
            .listenTo(this.collection, 'reset', this.populate)
            .listenTo(this.collection, 'sync', this.populate)
            .listenTo(this.collection, 'remove', this.populate);

        this.collection.fetch({
            error: function() {
//                console.log('could not fetch collection', arguments);
            }
        });

        return this;
    },
    populate: function() {
        $(this.el).html(_.template(template, { collection: this.collection.toJSON() }));

        return this;
    },
    add_account_form: function(event) {
        if ($('.modal').length) {
            return;
        }

        var self = this;

        var form_view = new AccountAddEditView({
            model: new this.collection.model(),
            success: function(model) {
                self.collection.add(model);

                model.save({}, {
                    error: function() {
//                        console.log('error saving new account', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    },
    edit_account_form: function(event) {
        if ($('.modal').length) {
            return;
        }

        var $target = $(event.target);

        // make sure we don't get an event from the contained icon element
        if (! $target.hasClass('account-edit')) {
            $target = $target.parents('.account-edit');
        }

        var account_id = parseInt($target.parents('[data-account-id]').attr('data-account-id'), 10);

        var model = this.collection.get(account_id);

        var form_view = new AccountAddEditView({
            model: model,
            success: function(model) {
                model.save({}, {
                    error: function() {
//                        console.log('error saving edited account', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    },
    delete_account_confirm: function(event) {
        if ($('.modal').length) {
            return;
        }

        var $target = $(event.target);

        // make sure we don't get an event from the contained icon element
        if (! $target.hasClass('account-delete-confirm')) {
            $target = $target.parents('.account-delete-confirm');
        }

        var account_id = parseInt($target.parents('[data-account-id]').attr('data-account-id'), 10);

        var model = this.collection.get(account_id);

        var form_view = new DeleteView({
            model: model,
            success: function(model) {
                model.destroy({}, {
                    error: function() {
//                        console.log('error saving edited account', arguments);
                    }
                });
            }
        });

        $('body').append(form_view.render().el);
        form_view.show();
    }
}, {
    needs_data_node : false,
    needs_deployment : false
});

module.exports = AccountsView;
});
