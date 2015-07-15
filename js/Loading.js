/**
 * Tracks loading state.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery',
            './Util'
        ], function ( $, Util ) {
            return factory( window, $, Util );
        } );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            window,
            require( 'jquery' ),
            require( './Util' )
        );

    } else {

        window.StateManager = window.StateManager || {};

        window.StateManager.Loading = factory(
            window,
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( window, $, Util ) {

    var name = 'Loading',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window ),
        $html = $( 'html' )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Binds loading events.
     */
    function init() {

        $window
            .on( 'StateManager:LoadingReveal', reveal )
            .on( 'StateManager:LoadingComplete', hide );

    }

    function reveal() {
        $html.addClass( 'is-loading-ajax' );
    }

    function hide() {
        $html.removeClass( 'is-loading-ajax' );
    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );