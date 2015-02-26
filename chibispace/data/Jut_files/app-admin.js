define(function(require, exports, module) {
/* global localStorage */

var Q = require('q');
var Logger = require('logger');
var AppView = require('./app-view');
var $ = require("jquery");
var Environment = require('core/environment');

var AuthStatus = require("./models/auth-status");
var StatusModel = require("./models/status-model");
var SearchMaster = require('query/search-master');
var Deployments = require('services/config/models/deployments-model');

var AppController = require('applib/app-controller');

var AdminApp = AppController.extend({
    initialize: function() {
        this.logger = Logger.get('AdminApp');
    },
    appName: 'admin',

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
            'accounts': function() {
                this.view.showPage('accounts');
            },
            'deployments': function() {
                this.view.showPage('deployments');
            },
            'hosts': function() {
                this.view.showPage('hosts');
            },
            'packages': function() {
                this.view.showPage('packages');
            },
            '*': function() {
                this.view.showPage('accounts');
            }
        }
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
        }
    },

    initialize_deployment : function () {
        var deferred = Q.defer();
        var self = this;

        this.logger.info('Initializing deployments');

        this.deployments = new Deployments();
        this.deployments.fetch({
            success : function () {
                self.logger.info('Fetched deployments');

                if (localStorage.current_deployment) {
                    self.active_deployment = self.deployments.get(localStorage.current_deployment);
                } else {
                    self.active_deployment = self.deployments.at(0);
                }
                deferred.resolve();
            },
            error : function (model, response) {
                self.logger.error('Failed deployments', response);
                self.alert(response);
                deferred.reject();
            }
        });

        return deferred.promise;
    },

    setup_auth_status: function () {
        this.logger.info('Setup AuthStatus');

        this.auth_status = new AuthStatus();
        this.auth_status.fetch();
        this.cluster_status = new StatusModel({app: this});
    }
});

module.exports = AdminApp;
});
