define(function(require, exports, module) {
var Q = require('q');

var ToolboxRegistry = {
    tools: {
        //these are hacks for now since our build process (with r.js) doesn't support dynamic loading of modules
        'link': require('./link/link-playground'),
        'hello-react': require('./hello-react/hello-react-playground'),
        'react-model-timer': require('./react-model-timer/react-model-timer-playground'),
        'dropdown': require('./dropdown/dropdown-playground'),
        'token': require('./token/token-playground'),
        'token-group': require('./token-group/token-group-playground'),
        'citrus-charts': require('./citrus-charts/chart-playground'),
        'react-bootstrap': require('./react-bootstrap/react-bootstrap-playground'),
        'select' : require('./select/select-playground'),
        'textfield' : require('./textfield/textfield-playground'),
        'time-selector': require('./time-selector/time-selector-playground'),
        'group-tag-select': require('./group-tag-select/group-tag-select-playground'),
        'modal': require('./modal/modal-playground')
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

module.exports = ToolboxRegistry;
});
