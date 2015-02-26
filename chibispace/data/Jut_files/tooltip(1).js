define(function(require, exports, module) {
var $ = require('jquery');

var tooltip = {

  show: function(pos, content, gravity, dist) {
    var container = $('<div class="citrus-charts tooltip">');

    gravity = gravity || 'n';
    dist = dist || 10;

    // attach to the parent of the main bridle div
    var citrusContainer = $('svg.citrus-charts').closest('div').get(0);

    container
      .html(content)
      .css({left: -1000, top: -1000, opacity: 0})
      .appendTo(citrusContainer);

    var height = container.outerHeight();
    var width = container.outerWidth();
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var scrollTop = $('body').scrollTop();
    var left, top;

    //TODO: implement other gravities
    switch (gravity) {
      case 'e':
      case 'w':
      case 'n':
        left = pos[0] - (width / 2);
        top = pos[1] - (height + dist);
        if (left < 0) {left = 5;}
        if (left + width > windowWidth) {left = windowWidth - width - 5;}
        if (scrollTop + windowHeight < top + height) {top = pos[1] - height - dist;}
        break;
      case 's':
        left = pos[0] - (width / 2);
        top = pos[1] - height - dist;
        if (left < 0) { left = 5; }
        if (left + width > windowWidth) { left = windowWidth - width - 5; }
        if (scrollTop > top) { top = pos[1] + dist; }
        break;
    }

    container
        .css({
          position: 'fixed',
          left: left + 'px',
          top: top + 'px',
          'background-color' : 'rgba(10, 10, 10, 0.3)',
          padding: '0px 10px',
          opacity: 1
        });
  },

  cleanup : function() {
    var tooltips = $('.citrus-charts.tooltip');

    // remove right away, but delay the show with css
    tooltips.css({
        'transition-delay': '0 !important',
        '-moz-transition-delay': '0 !important',
        '-webkit-transition-delay': '0 !important'
    });

    tooltips.css('opacity',0);

    setTimeout(function() {
      tooltips.remove();
    }, 500);
  }

};

module.exports = tooltip;});
