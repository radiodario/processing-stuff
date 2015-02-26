define(function(require, exports, module) {
var Q = require('q');
var Logger = require('logger');
var request_wrapper = require('request-wrapper');

var default_host = 'localhost';
var default_port = 3003;
var default_secure = false;

/* Object representing a query to the Citrus Query Engine.
 *
 * opts includes the following fields.
 *
 * host:    backend data service hostname.
 * port:    backend data service port.
 * secure:  use secure transport.
 */
var CQuery = function(opts) {

    // use defaults if we havent
    // passed any opts
    if (!arguments.length) {
        opts = {};
    }

    this.logger = Logger.get('cquery');
    this.host = opts.host || default_host;
    this.port = opts.port || default_port;
    this.secure = opts.secure || default_secure;
    this.url = (this.secure ? 'https:' : 'http:') + '//' + this.host + ':' + this.port;

    this.logger.info(this.url + ' configured as Citrus query endpoint');
};

/* A convenience method which returns all available POPs.
 * Returns: Promise of a list of all POPs for which data exists.
 */
CQuery.prototype.get_all_pops = function() {
    // Mock data for now.
    return Q(['atl', 'dal', 'lax']);
};

/* A convenience method which returns all available Regions.
 * Returns: Promise of a list of all Regions for which data exists.
 */
CQuery.prototype.get_all_regions = function() {
    // Mock data for now.
    return Q(['americas', 'asia', 'eur']);
};

/* A convenience method which returns all available servers.
 *
 * Returns: Promise of a list of all servers for which data exists.
 */
CQuery.prototype.get_all_servers = function() {
    // Mock data for now.
    return Q(['server1.llnw.net', 'server2.llnw.net', 'server3.llnw.net', 'server4.llnw.net']);
};

/* Execute query (controlled by preset filters).
 *
 * Params: metric -- string indicating desired metric.
 * Possible values: kbytes_out
 *
 * Returns: promise of results. 'results' is a list of metric objects. Each
 * object has the following attributes:
 *
 *  metric: Metric name
 *  attributes: Arbitrary attributes of the metric.
 *  value: the values of the metric. If this is an iterable, it represents a series of
 *         data like a time-series. Otherwise it is is a single value most suitable
 *         for bar-charts and histograms.
 */
CQuery.prototype.query = function(queryParams) {
    this.logger.debug('Executing citrus query');
    
    // there needs to be something here in place to validate the query

    this.logger.info("query:", queryParams);
   
    return this._request({
        method : 'POST',
        path : '/citrus/api/v1/query',
        data : JSON.stringify(queryParams)
    });
};

/* Create or remove a filter on the field named `field`.
 * If `what` is null or undefined, all filters on `field` are removed.
 *
 * If `what` is an object containing a field `range`, that field
 * should contain a two element array `[min, max]` specifying that
 * only records for which the value of `field` falls between `min`
 * and `max` match this filter.  For example, this filter matches all
 * records for which the field `size` is in the range 10-20:
 *     cquery.filter('size', { range: [ 10, 20 ] } );
 *
 * If 'what' is an object containing a field 'time', that field should
 * contain a two element array of ISO8601 format strings '[from, to]'
 * specifying the start and end time of the query. 'from' is inclusive,
 * 'to' is exclusive.
 *
 * If `what` is an object containing a field `inset`, that field
 * should contain an array representing a set of values to check the
 * value of `field` against -- records for which the value is a member
 * of this set match the filter.  For example, this filter matches all
 * records where the field `pop` is either `atl`, `sfo`, or `lax`:
 *     cquery.filter('pop', { inset: [ 'atl', 'sfo', 'lax' ] } );
 *
 * Returns: The CQuery object itself, suitable for chaining.
 */
CQuery.prototype.filter = function(field, what) {
    this.logger.debug('Setting ' + field + ':' + what + ' as filter');
    // Filters have no effect....yet.
    return this;
};

// Perform a HTTP request.
CQuery.prototype._request = function(options) {
    var method = options.method || 'GET';
    var url = this.url + options.path;
    this.logger.debug('_request', url);

    var self = this;
    return request_wrapper.request({
        type: method,
        url: url,
        data: options.data,
        dataType: 'json',
        contentType: 'application/json'
    } )
    .done(function() {
        self.logger.debug("_request", url, "done");
    })
    .fail(function(xhr, errorType, error) {
        self.logger.error("_request", url, "failure:", errorType, error.message);
    });
};

module.exports = CQuery;
});
