/**
 * Util.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.Util = factory(
            root.jQuery
        );

    }

} ( this, function factory( $ ) {

    'use strict';

    var name = 'Util',
        debugEnabled = true,
        debug
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        initArrayRemove();

    }

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

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Sets up a prototype for removing an element from an array
     */
    function initArrayRemove() {

        // Array Remove - By John Resig (MIT Licensed)
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function setDocumentTitle( input ) {

        document.title = htmlDecode( input );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function htmlDecode( input ) {

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

        return input;
    }

    //////////////////////////////////////////////////////////////////////////////////////

    function getMode() {

        if ( ! window.history && window.history.pushState && window.history.replaceState ) {
            return 'traditional';
        }

        return 'dynamic';

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init,
        debug: debug,
        fullyQualifyUrl: fullyQualifyUrl,
        setDocumentTitle: setDocumentTitle,
        getMode: getMode
    };

} ) );