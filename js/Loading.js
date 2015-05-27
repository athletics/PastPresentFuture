/**
 * Ajax.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery',
            './Util'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.Loading = factory(
            root.jQuery,
            root.StateManager.Util
        );

    }

} ( this, function ( $, Util ) {

    // define any private variables
    var name = 'Loading',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window ),
        $html = $( 'html' ),
        $body = $( 'body' )
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
        $html.addClass( 'is-loading-ajax' );
    }

    function hide() {
        $html.removeClass( 'is-loading-ajax' );
        $body.css({ 'overflow': 'auto' });
    }

    //////////////////////////////////////////////////////////////////////////////////////

    // return any public methods
    return {
        init: init
    };

} ) );