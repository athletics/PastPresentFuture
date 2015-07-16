/**
 * Shared utilities.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery'
        ], function ( $ ) {
            return factory( window, $ );
        } );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            window,
            require( 'jquery' )
        );

    } else {

        window.StateManager = window.StateManager || {};

        window.StateManager.Util = factory(
            window,
            window.jQuery
        );

    }

} ( window, function ( window, $ ) {

    'use strict';

    /**
     * Get the current state URL from the history.
     *
     * @return {String}
     */
    function currentStateUrl() {

        var history = window.history;

        if ( history.state !== null ) {
            return history.state.url;
        }

        return window.location.href;

    }

    /**
     * Clever way to get an absolute URL.
     *
     * @param  {String} url Either absolute or relative.
     * @return {String}     Definitely absolute.
     */
    function getAbsoluteUrl( url ) {

        var a = document.createElement( 'a' );

        a.href = url;

        return a.href;

    }

    /**
     * Does the browser support window.history and push state.
     *
     * @return {String} Browser mode
     */
    function getMode() {

        if ( ! window.history || ! window.history.pushState || ! window.history.replaceState ) {
            return 'traditional';
        }

        return 'dynamic';

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
     * Sanitize and set the document title.
     *
     * @param {String} input
     */
    function setDocumentTitle( input ) {

        var entities = {
            '&amp;':   '&',
            '&lt;':    '<',
            '&gt;':    '>',
            '&#8211;': '–', // en dash
            '&#8212;': '—', // em dash
            '&#8216;': '‘', // left single quotation mark
            '&#8217;': '’', // right single quotation mark
            '&#8220;': '“', // left double quotation mark
            '&#8221;': '”', // right double quotation mark
            '&#8226;': '•', // bullet
            '&#8230;': '…'  // ellipsis
        };

        for ( var entity in entities ) {
            if ( ! entities.hasOwnProperty( entity ) ) {
                continue;
            }

            input = input.replace( new RegExp( entity, 'g' ), entities[ entity ] );
        }

        document.title = input;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        currentStateUrl:  currentStateUrl,
        getAbsoluteUrl:   getAbsoluteUrl,
        getMode:          getMode,
        getScrollTarget:  getScrollTarget,
        setDocumentTitle: setDocumentTitle
    };

} ) );