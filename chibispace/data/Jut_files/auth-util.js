define(function(require, exports, module) {
var $ = require("jquery");
var Q = require('q');

var Logger = require('logger');
var Environment = require('core/environment');

var logger = Logger.get('AuthUtil');

var getToken = function() {
    var deferred = Q.defer();

    logger.info('Getting token');

    $.ajax({
        cache: false,
        data: { grant_type: 'client_credentials' },
        dataType: 'json',
        type: 'POST',
        url: Environment.get('auth_url') + '/token',
        xhrFields: { withCredentials: true }
    }).done(function(data) {
        var access_token = {
            token: data.access_token,
            expiry: Date.now() + data.expires_in*1000
        };

        deferred.resolve(access_token);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
};

module.exports = {
    getToken:  getToken
};
});
