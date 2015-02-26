define(function(require, exports, module) {
var AppController = require('applib/app-controller');
var Logger = require('logger');
var $ = require('jquery');
var React = require('react');
var Backbone = require('backbone');
var _ = require('underscore');
var CitrusAppView = require('./citrus-view');

var trendsRoutes = require('./screens/trends/trends-routes').routes;
var dashboardsRoutes = require('./screens/dashboards/dashboards-routes').routes;

var NavView = require('./screens/nav/citrus-nav-view');
var TrendsView = require('./screens/trends/trends-view');
var DashboardsView = require('./screens/dashboards/dashboards-view');

var CitrusApp = AppController.extend({
    initialize: function() {
        this.logger = Logger.get('citrusApp');
    },
    appName: 'citrus',

    onWakeUp: function() {
        return this.getData();
    },
    onActivate: function() {
        $('body').addClass('app-citrus');
        this.subViews = {};

        this.view = new CitrusAppView();
        this.view.render();

        this.setupNav();
        this.setupContent();

        this.appSection.html(this.view.el);

        return true;
    },
    onDeactivate: function() {
        $('body').removeClass('app-citrus');
        this.view.remove();
        this.view = null;

        this.subViews = null;

        return true;
    },
    onSleep: function() {
        this.data = null;
    },

    routeConfig: function() {
        var routeConfig = {
            routes: {
                '*': function (route) {
                    this.logger.info('Citrus default route');
                    this.setContent(TrendsView);
                }
            }
        };

        _.extend(routeConfig.routes, trendsRoutes, dashboardsRoutes);

        return routeConfig;
    },

    setContent: function(contentView) {
        this.subViews.content = contentView;
        React.renderComponent(this.subViews.content.view(), this.view.content[0]);

        this.subViews.nav.setSelected(contentView.linkId);
    },

    getData: function() {
        //placeholder
        this.data = {};

        return true;
    },

    setupNav: function() {
        var navLinks = new Backbone.Model({
            links: [{
                id: TrendsView.linkId,
                href: '#citrus/trends',
                text: 'Trends'
            }, {
                id: DashboardsView.linkId,
                href: '#citrus/dashboards',
                text: 'Dashboards'
            }
            ],
            selected: 'trends'
        });
        this.subViews.nav = NavView({model: navLinks});
        React.renderComponent(this.subViews.nav, this.view.header[0]);
    },

    setupContent: function() {
        if (this.previousContent) {
            //TODO
        } else {
            this.setContent(TrendsView);
        }
    }
});

module.exports = CitrusApp;
});
