/**
 * Ajax.js
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
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

    // define any private variables
    var name = 'Loading',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window ),
        $html = $( 'html' )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        $window
            .on(
                'StateManager.LoadingReveal',
                reveal
            )
            .on(
                'StateManager.LoadingComplete',
                hide
            )
            .on(
                'StateManager.LoadingProgress',
                onLoadingProgress
            )
        ;

    }

    function onLoadingProgress( e, options ) {

        //debug(name + ': on_download_progress:');

        var percentComplete = 0,
            total = options.event.target.getResponseHeader( 'X-Content-Length' )
        ;

        if ( typeof total === 'undefined' || total === 0 ) {
            return;
        }

        percentComplete = options.event.loaded / total;

    }

    function reveal() {
        $html.addClass( 'is_loading_ajax' );
    }

    function hide() {
        $html.removeClass( 'is_loading_ajax' );
    }

    //////////////////////////////////////////////////////////////////////////////////////

    // return any public methods
    return {
        init: init
    };

} ) );