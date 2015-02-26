define(function(require, exports, module) {
/* global localStorage */

var Logger = require('logger');
var AppView = require('./app-view');
var $ = require("jquery");
var Environment = require('core/environment');

var AuthStatus = require("./models/auth-status");
var StatusModel = require("./models/status-model");
var SearchMaster = require('query/search-master');
var Deployments = require('services/config/models/deployments-model');
var init_logs = require('query/log-type').init;
var init_rum = require('./screens/rum/rum-type').init;

var AppController = require('applib/app-controller');

var CampfireApp = AppController.extend({
    initialize: function() {
        this.logger = Logger.get('CampfireApp');
    },
    appName: 'campfire',

    onWakeUp: function() {
        var self = this;

        return this.initialize_deployment()
            .then(function () {
                self.setup_active_deployments();
                self.setup_auth_status();

                return true;
            });
    },
    onActivate: function() {
        this.view = new AppView({
            app: this,
            pages: this.pages
        });
        this.view.render();

        this.appSection.html(this.view.el);

        return true;
    },
    onSleep: function() {
        this.deployments = null;
        this.active_deployment = null;
        this.data_url = null;
        this.search = null;
        this.cluster_status = null;

        return true;
    },
    routeConfig: {
        routes: {
            'dashboards': function() {
                this.view.showPage('dashboards');
            },
            'rum': function() {
                this.view.showPage('rum');
            },
            'search': function() {
                this.view.showPage('search');
            },
            'stats': function() {
                this.view.showPage('stats');
            },
            'status': function() {
                this.view.showPage('status');
            },
            'logs': function() {
                this.view.showPage('logs');
            },
            'logs?*query': function(query) {
                this.view.showPage('logs?' + query);
            },
            'events': function() {
                this.view.showPage('events');
            },
            'events?*query': function(query) {
                this.view.showPage('events?' + query);
            },
            '*': function() {
                this.view.showPage('home');
            }
        }
    },

    navigate: function() {
        this.router.navigate.apply(this.router, arguments);
    },

    alert: function(msg) {
        var alert = $('<div class="alert alert-danger alert-dismissable">');
        alert.append('<button type="button" class="close" data-dismiss="alert">&times;</button>');
        alert.append('<p>' + msg + '</p>');

        $('#jut-page-container').prepend(alert);
    },

    setup_active_deployments: function () {
        var self = this;

        if (this.active_deployment && this.active_deployment.get('dataNodes') && this.active_deployment.get('dataNodes')[0]) {
            this.data_url = this.active_deployment.get('dataNodes')[0];
            Environment.set('data_url', this.data_url);
            this.search = new SearchMaster(
                this.data_url + '/es',
                function(msg) {
                    self.logger.error('Active deployments: SearchMaster', msg);
                    self.alert(msg);
                }
            );

            init_logs(this.search);
            init_rum(this.search);
        }
    },

    initialize_deployment : function () {
        var self = this;

        this.logger.info('Initializing deployments');

        this.deployments = new Deployments();
        return this.deployments.fetchThen()
            .then(function () {
                self.logger.info('Fetched deployments');

                if (localStorage.current_deployment) {
                    self.active_deployment = self.deployments.get(localStorage.current_deployment);
                } else {
                    self.active_deployment = self.deployments.at(0);
                }
            })
            .fail(function(err) {
                self.logger.error('Failed to fetch deployments', err);
                self.alert(err.resp);
                throw err;
            });
    },

    setup_auth_status: function () {
        this.logger.info('Setup AuthStatus');

        this.auth_status = new AuthStatus();
        this.auth_status.fetch();
        this.cluster_status = new StatusModel({app: this});
    }
});

module.exports = CampfireApp;
});
