define(function(require, exports, module) {
/** @jsx React.DOM */
var React = require('react');

var _ = require('underscore');
var $ = require('jquery');

var TimeSelector = React.createClass({displayName: 'TimeSelector',
    componentWillMount: function() {
        this.state.selected.dateRange.on('change', function() {
            var dateRange = this.state.selected.dateRange;

            if (this.props.updateOnChange) {
                this.setState({
                    selected: {
                        title: dateRange.short(),
                        dateRange: dateRange
                    }
                });
            }

            if (this.props.includeCustomOption) {
                $(this.refs['toDate'].getDOMNode()).val(dateRange.shortTo());
                $(this.refs['fromDate'].getDOMNode()).val(dateRange.shortFrom());
            }
        }, this);
    },
    componentDidMount: function() {
        if (this.props.includeCustomOption) {
            var customTimeInput = $(this.refs['customTimeInput'].getDOMNode());
            customTimeInput.on('click', function () {
                //prevent the dropdown from closing if this area of the dropdown is clicked
                // since the user needs to interact with inputs
                return false;
            });
        }
    },
    render: function() {
        var presets = this.props.presets;
        var dateRange = this.state.selected.dateRange;
        var presetUI = [];
        var customInput = '';

        _.each(presets, function(preset, index) {
            presetUI.push(this.createMenuItem(preset, index));
        }, this);

        if (this.props.includeCustomOption) {
            customInput = (
                React.DOM.li( {key:'customInput', ref:"customTimeInput"}, 
                    React.DOM.label( {htmlFor:"fromDate"}, "From"),
                    React.DOM.input( {ref:"fromDate",
                        type:"text", className:"form-control", id:"fromDate", defaultValue:dateRange.shortFrom(),
                        onBlur:this.handleChangeFromDate,
                        onKeyPress:this.handleKeyPressFromDate} ),
                    React.DOM.label( {htmlFor:"toDate"}, "To"),
                    React.DOM.input( {ref:"toDate",
                        type:"text", className:"form-control", id:"toDate", defaultValue:dateRange.shortTo(),
                        onBlur:this.handleChangeToDate,
                        onKeyPress:this.handleKeyPressToDate} )
                )
            );
        }

        return (
            React.DOM.div( {className:"selector", ref:"dropDownParent"}, 
                React.DOM.div( {className:"selectorLabel label"}, this.props.label),
                React.DOM.button( {type:"button", className:"btn btn-default dropdown-toggle col-md-12", 'data-toggle':"dropdown"}, 
                React.DOM.span(null, this.state.selected.title), " ", React.DOM.span( {className:"caret"})
                ),
                React.DOM.ul( {className:"dropdown-menu", role:"menu"}, 
                    presetUI,
                    customInput
                )
            )
        );
    },
    getInitialState: function() {
        return {
            selected: this.props.selected
        }
    },
    handleSelection: function(data) {
        var dateRange = this.state.selected.dateRange;

        if (data.setRange) {
            dateRange.setCurrentRange(data.setRange);
        } else {
            dateRange.setToAndFrom(data.toDate, data.fromDate);
        }

        this.setState({
            selected: {
                title: data.title,
                dateRange: dateRange
            }
        });
    },
    createMenuItem: function(data, index) {
        if (data.divider === true) {
            return React.DOM.li( {key:index, className:"divider"});
        } else {
            return React.DOM.li( {key:index}, React.DOM.a( {onClick:this.handleSelection.bind(null, data)}, data.title));
        }
    },
    handleChangeFromDate: function(event) {
        this.setFromDate(event.target.value);
    },
    handleChangeToDate: function(event) {
        this.setToDate(event.target.value);
    },
    handleKeyPressFromDate: function(event) {
        if (event.keyCode === 13) {
            this.setFromDate(event.target.value);
        }
    },
    handleKeyPressToDate: function(event) {
        if (event.keyCode === 13) {
            this.setToDate(event.target.value);
        }
    },
    setFromDate: function(date) {
        this._setCustomDate(true, date);
    },
    setToDate: function(date) {
        this._setCustomDate(false, date);
    },
    _setCustomDate: function(isFrom, date) {
        var dateRange = this.state.selected.dateRange;

        if (!(this.state.selected.dateRange.useLocalTime)) {
            date += ' +0000'; //keeps it in UTC
        }

        if (isFrom) {
            dateRange.setFrom(date);
        } else {
            dateRange.setTo(date);
        }

        this.setState({
            selected: {
                title: dateRange.short(),
                dateRange: dateRange
            }
        });
    }
});

module.exports = TimeSelector;
});
