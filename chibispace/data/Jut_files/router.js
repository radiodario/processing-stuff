define(function(require, exports, module) {
var Backbone = require("backbone");
var _ = require('underscore');
var Q = require('q');
var AppRegistry = require('../app-registry');

var Logger = require('logger');

var JutRouter = Backbone.Router.extend({
    initialize: function(options) {
        this.broadcaster = options.broadcaster;
        this.viewController = options.viewController;

        this.logger = Logger.get('JutRouter');
        this.registered = {};
        this.registry = AppRegistry;
    },
    /**
     * Register an application (as a reference) for a given baseRoute.
     * When that baseRoute is hit, the app will be initialized and additional routes will be attached.
     * Once routes are attached, then the original route will be navigated to.
     * @param baseRoute {String} A string identifying the base route for this application
     * @param reference {String} A reference for requirejs to inject the app from
     */
    register: function(baseRoute, reference) {
        var self = this;
        var catchAllRoute = [baseRoute, '/*route'].join('');

        if (!reference) {
            reference = ['../apps/',baseRoute,'/app-',baseRoute].join('');
            this.logger.info('No reference provided, assuming the path is ', reference);
        } else if (!baseRoute) {
            throw new Error('Missing application baseRoute');
        } else if (this.registered[baseRoute]) {
            throw new Error('Route is already registered to an application: ' + baseRoute);
        }

        this.registered[baseRoute] = reference;

        //setup the catchAllRoute
        this.route(catchAllRoute, catchAllRoute, function routeToAppFromCatchAll(route) {
            var desiredRoute = [baseRoute, '/', route].join('');

            self._initApplication(baseRoute, desiredRoute).done(function() {
                /* navigate away now that we've attached routes,
                 * so we can then re-route to the original route and capture that event again */
                self.navigate('AppLoading', {trigger: true, replace: true});
                self.navigate(desiredRoute, {trigger: true, replace: true});
            });
        });
    },
    /**
     * Register an application (as a reference) for a given baseRoute.
     * This will immediately initialize and attach the routes for this application.
     * @param baseRoute {String} A string identifying the base route for this application
     * @param reference {String} A reference for requirejs to inject the app from
     */
    registerAndInit: function(baseRoute, reference) {
        var self = this;

        this.register(baseRoute, reference);
        this._initApplication(baseRoute).done(null, function(error) {
            self.logger.error('App init error.', error);
        });
    },
    start: function() {
        Backbone.history.start();
    },
    
    _attachRoutes: function(baseRoute, routeConfig, app) {
        var self = this;

        /* this is copied and converted from Backbone._bindRoutes() because the order of route binding matters
         * and we need to match what backbone does which is to reverse the order of the map */
        var routes = _.result(routeConfig, 'routes');
        var routeNames = _.keys(routes);
        var route, fullRoute, handler;

        while ((route = routeNames.pop())) {
            fullRoute = [baseRoute, '/', route].join('');
            handler = routes[route];

            this.route(
                fullRoute,
                fullRoute,
                //function returns a function locked to this specific handler
                (function generateSpecificHandler(handler) {
                    //this function gets called when a route event triggers for this app
                    return function routeToApp() {
                        var routeArguments = arguments;

                        self._load(app).done(function() {
                            handler.apply(app, routeArguments);
                        });
                    };
                })(handler)
            );
        }
    },

    /**
     * Instantiates the app for the given reference and attaches its routes so it can handle route events
     * @param baseRoute {String} The base route for the app
     * @param desiredRoute {String} Route that caused the initApp to occur and is the desired route to display
     * @private
     */
    _initApplication: function(baseRoute, desiredRoute) {
        var self = this;
        var deferred = Q.defer();
        var reference = this.registered[baseRoute];

        if (!_.isString(reference)) {
            deferred.reject('Unhandled route ' + desiredRoute + '. Application is already initialized, but route was not caught by the app.');
            return deferred.promise;
        }

        this.registry.get(baseRoute).done(function(App) {
            var app = new App({
                broadcaster: self.broadcaster,
                router: self
            });

            self.registered[baseRoute] = app;

            self._attachRoutes(baseRoute, _.result(app, 'routeConfig'), app);
            deferred.resolve();
        });

        return deferred.promise;
    },

    _load: function(app) {
        var self = this;

        if (this._currentApp !== app) {
            //switch apps
            return this._unloadCurrent()
                .then(function() {
                    self._currentApp = app;
                    return app.activate({ appSection: self.viewController.getAppSection() });
                });
        } else {
            return Q(true);
        }
    },

    _unloadCurrent: function() {
        if (!this._currentApp) {
            return Q(true);
        }

        return this._currentApp.deactivate({ sleep: true});
    }
});

module.exports = JutRouter;
});
