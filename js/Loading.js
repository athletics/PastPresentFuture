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
            .on( 'StateManager:LoadingProgress', onLoadingProgress )
            .on( 'StateManager:LoadingReveal', reveal )
            .on( 'StateManager:LoadingComplete', hide );

    }

    /**
     * ProgressEvent callback.
     *
     * @todo   There are issues when the response is gzipped.
     * @todo   Should this be removed?
     *
     * @param  {Object} event
     * @param  {Object} options
     */
    function onLoadingProgress( event, options ) {

        var percentComplete = 0,
            total = options.event.target.getResponseHeader( 'X-Content-Length' )
        ;

        if ( ! total ) {
            return;
        }

        percentComplete = options.event.loaded / total;

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