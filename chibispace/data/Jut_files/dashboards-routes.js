define(function(require, exports, module) {
var DashboardsView = require('./dashboards-view');

module.exports = {
    routes: {
        'dashboards': function() {
            this.logger.info('Dashboards routed');
            this.setContent(DashboardsView);
        }
    }
};
});
