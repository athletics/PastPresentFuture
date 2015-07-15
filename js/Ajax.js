/**
 * Handles the AJAX load of local links in the DOM.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery',
            './Util',
            './Config'
        ], function ( $, Util, Config ) {
            return factory( window, $, Util, Config );
        } );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            window,
            require( 'jquery' ),
            require( './Util' ),
            require( './Config' )
        );

    } else {

        window.StateManager = window.StateManager || {};

        window.StateManager.Ajax = factory(
            window,
            window.jQuery,
            window.StateManager.Util,
            window.StateManager.Config
        );

    }

} ( window, function ( window, $, Util, Config ) {

    'use strict';

    var largestDownloadedLength = 0,
        $window = $( window ),
        Options = null
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Makes an ajax request, handles response.
     *
     * @param  {Object} options
     */
    function loadAjax( options ) {

        options = options || {};

        if ( ! 'url' in options ) {
            return;
        }

        var request = $.extend( {
            data:                {},
            dataType:            'html',
            disableAfterSuccess: false,
            timeout:             ( 20 * 1000 ), // 20 seconds
            type:                'get'
        }, options );

        Options = options;

        request.error = setRequestError;
        request.success = setRequestSuccess;

        request.beforeSend = function ( xhr ) {
            xhr.requestUrl = request.url;
        };

        $.ajax( request );

    }

    /**
     * Ajax error callback.
     *
     * @param {jqXHR}  jqXHR
     * @param {String} textStatus
     * @param {String} errorThrown
     */
    function setRequestError( event, textStatus, errorThrown ) {

        if ( ! 'error' in Options ) {
            return;
        }

        Options.error( event, textStatus, errorThrown );

    }

    /**
     * Ajax success callback.
     *
     * @param {Mixed}  data
     * @param {String} textStatus
     * @param {jqXHR}  jqXHR
     */
    function setRequestSuccess( data, textStatus, jqXHR ) {

        if ( data.length < largestDownloadedLength ) {
            largestDownloadedLength = data.length;
        }

        if ( ! 'success' in Options ) {
            return;
        }

        Options.success( data, textStatus, jqXHR );

    }

    /**
     * Responsible for processing HTML content coming off the server.
     *
     * @param  {String} data Full page HTML blob
     * @return {Array}       jQuery element
     */
    function parseHtml( data ) {

        data = $.parseHTML( data, document, true );

        var marker = Config.get( 'content' ),
            $data = $( data )
        ;

        return $data.filter( marker ).add( $data.find( marker ) );

    }

    /**
     * Grab <title> from the <head>
     *
     * @param  {String} data
     * @return {String}      The new page title
     */
    function parseTitle( data ) {

        data = $.parseHTML( data.match( /<head[^>]*>([\s\S.]*)<\/head>/i )[0], document, true );

        var $data = $( data ),
            titles =$data.filter( 'title' )
        ;

        return titles.last().text();

    }

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get valid links to ajaxify.
     *
     * @param  {Array} $container
     * @return {Array} $validLinks
     */
    function getValidLinks( $container ) {

        var $validLinks = $.grep( $container.find( 'a' ), function ( link, index ) {

            var $link = $( link ),
                url = $link.attr( 'href' ) || '';

            // Intended for a new window.
            if ( $link.attr( 'target' ) === '_blank' ) {
                return false;
            }

            // Special link types.
            if ( url.indexOf( 'mailto:' ) !== -1 || url.indexOf( 'javascript:' ) !== -1 ) {
                return false;
            }

            // Not relative and doesn't have the same hostname.
            if ( url.indexOf( '//' ) !== -1 && url.indexOf( window.location.hostname ) === -1 ) {
                return false;
            }

            return true;

        } );

        return $validLinks;

    }

    /**
     * Hijacks local links.
     *
     * @param  {Array} $target
     * @return {Array} $target
     */
    function ajaxifyLinks( $target ) {

        var validLinks = getValidLinks( $target );

        $.each( validLinks, function () {

            $( this )
                .on( 'click.StateManager', function ( event ) {

                    // Continue as normal for cmd clicks etc
                    if ( event.which === 2 || event.metaKey ) {
                        return true;
                    }

                    var $this = $( this ),
                        url = $this.attr( 'href' )
                    ;

                    $window.trigger( 'StateManager:GotoUrl', [ url, {
                        url: url,
                        options: {
                            scrollPos: parseInt( $( document ).scrollTop(), 10 ),
                            scrollTarget: $this.data( 'scroll-target' ),
                            url: url
                        }
                    } ] );

                    event.preventDefault();

                } )
                .addClass( 'ajax-initialized' );

        } );

        return $target;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        loadAjax:     loadAjax,
        parseHtml:    parseHtml,
        parseTitle:   parseTitle,
        ajaxifyLinks: ajaxifyLinks
    };

} ) );