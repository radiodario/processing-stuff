define(function(require, exports, module) {

// XXX make this a dynamic thing that can update

function legend(items, options) {
    var LABEL_GAP = 2;

    options = options || {};
    var width = options.width || 200;
    var x = options.x || 0;
    var y = options.y || 0;
    var itemHeight = options.itemHeight || 12;
    var gap = options.gap || 5;

    var _legend = {};
    var _g;
    var _svg;
    var _listeners = {};

    function position_g() {
        var realx = (x >= 0) ? x : _svg.attr('width') - width + x;
        
        // no "offset from bottom" for the legend since the
        // height depends on the number of entries...
        var realy = y;

        _g.attr('transform', 'translate(' + realx + ',' + realy + ')');
    }
    
    _legend.render = function(svg) {
        _svg = svg;
        _g = svg.append('g')
            .attr('width', width)
            .attr("class", "jut-chart-legend");
        position_g();

        var itemEnter = _g.selectAll('g.dc-legend-item')
            .data(items)
            .enter()
            .append("g")
            .attr("class", "dc-legend-item")
            .attr("class", function(d) { 
                if ((d.shape === "rect") || (typeof d.shape === "undefined")) { 
                    return "dc-legend-rect"; 
                }
                else if (d.shape === "circle") { 
                    return "dc-legend-circle"; 
                }
                else {
                    throw new Error("bogus legend shape " + d.shape);
                }
            })
            .attr("transform", function (d, i) {
                return "translate(0," + i * (gap + itemHeight) + ")";
            });

        for (var what in _listeners) {
            if (_listeners.hasOwnProperty(what)) {
                itemEnter.on(what, _listeners[what]);
            }
        }

        _g.selectAll("g.dc-legend-rect")
            .append("rect")
            .attr("width", itemHeight)
            .attr("height", itemHeight)
            .attr("fill", function(d){return d.color;});

        _g.selectAll("g.dc-legend-circle")
            .append("circle")
            .attr("r", itemHeight / 2)
            .attr("transform", "translate(" + itemHeight / 2 + "," + itemHeight / 2 + ")")
            .attr("fill", function(d){return d.color;});

        itemEnter.append("text")
            .text(function(d){return d.name;})
            .attr("x", itemHeight + LABEL_GAP)
            .attr("y", function(){return itemHeight / 2 + (this.clientHeight?this.clientHeight:13) / 2 - 2;});
    };

    _legend.resize = function() {
        position_g();
    };

    _legend.on = function(what, fn) {
        if (! _g) {
            _listeners[what] = fn;
        }
        else {
            _g.selectAll('g.dc-legend-item').on(what, fn);
        }
        return _legend;
    };

    return _legend;
}

module.exports = legend;
});
