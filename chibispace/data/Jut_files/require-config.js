                                            /* noautorequire */

/* Need to tell jshint that we can write to `require` in this one case */
/* globals require:true */

/*
 * XXX/demmer this is crap. come up with something better
 */
if (window && (window.require === undefined)) {
    require = {};
    require.config = function(config) {
        require = config;
    };
}

require.config({
    paths: {
        underscore : 'components/underscore/underscore',
        backbone   : 'components/backbone/backbone',
        backbone_forms: 'components/backbone-forms/distribution/backbone-forms',
        backbone_collectionview: 'components/backbone.collectionView/dist/backbone.collectionView',
        bootstrap_dropdown : 'components/bootstrap/js/dropdown',
        bootstrap_collapse : 'components/bootstrap/js/collapse',
        bootstrap_alert : 'components/bootstrap/js/alert',
        bootstrap_button : 'components/bootstrap/js/button',
        bootstrap_tooltip : 'components/bootstrap/js/tooltip',
        bootstrap_transition : 'components/bootstrap/js/transition',
        bootstrap_modal : 'components/bootstrap/js/modal',
        bootstrap_popover : 'components/bootstrap/js/popover',
        bootstrap_tab : 'components/bootstrap/js/tab',
        bootstrap_multiselect : 'components/bootstrap-multiselect/js/bootstrap-multiselect',
        jquery     : 'components/jquery/jquery',
        jquery_ui  : 'components/jquery-ui/ui/jquery-ui',
        d3         : 'components/d3/d3',
        'spin-js'  : 'components/spin.js/spin',
        crossfilter: 'components/crossfilter/crossfilter',
        dc         : 'components/dcjs/dc',
        text       : 'components/requirejs-text/text',
        chai       : 'components/chai/chai',
        handlebars : 'components/handlebars/handlebars',
        q          : 'components/q/q',
        postal     : 'components/postal.js/lib/postal',
        react: 'components/react/react',
        'react.backbone': 'components/react.backbone/react.backbone',
        phantomjs_shims: 'components/phantomjs-shims/index',
        'react-bootstrap': 'components/react-bootstrap/dist/react-bootstrap',
        'moment': 'components/momentjs/moment',

        // XXX/demmer these should be populated as part of grunt module_setup
        charts: 'applib/charts',
        core: 'lib/core',
        'jut-version': 'lib/jut-version',
        logger: 'lib/logger',
        require_utils: 'lib/require_utils',
        'request-wrapper': 'lib/request-wrapper',
        query: 'lib/query',
        cquery: 'lib/cquery'


    },
    shim : {
        handlebars: {
            exports: 'Handlebars'
        },
        underscore : {
            exports : '_'
        },
        backbone : {
            exports : 'Backbone',
            deps : ['jquery','underscore']
        },
        backbone_forms : {
            deps : ['backbone']
        },
        d3 : {
            exports : 'd3'
        },
        crossfilter : {
            exports : 'crossfilter'
        },
        dc : {
            exports : 'dc',
            deps    : ['d3', 'crossfilter']
        },
        bootstrap_tooltip : {
            deps: [ 'jquery' ]
        },
        bootstrap_modal : {
            deps: [ 'jquery' ]
        },
        bootstrap_popover: {
            deps: ['bootstrap_tooltip']
        },
        bootstrap_dropdown : {
            deps : ['jquery']
        },
        bootstrap_multiselect : {
            deps : ['jquery']
        },
        bootstrap_transition : {
            deps : ['jquery']
        },
        bootstrap_collapse: {
            deps: ['bootstrap_transition']
        },
        react: {
            deps: ['phantomjs_shims']
        },
        'react.backbone': {
            deps: ['react']
        },
        'react-bootstrap': {
            deps: ['react']
        }
    },
    baseUrl: '/src'
});
    