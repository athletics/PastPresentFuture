/**
 * Handle browser history.pushState() method.
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

        window.PastPresentFuture.PushState = factory(
            window,
            window.jQuery,
            window.PastPresentFuture.Util
        );

    }

} ( window, function ( window, $, Util ) {

    'use strict';

    var $html = $( 'html' ),
        $htmlBody = $( 'html, body' ),
        $window = $( window )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Bind pushState listeners.
     */
    function init() {

        $window
            .on( 'PastPresentFuture:AfterInitState', newState )
            .on( 'PastPresentFuture:PushState', pushState )
        ;

    }

    /**
     * Decide where to focus the page after push state.
     */
    function newState() {

        var scrollTarget = Util.getScrollTarget();

        if ( ! $html.hasClass( 'initial-load' ) ) {

            $htmlBody.stop()
                .animate( {
                    scrollTop: scrollTarget
                }, 200 )
            ;

        } else {

            $html.removeClass( 'initial-load' );

        }

    }

    /**
     * Handle how the page updates depending on the browser's use of history.
     * @param  {Object} event  Passed from the trigger, unused
     * @param  {Object} object Contains options for pushState, Page Title, & Page URL
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

            $window.trigger( 'PastPresentFuture:NewState' );

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init,
        pushState: pushState
    };

} ) );