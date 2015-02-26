define(function(require, exports, module) {

var Q = require('q');


/*
 * bbpromise(object, function, [args], [options])
 *
 * Backbone fetch and save expect an `options` argument that contains
 * `success` and `error` callbacks. `backbone_promise` allows these to
 * be used more easily in a promise chain:
 *
 *
 * On success, the promise is resolved with [model, resp, options]
 * that can be readily unpacked using `Q.spread`.
 *
 * On failure, the promise is resolved with an error object. If the
 * failure came from the call invocation (e.g. invalid args) then it
 * is unmodified, however if the failure came as a result of the
 * save/fetch error callback, then the [model, resp, and options] are
 * set as fields of the error option.
 *
 * For example:
 *
 *     var bbpromise = require('backbone-promise');
 *     var model = new MyModel();
 *
 *     bbpromise(model, 'fetch')
 *       .spread(function(model, resp, options) {
 *           console.log('fetch success');
 *       })
 *       .fail(function(err) {
 *           console.log('fetch error', err.model, err.resp, err.options);
 *       });
 *
 */
module.exports = function bbpromise() {
    if (arguments.length < 2) {
        return Q.reject(new Error('object and method must be specified'));
    }

    var obj = arguments[0];
    var method = arguments[1];

    var fn = obj[method];
    if (!fn) {
        return Q.reject(new Error('object has no ' + method + ' method'));
    }

    var args = Array.prototype.slice.call(arguments, 2);
    var options;
    if (args.length === 0) {
        options = {};
        args.push(options);
    } else {
        options = args[args.length - 1];
    }

    if (options.success || options.error) {
        return Q.reject(new Error('options should not contain success or error callbacks'));
    }

    var deferred = Q.defer();

    options.success = function(model, resp, options) {
        deferred.resolve([model, resp, options]);
    };

    options.error = function(model, resp, options) {
        var err = new Error('error in ' + method);
        err.model = model;
        err.resp = resp;
        err.options = options;
        deferred.reject(err);
    };

    fn.apply(obj, args);

    return deferred.promise;
};


});
