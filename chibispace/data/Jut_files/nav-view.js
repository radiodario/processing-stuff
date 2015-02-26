define(function(require, exports, module) {
/* global localStorage*/
var _ = require('underscore');
var $ = require('jquery');

var Environment = require('core/environment');
var PageNavItem = require('./page-nav-item');
var DividerNavItem = require('./divider-nav-item');
var BaseView = require('../../base-view');
var Deployments = require('../../models/deployment-model');

var Logger = require('logger');

var template = require('text!./navbar.html');

var UserView = BaseView.extend({

    events: {
        'click .deployment-link': 'change_deployment',
        'click .logout': 'logout'
    },

    initialize: function (options) {
        this.app = options.app;
        this.listenTo(this.model, 'change', this.render);
        this.logger = Logger.get('app-view');
        this.deployment_collection = new Deployments();
        this.nav = options.nav;
    },

    render: function () {
        var self = this;
        var authorized = this.model.get('authorized') === true;
        var account = this.model.get('account');
        this.account = account;

        this.logger.debug('UserView render authorized', authorized, 'user', account);

        if (authorized) {
            this.$el.removeClass('hidden');
            this.$el.find('.username').text(account.username);
            this.$el.find('.fullname').text(account.full_name);

            this.deployment_collection.fetch({
                success: function() {
                    self.render_deployments();
                },
                error: function() {
                    this.logger.error('error fetching deployments', arguments);
                }
            });

        } else {
            this.$el.addClass('hidden');
        }
    },

    render_deployments: function() {
        var self = this;
        var current_deployment_id = localStorage.current_deployment;
        var account_deployment_ids = this.account.deployments || [];
        var deployments = [];

        account_deployment_ids.forEach(function(deployment_id) {
            var deployment = self.deployment_collection.findWhere({ id: deployment_id });
            if (deployment) {
                deployments.push(deployment.toJSON());
            }
        });
        
        deployments.sort(function(a,b) {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });

        this.$el.find('.deployment-link').remove();

        var links = '';
        var link_template = '<li data-deployment-id="<%= id %>" class="deployment-link <%= cls %>"><a href="javascript:void(0);"><%= name %></a></li>';

        deployments.forEach(function(deployment) {
            var cls = cls;

            if (current_deployment_id === deployment.id.toString()) {
                cls = 'current';
            }

            links += _.template(link_template, {
                cls: cls,
                id: deployment.id,
                name: deployment.name
            });
        });
        self.$el.find('.deployments-header').after(links);
    },

    change_deployment: function(event) {
        var self = this;
        var $target = $(event.target);

        // make sure we get the li
        if (! $target.hasClass('deployment-link')) {
            $target = $target.parents('.deployment-link');
        }

        var deployment_id = $target.attr('data-deployment-id').toString();

        localStorage.current_deployment = deployment_id;
        this.app.active_deployment = self.deployment_collection.get(deployment_id);

        // Brute force method of reloading the app, probably a better single page app solution to this
        window.location.reload();
    },

    logout: function(event) {
        // XXX/demmer hacktastic!!
        window.location = Environment.get('auth_url') + '/logout';
        return false;
    }
});

var NavMenuView = BaseView.extend({

    className: 'nav',

    navItems: [],

    initialize: function (opts) {
        this.auth_status = opts.auth_status;
        this.navItems = this._initNavItems(opts.pages);
        this.app = opts.app;
    },

    render: function () {

        var navHtml = this._navHtml();

        var layout = _.template(template, {
            navItems: navHtml
        });
        this.$el.html(layout);

        this.user_view = new UserView({
            model: this.auth_status,
            el: this.$el.find('.user_info'),
            app : this.app
        });
        this.user_view.render();

        var hash = window.location.hash;
        if (hash === '') {
            hash = "#";
        }

        this.$el.find('a.jut-page-nav[href="' + hash + '"]').parent().addClass('active');

    },

    events: {
        'click a.jut-page-nav': '_onPageNavClick'
    },

    _onPageNavClick: function (e) {

        this.$el.find('.active').removeClass('active');
        this.$(e.currentTarget).parent().addClass('active');
    },

    highlight: function (what) {
        this.$('.active').removeClass('active');
        this.$el.find('a.jut-page-nav[href="#campfire/' + what + '"]').parent().addClass('active');
    },

    _navHtml: function () {
        var navItems = [];
        _.each(_.values(this.navItems), _.bind(function (navItem) {

            // page nav item
            if (navItem instanceof PageNavItem) {
                var navItemHtml = this._pageNavHtml(navItem);
                navItems.push(navItemHtml);

                // divider nav item
            } else if (navItem instanceof DividerNavItem) {
                var dividerHtml = this._dividerHtml(navItem);
                navItems.push(dividerHtml);
            }

        }, this));
        return navItems.join('');
    },

    _isPageNav: function (navItem) {
        return navItem.view && navItem.name && navItem.title ? true : false;
    },

    _isDivider: function (navItem) {
        return navItem.divider ? true : false;
    },

    _pageNavHtml: function (navItem) {
        return navItem.template({
            page: navItem
        });
    },

    _dividerHtml: function (navItem) {
        return navItem.template();
    },

    // Initialize app pages given the pages specified.
    // Default pages will be used if pages are not specified
    _initNavItems: function (pages) {
        var items = pages ? pages : this._defaultNavItems();

        var navItems = [];
        _.each(items, _.bind(function (item) {

            if (this._isPageNav(item)) {
                navItems.push(new PageNavItem(item));
            } else if (this._isDivider(item)) {
                navItems.push(new DividerNavItem(item));
            }
        }, this));

        return navItems;
    },

    _defaultNavItems: function () {
        var navItems = [];

        // rum page
        navItems.push({
            name: 'rum',
            title: 'RUM',
            view: require('../rum/rum-view')
        });

        // servers page
        navItems.push({
            name: 'stats',
            title: 'Servers',
            view: require('../stats/stats-view')
        });

        // logs page
        navItems.push({
            name: 'logs',
            title: 'Logs',
            view: require('../search/search-container')
        });

        // events page
        navItems.push({
            name: 'events',
            title: 'Events',
            view: require('../search/search-view').EventsView
        });

        // dashboard page
        navItems.push({
            name: 'dashboards',
            title: 'Dashboards',
            view: require('../dashboards/dashboard-view')
        });

        // divider
        navItems.push({
            type: 'divider'
        });
        
        return navItems;
    }

});

module.exports = NavMenuView;
});
