/**
 * Util.js
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
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
     * Debug - console.log wrapper
     *
     * @param mixed obj
     */
    debug = function () {

        if ( ! debugEnabled ) {
            return;
        } else if ( typeof console !== 'object' || ! console.log ) {
            return;
        }

        return Function.prototype.bind.call( console.log, console );

    } ();

    //////////////////////////////////////////////////////////////////////////////////////

    function fullyQualifyUrl( url ) {

        var bypass = true;

        if ( bypass ) {
            return url;
        }

        if ( url.indexOf( 'http://' ) === -1 &&
            url.indexOf( 'http://localhost:8000/' ) === -1 &&
            url.substring( 0, 1 ) === '/') {

            url = 'http://localhost:8000/' + url;

        }

        // add trailing slash if need be
        if ( url === 'http://localhost:8000/' &&
            url.substring( url.length - 1, url.length ) !== '/' ) {

            url += '/';

        }

        return url;

    }

    /////////////////////////////////////////////////////////////////////////////////////

    function setDocumentTitle( input ) {

        var entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&#8211;': '–', //en dash
            '&#8212;': '—', //em dash
            '&#8216;': '‘', //left single quotation mark
            '&#8217;': '’', //right single quotation mark
            '&#8220;': '“', //left double quotation mark
            '&#8221;': '”', //right double quotation mark
            '&#8226;': '•', //bullet
            '&#8230;': '…'  //ellipsis
        };

        for ( var prop in entities ) {
            if ( entities.hasOwnProperty( prop ) ) {
                input = input.replace( new RegExp( prop, 'g' ), entities[prop] );
            }
        }

        document.title = input;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function getMode() {

        if ( ! window.history || ! window.history.pushState || ! window.history.replaceState ) {
            return 'traditional';
        }

        return 'dynamic';

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        debug: debug,
        fullyQualifyUrl: fullyQualifyUrl,
        setDocumentTitle: setDocumentTitle,
        getMode: getMode
    };

} ) );