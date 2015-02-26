define(function(require, exports, module) {
/**
 * Simple wrapper around server-specific requires.
 *
 * In order to set the module import context properly, the caller must
 * pass the special 'module' variable when calling it.
 */
function isServer() {
    try {
        /* global window */
        if (window !== null) {
            return false;
        }
    } catch(err) {
        return true;
    }
}

/**
 * Simple wrapper around server-specific requires.
 *
 * In order to set the module import context properly, the caller must
 * pass the special 'module' variable when calling it.
 */
function serverRequire (_module, path) {
    if (isServer()) {
        return _module.require(path);
    } else {
        return null;
    }
}

// Only export if we're running either on the server or in the browser
// using requirejs loaded sources (hence module is defined).
if (typeof module !== 'undefined') {
    module.exports = {
        isServer : isServer,
        serverRequire : serverRequire
    };
}
});
