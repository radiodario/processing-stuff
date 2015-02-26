define(function(require, exports, module) {

var base = require('./base-chart');
var d3 = require('d3');

// XXX make this something reusable?
function color_legend(g, scale, width, max) {
    var npoints = 10;

    var x = d3.scale.linear()
        .domain([0, npoints])
        .range([0, width]);

    var val = d3.scale.linear()
        .domain([0, npoints])
        .range([0, max]);

    var points = d3.range(0, 10);
    var increment = max/10;

    // XXX the elegant thing would be a bunch of <g>s each
    // with a rect and text...

    var rect = g.selectAll('rect')
        .data(points.slice(0, -1))
      .enter()
        .append('rect')
        .attr('x', function(d) { return x(d); })
        .attr('width', function(d) { return x(d+1) - x(d); })
        .attr('height', 20)
        .attr('fill', function(d) { return scale(val(d)); });
    
    var text = g.selectAll('text')
        .data(points.slice(0, -1))
      .enter()
        .append('text')
        .style('font', '10px sans-serif')
        .attr('x', function(d) { return x(d); })
        .attr('y', 30)
        .text(function(d) { return Math.round(val(d)).toString(); });

    function draw() {
        rect
            .attr('x', function(d) { return x(d); })
            .attr('width', function(d, i) { return x(d+1) - x(d); })
            .attr('fill', function(d) { return scale(val(d)); });

        text
            .attr('x', function(d) { return x(d); })
            .text(function(d) { return Math.round(val(d)).toString(); });
    }

    var _legend = {};
    
    _legend.resize = function(w) {
        width = w;
        x.range([0, width]);
        draw();
    };

    _legend.setmax = function(m) {
        max = m;
        val.range([0, max]);
        draw();
    };

    return _legend;
}

function MapBase(el) {
    var _chart = base.BaseChart(el);

    var _geoPath = d3.geo.path();
    var _projectionFlag;

    var _geoJsons = [];
    
    var end_color = '#4ab0ce';  // XXX get this from global color settings
    var start_color = d3.interpolateRgb('white', end_color)(0.4);
    var _scale = d3.scale.linear()
        .domain([0, 1, 10])
        .range(['#dddddd', start_color, end_color]);

    _chart.doRender = function () {
        for (var layerIndex = 0; layerIndex < _geoJsons.length; ++layerIndex) {
            var states = _chart.svg().append("g")
                .attr("class", "layer" + layerIndex);

            var regionG = states.selectAll("g." + geoJson(layerIndex).name)
                .data(geoJson(layerIndex).data)
                .enter()
                .append("g")
                .attr("class", geoJson(layerIndex).name);

            regionG
                .append("path")
                .attr("fill", "white")
                .attr("d", _geoPath);

            regionG.append("title");

            plotData(layerIndex);

            _chart._glegend = _chart.svg()
              .append('g')
                .attr('transform', 'translate(' + Math.round(0.6*_chart.width())
                                    + ',' + (_chart.height() - 30) + ')');
            _chart._legend = color_legend(_chart._glegend, _scale,
                                          Math.round(0.4*_chart.width()), 10);
        }
        _projectionFlag = false;
    };

    function plotData(layerIndex) {
        var maxValue = d3.max(_chart.data(), _chart.valueAccessor());

        _scale.domain([0, 1, maxValue]);
        if (_chart._legend) { _chart._legend.setmax(maxValue); }

        var data = _chart._layered_data = generateLayeredData();

        if (isDataLayer(layerIndex)) {
            var regionG = renderRegionG(layerIndex);

            renderPaths(regionG, layerIndex, data, maxValue);

            renderTitle(regionG, layerIndex, data);
        }
    }

    function generateLayeredData() {
        var data = {};
        var all = _chart.data();
        for (var i = 0; i < all.length; ++i) {
            data[_chart.keyAccessor()(all[i])] = _chart.valueAccessor()(all[i]);
        }
        return data;
    }

    function isDataLayer(layerIndex) {
        return geoJson(layerIndex).keyAccessor;
    }

    // XXX from dc.utils
    function nameToId(name) {
        return name.toLowerCase().replace(/[\s]/g, "_").replace(/[\.']/g, "");
    }

    function renderRegionG(layerIndex) {
        var regionG = _chart.svg()
            .selectAll(layerSelector(layerIndex))
            .classed("selected", function (d) {
                return isSelected(layerIndex, d);
            })
            .classed("deselected", function (d) {
                return isDeselected(layerIndex, d);
            })
            .attr("class", function (d) {
                var layerNameClass = geoJson(layerIndex).name;
                var regionClass = nameToId(geoJson(layerIndex).keyAccessor(d));
                var baseClasses = layerNameClass + " " + regionClass;
                if (isSelected(layerIndex, d)) baseClasses += " selected";
                if (isDeselected(layerIndex, d)) baseClasses += " deselected";
                return baseClasses;
            });
        return regionG;
    }

    function layerSelector(layerIndex) {
        return "g.layer" + layerIndex + " g." + geoJson(layerIndex).name;
    }

    function isSelected(layerIndex, d) {
        return _chart.hasSelectedItems()
            && _chart.isSelectedItem(make_object(d, layerIndex));
    }

    function isDeselected(layerIndex, d) {
        return _chart.hasSelectedItems()
            && (!_chart.isSelectedItem(make_object(d, layerIndex)));
    }

    function getKey(layerIndex, d) {
        return geoJson(layerIndex).keyAccessor(d);
    }

    function geoJson(index) {
        return _geoJsons[index];
    }

    function renderPaths(regionG, layerIndex, data, maxValue) {
        var paths = regionG
            .select("path")
            .attr("fill", function (d) {
                var currentFill = d3.select(this).attr("fill");
                if (currentFill)
                    return currentFill;
                return "none";
            })
            .on("click", function (d) {
                return _chart.onClick(d, layerIndex);
            });

        paths
            .transition()
            .duration(_chart.transitionDuration())
            .attr("fill", function (d, i) {
                //return _chart.getColor(data[geoJson(layerIndex).keyAccessor(d)], i);
                var v = data[geoJson(layerIndex).keyAccessor(d)] || 0;
                return _scale(v);
            });
    }

    // XXX egad this is atrocious
    function make_object(d, layerIndex) {
        var region = geoJson(layerIndex).keyAccessor(d);
        return obj = {
            key: region,
            value: _chart._layered_data[region]
        };
    }
        

    _chart.onClick = function (d, layerIndex) {
        _chart.raiseClick(make_object(d, layerIndex));
    };

    function renderTitle(regionG, layerIndex, data) {
        if (_chart.renderTitle()) {
            regionG.selectAll("title").text(function (d) {
                var key = getKey(layerIndex, d);
                var value = data[key];
                return _chart.title()({key: key, value: value});
            });
        }
    }

    _chart.doRedraw = function () {
        for (var layerIndex = 0; layerIndex < _geoJsons.length; ++layerIndex) {
            plotData(layerIndex);
            if (_projectionFlag) {
                _chart.svg().selectAll("g." + geoJson(layerIndex).name + " path").attr("d", _geoPath);
            }
        }
        _projectionFlag = false;
    };

    _chart.overlayGeoJson = function (json, name, keyAccessor) {
        for (var i = 0; i < _geoJsons.length; ++i) {
            if (_geoJsons[i].name == name) {
                _geoJsons[i].data = json;
                _geoJsons[i].keyAccessor = keyAccessor;
                return _chart;
            }
        }
        _geoJsons.push({name: name, data: json, keyAccessor: keyAccessor});
        return _chart;
    };

    _chart.projection = function (projection) {
        _geoPath.projection(projection);
        _projectionFlag = true;
        return _chart;
    };

    _chart.geoJsons = function () {
        return _geoJsons;
    };

    _chart.removeGeoJson = function (name) {
        var geoJsons = [];

        for (var i = 0; i < _geoJsons.length; ++i) {
            var layer = _geoJsons[i];
            if (layer.name != name) {
                geoJsons.push(layer);
            }
        }

        _geoJsons = geoJsons;

        return _chart;
    };

    return _chart;
}

function MeractorMap(el) {
    var _chart = MapBase(el);

    _projection = d3.geo.mercator()
        .center([0, 20]);

    function setsize(w, h) {
        _projection
            .scale(Math.round(w * 0.15))  // XXX?
            .translate([Math.round(w/2), Math.round(h/2)]);
    }

    setsize(_chart.width(), _chart.height());

    _chart.projection(_projection);

    _chart.doResize = function() {
        var w = _chart.width();
        var h = _chart.height();

        // XXX hard-coded logic to preserve aspect ratio by
        // tweaking height.  should generalize this?
        var targeth = Math.round(w * 0.49);
        if (h < targeth) {
            $(_chart.element().node()).height(targeth+20);
            _chart.resize(w, targeth);
            return;
        }

        setsize(w, h);
        _chart.projection(_projection);
        _chart.doRedraw();

        _chart._glegend.attr('transform', 'translate(' + Math.round(0.6*_chart.width())
                                    + ',' + (_chart.height() - 30) + ')');
        _chart._legend.resize(Math.round(0.4*_chart.width()));
    };

    return _chart;
}


module.exports = MeractorMap;
});
