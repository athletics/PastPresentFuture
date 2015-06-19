/**
 * State.js
 * @param  {[type]} root    [description]
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

    function init() {

        $window.on( 'StateManager:AfterInitState', newState );

        $window.on( 'StateManager:PushState', pushState );

    }

    /**
     * Decide where to focus the page after push state
     */
    function newState() {

        var state = window.history.state,
            scrollTarget = 0
        ;

        if ( state !== null && typeof state.scrollTarget !== 'undefined' && $( state.scrollTarget ).length > 0 )  {
            scrollTarget = $( state.scrollTarget ).first().offset().top;
        }

        if ( ! $( 'html' ).hasClass( 'initial-load' ) ) {

            $( 'html, body' )
                .stop()
                .animate({
                    'scrollTop' : scrollTarget
                }, 200 )
            ;

        } else {

            $( 'html' ).removeClass( 'initial-load' );

        }

        // trigger a scroll for good measure
        $window.trigger( 'WindowEvents.Scroll' );

    }

    /**
     * Handle how the page updates depending on the browser's use of history
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