define(function(require, exports, module) {
var $ = require('jquery');

// Simple class to load and store the jut environment so that it's
// accessible to the application in the browser
var Environment = {

    data : {},

    load : function() {

        return $.ajax("/environment").then(function (res) {
            Environment.data = res;
        });
    },

    get: function(key, default_val) {
        return Environment.data[key] || default_val;
    },

    set: function(key, value) {
        Environment.data[key] = value;
        return value;
    }
};

module.exports = Environment;
});
