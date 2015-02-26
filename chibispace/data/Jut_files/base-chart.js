define(function(require, exports, module) {

var d3 = require('d3');
var $ = require('jquery');

function BaseChart(el) {
    el = d3.select(el);
    el.classed('dc-chart', true);
    
    var _chart = {};

    var _svg;
    var _rendered = false;

    var _width = 200, _height = 200;

    var _data = [];

    var _keyAccessor = function (d) {
        return d.key;
    };
    var _valueAccessor = function (d) {
        return d.value;
    };

    var _label = function (d) {
        return d.key;
    };
    var _renderLabel = false;

    var _title = function (d) {
        return _keyAccessor(d) + ": " + _valueAccessor(d);
    };
    var _renderTitle = false;

    var _transitionDuration = 750;

    var _renderlets = [];

    var _dispatch = d3.dispatch("preRender", "postRender",
                                "preRedraw", "postRedraw",
                                "preResize", "postResize",
                                "showControls", "zoomed", "click");

    var _selected_items = { };
    var _selected_count = 0;

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.resize = function(w, h) {
        if (arguments.length === 0) {
            var $el = $(el.node());
            w = $el.width();
            h = $el.height();
            
            if (w == 0 || h == 0) {
                //console.log('waiting on size...');
                setTimeout(function() { _chart.resize(); }, 500);
                return;
            }
        }

        _width = w;
        _height = h;

        _svg
            .attr('width', _width)
            .attr('height', _height);

        if (_chart.hasOwnProperty('doResize')) {
            _chart.doResize();
            _chart.activateRenderlets("postResize");
        }
        else {
            _chart.redraw();
        }
    };

    _chart.data = function(data, layer) {
        if (!arguments.length) return _data;
        if (layer !== undefined) {
            if (_data.length < layer) {
                for (var i=_data.length; i<layer; i++) { _data[i] = []; }
            }
            _data[layer] = data;
        }
        else {
            _data = data;
        }
        return _chart;
    };

    _chart.dataSet = function () {
        return _data.length > 0;
    };

    _chart.select = function (s) {
        return el.select(s);
    };

    _chart.selectAll = function (s) {
        return el ? el.selectAll(s) : null;
    };

    _chart.svg = function () { return _svg; }

    _chart.transitionDuration = function (d) {
        if (!arguments.length) return _transitionDuration;
        _transitionDuration = d;
        return _chart;
    };

    _chart.render = function () {
        if (_rendered) {
            throw new Error('called render twice');
        }

        _svg = el.append("svg")
            .attr("width", _width)
            .attr("height", _height);

        _dispatch.preRender(_chart);

        var result = _chart.doRender();

        _chart.activateRenderlets("postRender");

        _rendered = true;

        return result;
    };

    _chart.activateRenderlets = function (event) {
        if (_chart.transitionDuration() > 0 && _svg) {
            _svg.transition().duration(_chart.transitionDuration())
                .each("end", function () {
                    runAllRenderlets();
                    if (event) _dispatch[event]();
                });
        } else {
            runAllRenderlets();
            if (event) _dispatch[event]();
        }
    };

    _chart.redraw = function () {
        if (!_rendered) {
            throw new Error('calling redraw before render');
        }

        _dispatch.preRedraw(_chart);

        var result = _chart.doRedraw();

        _chart.activateRenderlets("postRedraw");

        return result;
    };

    _chart.invokeZoomedListener = function (chart) {
        _dispatch.zoomed(_chart);
    };

    _chart.raiseClick = function(d) {
        _dispatch.click(d);
    };

    var SELECTED_CLASS = 'selected';
    var DESELECTED_CLASS = 'deselected';
    _chart.highlightSelected = function (e) {
        d3.select(e).classed(SELECTED_CLASS, true);
        d3.select(e).classed(DESELECTED_CLASS, false);
    };

    _chart.fadeDeselected = function (e) {
        d3.select(e).classed(SELECTED_CLASS, false);
        d3.select(e).classed(DESELECTED_CLASS, true);
    };

    _chart.resetHighlight = function (e) {
        d3.select(e).classed(SELECTED_CLASS, false);
        d3.select(e).classed(DESELECTED_CLASS, false);
    };

    // abstract function stub
    _chart.doRender = function () {
        // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    _chart.doRedraw = function () {
        // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    _chart.legendables = function () {
        // do nothing in base, should be overridden by sub-function
        return [];
    };

    _chart.legendHighlight = function (d) {
        // do nothing in base, should be overridden by sub-function
    };

    _chart.legendReset = function (d) {
        // do nothing in base, should be overridden by sub-function
    };

    _chart.keyAccessor = function (_) {
        if (!arguments.length) return _keyAccessor;
        _keyAccessor = _;
        return _chart;
    };

    _chart.valueAccessor = function (_) {
        if (!arguments.length) return _valueAccessor;
        _valueAccessor = _;
        return _chart;
    };

    _chart.label = function (_) {
        if (!arguments.length) return _label;
        _label = _;
        _renderLabel = true;
        return _chart;
    };

    _chart.renderLabel = function (_) {
        if (!arguments.length) return _renderLabel;
        _renderLabel = _;
        return _chart;
    };

    _chart.title = function (_) {
        if (!arguments.length) return _title;
        _title = _;
        _renderTitle = true;
        return _chart;
    };

    _chart.renderTitle = function (_) {
        if (!arguments.length) return _renderTitle;
        _renderTitle = _;
        return _chart;
    };

    _chart.renderlet = function (_) {
        _renderlets.push(_);
        return _chart;
    };

    function runAllRenderlets() {
        for (var i = 0; i < _renderlets.length; ++i) {
            _renderlets[i](_chart);
        }
    }

    _chart.on = function(event, listener) {
        _dispatch.on(event, listener);
        return _chart;
    };

    _chart.expireCache = function () {
        // do nothing in base, should be overridden by sub-function
        return _chart;
    };

    _chart.selectItem = function(d, selected) {
        var key = _keyAccessor(d);
        if (selected) {
            if (! _selected_items.hasOwnProperty(key)) {
                _selected_items[key] = true;
                _selected_count++;
            }
        }
        else {
            if (_selected_items.hasOwnProperty(key)) {
                delete _selected_items[key];
                _selected_count--;
            }
        }
    };

    _chart.hasSelectedItems = function() {
        return (_selected_count > 0);
    };
    _chart.isSelectedItem = function(d) {
        return _selected_items.hasOwnProperty(_keyAccessor(d));
    };

    _chart.toggleSelected = function(d) {
        _chart.selectItem(d, !_chart.isSelectedItem(d));
    };

    _chart.allSelectedItems = function() {
        var items = [];
        for (var name in _selected_items) {
            if (_selected_items.hasOwnProperty(name)) {
                items.push(name);
            }
        }
        return items;
    };

    _chart.clearSelectedItems = function() {
        _selected_items = {};
        _selected_count = 0;
    };

    _chart.element = function() { return el; };

    return _chart;
}

function lightblue_scale() {
    // XXX see COLOR_VALUES in light-blue/js/app.js
    var colors = [
        "#4ab0ce", "#e5603b", "#eac85e", "#56bc76", "#6a8da7", "#d04f4f"
    ];


    function shade(color, pct) {
        function convert(s) {
            return Math.min(255, Math.floor(parseInt(s, 16) * pct)).toString(16);
        }

        var r = convert(color.substr(1, 2));
        var g = convert(color.substr(3, 2));
        var b = convert(color.substr(5, 2));

        return "#" + r + g + b;
    }
    
    // add progressively lighter versions
    var i;
    for (i = 0; i < 5; ++i) {
        colors.push(shade(colors[i], 1.5));
    }
    for (i = 0; i < 5; ++i) {
        colors.push(shade(colors[i], 1.5));
    }

    return d3.scale.ordinal()
        .range(colors);
}

// the default color palette:

//var color_scale = d3.scale.category20c;
var color_scale = lightblue_scale;

function ColorChart(_chart) {
    var _colors = color_scale();

    var _colorDomain = [0, _colors.range().length];

    var _colorCalculator = function(value) {
        var minValue = _colorDomain[0];
        var maxValue = _colorDomain[1];

        if (isNaN(value)) value = 0;
        if(maxValue === null) return _colors(value);

        var colorsLength = _chart.colors().range().length;
        var denominator = (maxValue - minValue) / colorsLength;
        var colorValue = Math.abs(Math.min(colorsLength - 1, Math.round((value - minValue) / denominator)));
        return _chart.colors()(colorValue);
    };

    var _colorAccessor = function(d, i){return i;};

    _chart.colors = function(_) {
        if (!arguments.length) return _colors;

        if (_ instanceof Array) {
            _colors = d3.scale.ordinal().range(_);
            var domain = [];
            for(var i = 0; i < _.length; ++i){
                domain.push(i);
            }
            _colors.domain(domain);
        } else {
            _colors = _;
        }

        _colorDomain = [0, _colors.range().length];

        return _chart;
    };

    _chart.colorCalculator = function(_){
        if(!arguments.length) return _colorCalculator;
        _colorCalculator = _;
        return _chart;
    };

    _chart.getColor = function(d, i){
        return _colorCalculator(_colorAccessor(d, i));
    };

    _chart.colorAccessor = function(_){
        if(!arguments.length) return _colorAccessor;
        _colorAccessor = _;
        return _chart;
    };

    _chart.colorDomain = function(_){
        if(!arguments.length) return _colorDomain;
        _colorDomain = _;
        return _chart;
    };

    return _chart;
}

function marginable(_chart) {
    var _margin = {top: 10, right: 50, bottom: 30, left: 30};

    _chart.margins = function (m) {
        if (!arguments.length) return _margin;
        _margin = m;
        return _chart;
    };

    _chart.effectiveWidth = function () {
        return _chart.width() - _chart.margins().left - _chart.margins().right;
    };

    _chart.effectiveHeight = function () {
        return _chart.height() - _chart.margins().top - _chart.margins().bottom;
    };

    return _chart;
}


module.exports = {
    BaseChart: BaseChart,
    ColorChart: ColorChart,
    marginable: marginable
};

});
