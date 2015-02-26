define(function(require, exports, module) {
//
// Module to encode the version of the system.
//
//

var major = 0;
var minor = 1;

var build;
try {
    build = require('./build-version');
} catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
    }
    build = 'local';
}

module.exports = {
    major: major,
    minor: minor,
    build: build,
    version: "" + major + "." + minor + "-" + build
};

});
