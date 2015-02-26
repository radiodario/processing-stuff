define(function(require, exports, module) {
/* global console */
var _ = require('underscore');
var serverRequire = require('require_utils').serverRequire;
var isServer = require('require_utils').isServer();

var levels = [
    "error",
    "warn",
    "info",
    "debug"
];

function _map_level(level) {
    var i = _(levels).indexOf(level);
    if (i === -1) {
        throw "invalid log level " + level;
    }
    return i;
}

function noop() { }

function LogTarget(name, level) {
    var self = this;
    this.level = level;
    this.name = name;
    _.each(levels, function (method, i) {
        // Only log for a given level (error, warn, info, debug) if the loggers
        // level is equal to or greater than that level.

        //Sample log lines : 
        // Wed, 05 Mar 2014 21:53:47 GMT [info] service: creating http server
        //
        // Wed, 05 Mar 2014 21:54:15 GMT [debug] spawner.hbase: waiting for 
        // port 60010
        self[method] = level < i ? noop :
            function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(self.name + ':');
                args.unshift('[' + method + ']');
                args.unshift(new Date().toUTCString());
                var fn = console[method] || console['info'];
                fn.apply(console, args);
            };
    });
}

function Logger() {
    this.default_level = _map_level("info");
    this.loaded_config = false;
    this._config = {};
    this._unique = {};
}

Logger.prototype.load_config = function() {
    if (!this.loaded_config) {
        if (isServer) {
            var read_config = serverRequire(module, './logger-config-reader');
            this.config(read_config());
        }
        this.loaded_config = true;
    }
};

Logger.prototype.set_level = function(prefix, level) {
    if (prefix === "*") {
        this.default_level = _map_level(level);
    } else {
        this._config[prefix] = _map_level(level);
    }
};

// Bulk configuration for a set of prefixes, e.g.
//   { test: 'debug', test2: 'error' }
Logger.prototype.config = function(config) {
    for (var prefix in config) {
        this.set_level(prefix, config[prefix]);
    }
};

Logger.prototype.get = function(name) {
    this.load_config();
    var level = this.default_level;
    for (var c in this._config) {
        if (name.slice(0, c.length) === c) {
            level = Math.max(level, this._config[c]);
        }
    }

    return new LogTarget(name, level);
};

Logger.prototype.get_unique = function(name) {
    var id = this._unique[name] || 0;
    this._unique[name] = id + 1;
    return this.get(name + "[" + id + "]");
};


module.exports = new Logger();
});
