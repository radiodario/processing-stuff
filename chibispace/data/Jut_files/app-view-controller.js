define(function(require, exports, module) {
var Base = require('core/foundation').Base;
var JutAppView = require('./app-view');
var Dropdown = require('../toolbox/dropdown/dropdown');

var JutViewController = Base.extend({
    constructor: function(options) {
        this.commandManager = options.commandManager;

        this.view = new JutAppView({
            clientLayout: options.clientEnvironment.clientLayout,
            el: '#app'
        });
        this.view.render();

        if (options.clientEnvironment.showAppSelector) {
            this.appSelector = new Dropdown({
                title: 'Apps',
                onSelectUpdateTitle: true,
                defaultItems: [{
                    title: 'Campfire',
                    href: '#campfire/'
                },{
                    title: 'Admin',
                    href: '#admin/'
                }]
            });

            this.view.addSelector(this.appSelector);
        }
    },
    getAppSection: function() {
        return this.view.appSection;
    }
});

module.exports = JutViewController;});
