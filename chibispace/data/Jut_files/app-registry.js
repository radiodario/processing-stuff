define(function(require, exports, module) {
var Q = require('q');

var AppRegistry = {
    apps: {
        //these are hacks for now since our build process (with r.js) doesn't support dynamic loading of modules
        campfire: require('../apps/campfire/app-campfire'),
        admin: require('../apps/admin/app-admin'),
        toolbox: require('./toolbox/app-toolbox'),
        citrus: require('../apps/citrus/app-citrus')
    },
    get: function(appId) {
        var self = this;

        /* This could be done with a simple return value, but in the future this will probably be dynamic,
         * so return a promise as a standard */
        return Q.fcall(function() {
            if (! self.apps[appId]) {
                throw new Error('No registered app with id ' + appId);
            }

            return self.apps[appId];
        });
    }
};

module.exports = AppRegistry;});
