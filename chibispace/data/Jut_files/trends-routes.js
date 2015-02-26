define(function(require, exports, module) {
var TrendsView = require('./trends-view');

module.exports = {
    routes: {
        'trends': function() {
            this.logger.info('Trends routed');
            this.setContent(TrendsView);
        }
    }
};
});
