/**
 * Push state into the browser history.
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

        window.StateManager.State = factory(
            window,
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( window, $, Util ) {

    'use strict';

    var name = 'State',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Bind pushState listeners.
     */
    function init() {

        $window
            .on( 'StateManager:AfterInitState', newState )
            .on( 'StateManager:PushState', pushState );

    }

    /**
     * Decide where to focus the page after push state.
     */
    function newState() {

        var scrollTarget = getScrollTarget();

        if ( ! $( 'html' ).hasClass( 'initial-load' ) ) {

            $( 'html, body' ).stop()
                .animate( {
                    scrollTop: scrollTarget
                }, 200 );

        } else {

            $( 'html' ).removeClass( 'initial-load' );

        }

    }

    /**
     * If a target is set in state, use its scroll position.
     *
     * @return {Integer} The top of the scrollTarget, default is 0.
     */
    function getScrollTarget() {

        var state = window.history.state || {};

        if ( ! 'scrollTarget' in state ) {
            return 0;
        }

        var $target = $( state.scrollTarget );

        if ( ! $target.length ) {
            return 0;
        }

        return $target.first().offset().top;

    }

    /**
     * Handle how the page updates depending on the browser's use of history.
     */
    function pushState( event, object ) {

        object = $.extend( {
            options: {
                url: object.url
            },
            title: ''
        }, object );

        if ( Util.getMode() === 'traditional' ) {

            window.location = object.url;

        } else {

            window.history.pushState(
                object.options,
                object.title,
                object.url
            );

            $window.trigger( 'StateManager:NewState' );

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init,
        pushState: pushState
    };

} ) );