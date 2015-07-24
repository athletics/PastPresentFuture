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

        window.PastPresentFuture = window.PastPresentFuture || {};

        window.PastPresentFuture.Loading = factory(
            window,
            window.jQuery,
            window.PastPresentFuture.Util
        );

    }

} ( window, function ( window, $, Util ) {

    var $window = $( window ),
        $html = $( 'html' )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Binds loading events.
     */
    function init() {

        $window
            .on( 'PastPresentFuture:LoadingReveal', reveal )
            .on( 'PastPresentFuture:LoadingComplete', hide );

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