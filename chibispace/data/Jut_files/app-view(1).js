define(function(require, exports, module) {
var Backbone = require('backbone');
var _ = require('underscore');
var Logger = require('logger');

var NavMenuView = require("./screens/nav/nav-view");
var PageNavItem = require('./screens/nav/page-nav-item');

require('bootstrap_dropdown');

var appLayout = require('text!./app-layout.html');

var AppView = Backbone.View.extend({
    defaultPage: require("./default-view"),

    current_page: null,
    current_pagename: '',

    initialize: function (options) {
        this.app = options.app;
        this.pages = options.pages;

        this.logger = Logger.get('app-view');
    },

    render: function () {

        var layout = _.template(appLayout);

        this.$el.html(layout);

        this.navView = new NavMenuView({
            pages: this.pages,
            auth_status: this.app.auth_status,
            app : this.app,

            el: this.$el.find('header')
        });
        this.navView.render();

    },

    events: {
    },

    // Given a full fragment, find the page associated with it.
    // For example, the fragment name "search?q=range:@timestamp:1000:2000"
    // corresponds to the page "search"
    _getPage: function (fragment) {
        return _.find(this.navView.navItems, function (navItem) {
            if (navItem instanceof PageNavItem) {
                var thePage = navItem.name;
                return (fragment.slice(0, thePage.length) === thePage);
            }
        });
    },

    showPage: function (fragment) {

        this.logger.debug('show_page', fragment);

        var pageEl = this.$el.find('.page');
        pageEl.attr('data-rendered', false);

        // abort pending/active animation on the page element
        pageEl.stop(true, true);

        var page = this._getPage(fragment);

        // 'home' is the default page name
        var pageName = page ? page.name : 'home';
        if (pageName === this.current_pagename) {
            this.current_page.set_fragment(fragment);
            return;
        }

        if (this.current_page !== null) {
            this.current_page.close();
        }

        this.navView.highlight(pageName);
        this.current_pagename = pageName;
        
        var pageClass = pageName === 'home' ? this.defaultPage : page.view;
        if (!this.app.active_deployment && pageClass.needs_deployment) {
            this.app.alert('No active deployment selected, <a href="/#admin/deployments">Configure Deployments</a>');
            return; 
        }
        if (!this.app.search && pageClass.needs_data_node) {
            this.app.alert('No data nodes registered with this deployment, <a href="/#admin/hosts">Configure Hosts</a>');
            return; 
        }

        var pageView = new pageClass({
            app: this.app,
            fullpath: fragment
        });

        var doFade = (this.current_page !== null);
        if (doFade) {
            pageView.$el.css('visibility', 'hidden');
        }

        pageEl.append(pageView.$el);

        pageView.render();
        pageView.$el.attr('id', 'jut-' + pageName + '-page');
        pageEl.attr('data-rendered', true);

        if (doFade) {
            pageEl.hide();
            pageView.$el.css('visibility', 'visible');
            pageEl.fadeIn(800);
        }

        this.current_page = pageView;

    }
});
module.exports = AppView;
});
