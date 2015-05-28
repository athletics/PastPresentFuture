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
            './Util',
            './Config',
            './State'
        ], function ( $, Util, Config, State ) {
            return factory( window, $, Util, Config, State );
        } );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            window,
            require( 'jquery' ),
            require( './Util' ),
            require( './Config' ),
            require( './State' )
        );

    } else {

        window.StateManager = window.StateManager || {};

        window.StateManager.Ajax = factory(
            window,
            window.jQuery,
            window.StateManager.Util,
            window.StateManager.Config,
            window.StateManager.State
        );

    }

} ( window, function ( window, $, Util, Config, State ) {

    'use strict';

    var name = 'Ajax',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        largestDownloadedLength = 0,
        request = {},
        $window = $( window ),
        Options = null
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   loadAjax( options )
    *       Makes an ajax request, handles response.
    */

    function loadAjax( options ) {

        if ( typeof options === 'undefined' ) {
            return false;
        }

        if ( typeof options.url === 'undefined' ) {
            debug( name + ': loadAjax: ERROR: No url defined.' );
            return false;
        }

        Options = options;

        var browserSupportsXhr2 = ( window.ProgressEvent && window.FormData ) ? true : false,
            trackProgress = ( typeof options.trackProgress !== 'undefined' ) ? options.trackProgress : false
        ;

        request.url = options.url;

        if ( browserSupportsXhr2 && trackProgress ) {

            request.xhr = setRequestXhr;

        }

        // request type
        request.type = ( typeof options.type !== 'undefined' ) ? options.type : 'get';

        // data sent to the server
        request.data = ( typeof options.data !== 'undefined' ) ? options.data : {};

        // are we expecting a particular data type from the server?
        if ( typeof options.dataType !== 'undefined' ) {
            request.dataType = options.dataType;
        }

        // timeout params; default to 20 seconds
        request.timeout = ( typeof options.timeout !== 'undefined' ) ? options.timeout : ( 20 * 1000 );

        // define error default, augment with callback
        request.error = setRequestError;

        request.disableAfterSuccess = ( typeof options.disableAfterSuccess !== 'undefined' ) ? options.disableAfterSuccess : false;

        // define success default, augment with callback
        request.success = setRequestSuccess;

        // finally, make request
        $.ajax( request );

    }

    function onUploadProgress( event ) {
        $window.trigger(
            'StateManager.LoadingProgress',
            {
                event: event,
                type: 'upload'
            }
        );
    }

    function onDownloadProgress( event ) {

        if ( event.loaded > largestDownloadedLength ) {
            largestDownloadedLength = event.loaded;
        }
        $window.trigger(
            'StateManager.LoadingProgress',
            {
                event: event,
                type: 'download'
            }
        );
    }

    function setRequestXhr() {

        var thisXhr = new window.XMLHttpRequest();

        //Upload progress
        thisXhr.upload.addEventListener(
            'progress',
            onUploadProgress,
            false
        );

        //Download progress
        thisXhr.addEventListener(
            'progress',
            onDownloadProgress,
            false
        );

        return thisXhr;

    }

    function setRequestError( event, textStatus, errorThrown ) {
        debug( name + ': error loading: ' + request.url );
        debug( name + ': error textStatus: ' + textStatus );
        debug( name + ': error errorThrown: ' + errorThrown );

        if ( typeof Options.error !== 'undefined' ) {
            Options.error( event, textStatus, errorThrown );
        }
    };

    function setRequestSuccess( data, textStatus, xhr ) {

        if ( data.length < largestDownloadedLength ) {
            largestDownloadedLength = data.length;
        }

        if ( typeof Options.success !== 'undefined' ) {
            Options.success( data );
        }

    }

    /**
     * Responsible for processing HTML content coming off the server.
     * @param  {String} data Full page HTML blob
     * @return {}      [description]
     */
    function parseHtml( data ) {

        var marker = Config.get( 'content' ),
            $data
        ;

        data = $.parseHTML( data, document, true );
        $data = $( data );

        return $data.filter( marker ).add( $data.find( marker ) );

    }

    function parseTitle( data ) {

        var $data,
            titles
        ;

        data = $.parseHTML( data.match( /<head[^>]*>([\s\S.]*)<\/head>/i )[0], document, true );
        $data = $( data );

        titles = $data.filter( 'title' );

        return titles.last().text();

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function getElementLinks( element ) {

        var items = $.grep( element.find( 'a' ), function ( element, index ) {

            var url = $( element ).attr( 'href' ) || '';

            if ( url.indexOf( 'mailto:' ) !== -1 ) {
                return false;
            // } else if ( url.indexOf( 'localhost' ) !== -1 ) {
            //     return true;
            // } else if ( url.indexOf( ':' ) !== -1 ) {
            //     return false;
            }

            return true;

        } );

        return items;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   ajaxifyLinks( $target )
    *       Hijacks links
    */

    function ajaxifyLinks( $target ) {

        // Prepare
        var $this = $target,
            elementLinks = getElementLinks( $this )
        ;

        // Ajaxify
        $.each( elementLinks, function () {

            var $this = $( this );

            $this.on( 'click.' + name, function ( event ) {

                event.preventDefault();

                // Prepare
                var $this = $( this ),
                    url = Util.fullyQualifyUrl( $this.attr( 'href' ) ),
                    title = null,
                    scrollTarget = null
                ;

                // Continue as normal for cmd clicks etc
                if ( event.which === 2 || event.metaKey ) {
                    return true;
                }

                if ( typeof $this.attr( 'title' ) !== 'undefined' ) {
                    title = $this.attr( 'title' );
                }

                if ( typeof $this.data( 'scroll-target' ) !== 'undefined' ) {
                    scrollTarget = $this.data( 'scroll-target' );
                }

                // Ajaxify this link
                State.pushState(
                    title,
                    url,
                    {
                        scrollTarget: scrollTarget,
                        scrollPos: parseInt( $( document ).scrollTop(), 10 ),
                        url: url
                    }
                );

                $window.trigger( 'StateManager.GotoUrl', url );

                $this.addClass( 'ajax-initialized' );

            } );

            $this.addClass( 'ajax-initialized' );

        } );

        // Chain
        return $this;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        loadAjax: loadAjax,
        parseHtml: parseHtml,
        parseTitle: parseTitle,
        ajaxifyLinks: ajaxifyLinks
    };

} ) );