define(function(require, exports, module) {
/*global console:true*/

var Q = require('q');
var Logger = require('logger');
var postal = require('postal');
var Backbone = require('backbone');
var Base = require('core/foundation').Base;
var request_wrapper = require('request-wrapper');
var _ = require('underscore');

var Environment = require('core/environment');
var AuthUtil = require('../utilities/auth-util');
var JutRouter = require('./router');
var JutViewController = require('./app-view-controller');

var CommandManager = require('../commands/command-manager');
var RouterCommandFactory = require('../commands/router-command-factory');

var clientEnvironments = require('./client-environments');


var JutLauncher = Base.extend({
    constructor: function(options) {
        this.options = options || {};

        this.commandManager = new CommandManager();
        this.broadcaster = postal;
        this.jutContext = {}; //Returned with launch so you can expose Objects to window

        this.logger = Logger.get('JutLauncher');
        this.logger.info("Initialized JutLauncher");

        this.clientEnvironment = clientEnvironments[options.client || 'campfire'];
    },
    /**
     * Starts up the Jut instance
     * @returns {{}|*} a map of Objects for external use
     */
    launch: function() {
        var self = this;

        console.time('Launch');

        Q(Environment.load())
            .then(function() {
                self._getAuth()
                    .then(function() {
                        self._setupAppViewController();
                        self._setupRouter();
                        self.exposeObjects();

                        self._registerDefaultApps();
                        return self._startDefaultApp();
                    }, function() {
                        self._authFailed(); //if auth failed, then it reloads the page at the login screen
                    })
                    .then()
                    .done(function() {
                        self._launchComplete();
                    }, function() {
                        self._launchFailed();
                    });
            }, function() {
                this._launchFailed();
            });

        return this.jutContext;
    },
    /**
     * Attaches references to the jutContext so you can access those Objects externally
     * such as through the window context. Useful for debugging.
     * @returns {*}
     */
    exposeObjects: function() {
        this.jutContext.appViewController = this.appViewController;
        this.jutContext.router = this.router;
        this.jutContext.broadcaster = this.broadcaster;
        this.jutContext.commandManager = this.commandManager;
    },

    /**
     * A helper function to call timeEnd on the previous time event and to start a new time event.
     * If you don't pass an event, then it ends the previous event
     * @param event {String} name of an event to be timed
     * @private
     */
    _timeNext: function(event) {
        if (this._currentTimeEvent) {
            console.timeEnd(this._currentTimeEvent);
        }

        if (event) {
            this._currentTimeEvent = event;
            console.time(this._currentTimeEvent);
        }
    },

    _getAuth: function() {
        var self = this;

        this._timeNext('Get credentials');

        return AuthUtil.getToken(this.data_url).then(function(access_token) {
            self.logger.info('Setting the token');
            // automatically set the authorization header for requests to the
            // various Jut servers
            Environment.set('access_token', access_token.token);
            Backbone.ajax = function(options) {
                return request_wrapper.request(options).then(options.success).fail(options.error);
            };
        });
    },
    _authFailed: function(error) {
        this.logger.error('Get token failed', error);
        window.location.replace(Environment.get('auth_url') + '/login');
    },
    _setupAppViewController: function() {
        this._timeNext('Setup app view controller');

        this.appViewController = new JutViewController({
            commandManager: this.commandManager,
            clientEnvironment: this.clientEnvironment
        });
    },
    _setupRouter: function() {
        this._timeNext('Setup router');

        this.router = new JutRouter({
            broadcaster: this.broadcaster,
            viewController: this.appViewController
        });

        this.commandManager.addFactory(new RouterCommandFactory({
            router: this.router
        }));
    },
    _registerDefaultApps: function () {
        _.each(this.clientEnvironment.registerApplications, function (app) {
            this.commandManager.newCommand('registerApplication', { baseRoute: app}).execute();
        }, this);
    },
    _startDefaultApp: function() {
        this._timeNext('Start default app');

        this.router.start();

        if (!window.location.hash) {
            this.router.navigate(this.clientEnvironment.startRoute, {trigger: true});
        }

        this.logger.info('Starting app at', window.location.hash);

        return Q(true);
    },

    _launchComplete: function() {
        this._timeNext();
        console.timeEnd('Launch');
    },
    _launchFailed: function(error) {
        this._timeNext();

        this.logger.error('Launch failed!', error);
        console.timeEnd('Launch');
    }
});

module.exports = JutLauncher;
});
