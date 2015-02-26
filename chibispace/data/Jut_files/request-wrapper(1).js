define(function(require, exports, module) {
/* global window */
//request-wrapper functions just like $.ajax, but instead of failing on a failed AJAX request
//the request-wrapper will notify the caller and attempt to retry after a specified amount of time
//default : 10 seconds.  This time will also be sent to the caller.

//Also, the request-wrapper will give the retry function to the caller so that it may implement a 
//manual retry if required.  This allows the caller to implement UI elements to prompt the retry and 
//allow for manual retry.

var $ = require('jquery');
var _ = require('underscore');
var Environment = require('core/environment');

function RequestWrapper () {
    this.default_timeout = /* 5000 */ 30000;
    this.default_retry_time = 10000;
}

function get_token () {
    var self = this;
    return $.ajax({
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
        Environment.set('access_token', access_token.token);
        self.access_token = access_token;
    }).fail(function(error, response) {
        window.location.replace(Environment.get('auth_url') + '/login');            
    });
}

function get_auth_headers() {
    return {
        Authorization: 'Bearer ' + Environment.get('access_token')
    };
}


RequestWrapper.prototype.request = function (options) {
    var deferred = new $.Deferred();
    options.timeout = options.timeout || this.default_timeout;
    options.retry_time = options.retry_time || this.default_retry_time;
    var jquery_options = _.clone(options);
    if (jquery_options.error) {
        jquery_options.error = null;   
    }
    if (jquery_options.success) {
        jquery_options.success = null;
    }

    var retry_timer;
    var request_counter = 0;
    var request;
    var whitelist_re;

    jquery_options.headers = jquery_options.headers || {};

    // Use cancel to allow the caller of request to stop any future requests
    // if cancel is called, the request wrapper will stop sending new requests
    // and will stop resolving or rejecting the promise. It is assumed that if
    // cancel is called, the caller is done with the request and is no longer
    // watching the promise.
    
    var cancelled = false;
    var cancel = function cancel() {
        cancelled = true;
    };

    if (options.whitelist) {
        // precompute a regexp to whitelist hosts which should get auth headers
        whitelist_re = new RegExp('^(?:' + options.whitelist.join('|') + ')');
    }

    if (!options.whitelist || whitelist_re.exec(options.url)) {
        jquery_options.headers = _.extend(jquery_options.headers, get_auth_headers());
    }

    var send = function send (timeout, override_options) {
        jquery_options = _.extend(jquery_options, override_options);
        request_counter++;
        jquery_options.timeout = timeout || options.timeout;
        request = $.ajax(jquery_options)
            .done(function (model, response, options) {
                if (cancelled) {
                    return;
                }
                if (retry_timer) { clearTimeout(retry_timer); }
                deferred.resolve(model, response, options);
            })
            .fail(function (error, response, response_text) {
                if (cancelled) {
                    return;
                }
                // fetch an auth token if the error is 401 and this is a jut url
                if (error.status === 401 || error.status === 403) {
                    if (request_counter === 1 && whitelist_re.exec(options.url)) {
                        get_token().done(function() {
                            jquery_options.headers = _.extend(jquery_options.headers, get_auth_headers());
                            return send(options.timeout, {});
                        });
                    } else {
                        window.location.replace(Environment.get('auth_url') + '/login');
                    }
                } else if (error.status !== 0) {
                    deferred.reject.apply(this, arguments);
                } else {
                    deferred.notify(response, options.retry_time, send, cancel);
                    retry_timer = setTimeout(function () {
                        if (!cancelled) {
                            send();   
                        }
                    }, options.retry_time);    
                }

            });
    };

    send(options.timeout, {});

    return deferred.promise();
};


module.exports = new RequestWrapper();
});
