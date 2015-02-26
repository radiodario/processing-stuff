define(function(require, exports, module) {
module.exports = {
    campfire: {
        startRoute: 'campfire/',
        registerApplications: ['admin', 'campfire', 'toolbox'],
        clientLayout: require('text!./campfire-layout.html'),
        showAppSelector: true
    },
    citrus: {
        startRoute: 'citrus/',
        registerApplications: ['citrus', 'toolbox'],
        clientLayout: require('text!./citrus-layout.html'),
        showAppSelector: false
    }
};});
