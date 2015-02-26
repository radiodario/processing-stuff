define(function(require, exports, module) {
var Backbone = require('backbone');
var moment = require('moment');

//For matching input like 24h (24 hours), 3d (3 days), 30m (30 minutes), 1w (1 week)
var shortDateReg = /^(\d+)([dhmw])$/i;
var shortFormat = 'MM/DD/YYYY HH:mm';
var longFormat = 'MMM DD, YYYY h:mm A ZZ';


var DateRange = Backbone.Model.extend({
    initialize: function(options) {
        this.useLocalTime = options.useLocalTime;

        this.setToAndFrom(options.toDate, options.fromDate);

        if (options.range) {
            this.setRange(options.range);
        }
    },
    setFrom: function(value) {
        this.set({
            fromDate: this.getMoment(value)
        });
    },
    setTo: function(value) {
        this.set({
            toDate: this.getMoment(value)
        });
    },
    setToAndFrom: function(toDate, fromDate) {
        this.set({
            toDate: this.getMoment(toDate),
            fromDate: this.getMoment(fromDate)
        });
    },
    setRange: function(range, toDate) {
        if (!toDate) {
            toDate = this.get('toDate');
        }

        var fromDate = toDate.clone(); //to be set to time in the past
        var shortDateMatch = range.match(shortDateReg);

        if (shortDateMatch) {
            var amount = shortDateMatch[1];
            var parameter = shortDateMatch[2].toLowerCase();

            fromDate.subtract(parameter, amount);
        }

        this.set({
            fromDate: fromDate,
            toDate: toDate
        });
    },
    setCurrentRange: function(range) {
        this.setRange(range, this.getMoment());
    },
    toString: function() {
        return this.get('fromDate').format(longFormat) + ' to ' + this.get('toDate').format(longFormat);
    },
    short: function() {
        return [this.shortFrom(), ' ... ', this.shortTo()].join('');
    },
    shortFrom: function() {
        return this.get('fromDate').format(shortFormat);
    },
    shortTo: function() {
        return this.get('toDate').format(shortFormat);
    },
    getMoment: function(value) {
        return (this.useLocalTime) ? moment(value) : moment.utc(value);
    }
});

module.exports = DateRange;});
