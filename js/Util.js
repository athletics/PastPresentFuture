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

    var name = 'Util',
        debugEnabled = true,
        debug
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * A console.log wrapper with the correct line numbers.
     *
     * @see    https://gist.github.com/bgrins/5108712
     * @see    https://developer.mozilla.org/en-US/docs/Web/API/Console/log
     * @param  {Mixed}
     * @return {String}
     */
    var debug = function () {

        if ( typeof console !== 'object' || ! console.log ) {
            return;
        }

        return console.log.bind( console );

    } ();

    /**
     * Get a full url from a relative url.
     *
     * @todo   Remove hardcoded localhost URLs.
     * @todo   Remove bypass.
     *
     * @param  {String} url
     * @return {String} url
     */
    function fullyQualifyUrl( url ) {

        var bypass = true;

        if ( bypass ) {
            return url;
        }

        if ( url.indexOf( 'http://' ) === -1 &&
            url.indexOf( 'http://localhost:8000/' ) === -1 &&
            url.substring( 0, 1 ) === '/' ) {

            url = 'http://localhost:8000/' + url;

        }

        // add trailing slash if need be
        if ( url === 'http://localhost:8000/' &&
            url.substring( url.length - 1, url.length ) !== '/' ) {

            url += '/';

        }

        return url;

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

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        debug:            debug,
        fullyQualifyUrl:  fullyQualifyUrl,
        setDocumentTitle: setDocumentTitle,
        getMode:          getMode
    };

} ) );