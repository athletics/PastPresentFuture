/**
 * AJAX + pushState
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery',
            './Util',
            './Config',
            './Ajax',
        ], function ( $, Util, Config, Ajax ) {
            return factory( window, $, Util, Config, Ajax );
        } );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            window,
            require( 'jquery' ),
            require( './Util' ),
            require( './Config' ),
            require( './Ajax' )
        );

    } else {

        window.PastPresentFuture = window.PastPresentFuture || {};

        window.PastPresentFuture.Manager = factory(
            window,
            window.jQuery,
            window.PastPresentFuture.Util,
            window.PastPresentFuture.Config,
            window.PastPresentFuture.Ajax
        );

    }

} ( window, function ( window, $, Util, Config, Ajax ) {

    'use strict';

    var initialized = false,
        history = window.history,
        mode = 'traditional',
        $contentHolder,
        $ajaxContainer,
        $window = $( window ),
        $body = $( 'body' ),
        initialPop = true,
        prefetchCache = {
            list: [],
            limit: null
        },
        ajaxCache = {
            list: [],
            limit: null
        },
        ajaxQueue = []
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        if ( initialized ) {
            return;
        }

        mode = Util.getMode();
        prefetchCache.limit = Config.get( 'prefetchCacheLimit' );
        ajaxCache.limit = Config.get( 'ajaxCacheLimit' );

        setWrappers();

        if ( ! $contentHolder.length ) {
            return;
        }

        initHistory();
        initState( { isInitLoad: true } );
        ajaxEventListener();

        initialized = true;

    }

    /**
     * Ajaxify links and add popstate event listener.
     */
    function initHistory() {

        if ( mode === 'traditional' ) {
            return;
        }

        Ajax.ajaxifyLinks( $body );

        $window.on( 'popstate', function ( event ) {

            // Don't reload the current page if the popstate event is empty
            if ( initialPop ) {
                return;
            }

            $window.trigger( 'PastPresentFuture:PopState', event );

            gotoUrl( Util.currentStateUrl(), {
                popstate: true
            } );

        } );

    }

    /**
     * Initializes whatever state has been loaded.
     * Both on page load or on a history push.
     *
     * @param  {Object} options
     */
    function initState( options ) {

        options = options || {};

        options = $.extend( {
            isInitLoad: false,
            title:      document.title
        }, options );

        if ( ! options.isInitLoad ) {
            Util.setDocumentTitle( options.title );
            setWrappers();

            $window.trigger( 'PastPresentFuture:RecordPageview', {
                url:   Util.currentStateUrl(),
                title: options.title
            } );
        }

        prefetchUpcomingUrls();

        $window.trigger( 'PastPresentFuture:AfterInitState' );

    }

    /**
     * Loop through anchor tags with the prefetch data attribute.
     */
    function prefetchUpcomingUrls() {

        if ( mode === 'traditional' ) {
            return;
        }

        $( 'a[data-prefetch]' ).each( function ( index ) {

            var url = $( this ).attr( 'href' );

            // make sure we don't reload the page we're on
            if ( url === Util.currentStateUrl() ) {
                return;
            }

            setTimeout( function () {
                prefetchUrl( url );
            }, 50 * ( index + 1 ) );

        } );

    }

    /**
     * Make sure the correct wrappers are selected
     * regardless of when the function is initialized.
     */
    function setWrappers() {

        $contentHolder = $( Config.get( 'content' ) ).first();
        $ajaxContainer = $( Config.get( 'ajaxContainer' ) ).first();

        if ( Config.get( 'content' ) !== Config.get( 'ajaxContainer' ) ) {

            $window.trigger( 'PastPresentFuture:BeforeTransition', {
                contentHolder: $contentHolder,
                ajaxContainer: $ajaxContainer
            } );

        }

    }

    /**
     * Inserts new data into the DOM.
     * Binds AJAX events and sets body classes.
     *
     * @param  {Object} event
     * @param  {Object} data
     */
    function renderUrl( event, data ) {

        data.prevBodyClasses = $body.attr( 'class' );

        data.pageConfig = data.data.attr( 'data-page-config' );

        $ajaxContainer.html( data.data.html() );

        Ajax.ajaxifyLinks( $ajaxContainer );

        $body.removeClass().addClass( data.classes );

        if ( Config.get( 'content' ) !== Config.get( 'ajaxContainer' ) ) {

            $window.trigger( 'PastPresentFuture:AnimateTransition', data );

        } else {

            initState( data );

        }

    }

    /**
     * Toggles whether we're waiting for content to load.
     *
     * @param  {Boolean} isLoading
     */
    function toggleLoading( isLoading ) {

        if ( isLoading ) {

            // reveal loading state
            $window.trigger( 'PastPresentFuture:LoadingReveal' );

        } else {

            // hide loading state
            $window.trigger( 'PastPresentFuture:LoadingComplete' );

        }

    }

    /**
     * Handles loading of a particular url, then moves along to rendering.
     *
     * @param  {String} url
     * @param  {Object} options
     */
    function gotoUrl( url, options ) {

        options = options || {};
        options = $.extend( { url: url, popstate: false }, options );

        // Do not navigate to the current URL.
        if ( window.location.href === Util.getAbsoluteUrl( url ) && ! options.popstate ) {
            $window.trigger( 'PastPresentFuture:ResetPage' );
            return;
        }

        $window
            .off( 'PastPresentFuture:FetchedData' )
            .on( 'PastPresentFuture:FetchedData', function ( event, data ) {

                // Only proceed for currently request url.
                if ( data.url !== url ) {
                    return;
                }

                if ( ! options.popstate ) {
                    // history.pushState has to happen before rendering.
                    // Otherwise the page title in the history gets messed up.
                    $window.trigger( 'PastPresentFuture:PushState', options );
                }

                $window.trigger( 'PastPresentFuture:RenderUrl', data );

                toggleLoading( false );

                // Unbind window event.
                $( this ).off( 'PastPresentFuture:FetchedData' );

            } );

        var data = getUrlData( {
            url: url,
            afterAjaxLoad: function ( data, textStatus, xhr ) {

                // save the new data to the cache
                data = saveCacheData( ajaxCache, xhr.requestUrl, data );

                $window.trigger( 'PastPresentFuture:FetchedData', data );

            }
        } );

        // Waiting on an ajax request to be completed.
        if ( 'loading' in data ) {
            toggleLoading( true );
        }

    }

    /**
     * Returns html data for a particular url. This data may be cached already.
     * If not we make an AJAX call to load the data.
     *
     * @param  {Object} options Includes: url, isPrefetch
     * @return {Object}         Trigger the loading function
     */
    function getUrlData( options ) {

        var trackProgress = true,
            data = {}
        ;

        if ( data = checkCacheForData( ajaxCache.list, options.url ) ) {
            return $window.trigger( 'PastPresentFuture:FetchedData', data );
        }

        if ( data = checkCacheForData( prefetchCache.list, options.url ) ) {
            return $window.trigger( 'PastPresentFuture:FetchedData', data );
        }

        if ( data = checkCacheForData( ajaxQueue, options.url ) ) {
            return { loading: true };
        }

        // Disable tracking progress if this is a prefetch request
        if ( options.isPrefetch ) {
            trackProgress = false;
        }

        ajaxQueue.push( { url: options.url } );

        // if we reach this point, the data wasn't in the cache. make ajax request.
        Ajax.loadAjax( {
            url: options.url,
            dataType: 'html',
            trackProgress: trackProgress,
            success: options.afterAjaxLoad,
            error: function () {
                location.reload( true );
            }
        } );

        return { loading: true };

    }

    /**
     * Prefetches URLs we think the user is likely to load in the cache.
     *
     * @param {String} url Marker to decide which pages should be cached
     */
    function prefetchUrl( url ) {

        if ( mode === 'traditional' ) {
            return;
        }

        getUrlData( {
            url: url,
            isPrefetch: true,
            afterAjaxLoad: function ( data ) {
                removeUrlFromAjaxQueue( url );
                data = saveCacheData( prefetchCache, url, data );

                $window.trigger( 'PastPresentFuture:FetchedData', data );
            }
        } );

    }

    /**
     * Check supplied cache array for a match against the URI
     *
     * @param  {Array} cacheList     prefetch, ajax, or ajaxQueue cache
     * @param  {String} url          used to identify the correct data in the loop
     * @return {Object|Boolean} data cacheList data if present or false
     */
    function checkCacheForData( cacheList, url ) {

        var data = false;

        if ( ! cacheList.length ) {
            return data;
        }

        for ( var i = 0; i < cacheList.length; i++ ) {

            if ( cacheList[i].url !== url ) {
                continue;
            }

            data = cacheList[i];
            break;

        }

        return data;

    }

    /**
     * A function for passing different cache arrays with url and data to save.
     *
     * @param  {Array}  cacheType prefetch or ajax cache
     * @param  {String} url       Page URI to cache
     * @param  {String} data      Data from page to be cached, it get's parsed first
     */
    function saveCacheData( cacheType, url, data ) {

        var cache = {
            url:     url,
            title:   Ajax.parseTitle( data ),
            data:    Ajax.parseHtml( data ),
            classes: data.match(/body\sclass=['|"]([^'|"]*)['|"]/)[1]
        };

        cacheType.list.push( cache );

        // check if cacheType has grown too large
        if ( cacheType.list.length > cacheType.limit ) {

            // remove the oldest data
            cacheType.list = $.grep( cacheType.list, function ( element, index ) {
                return index !== 0;
            } );

        }

        return cache;

    }

    /**
     * Loop through the queue and remove the url from the array.
     *
     * @param  {String} url string to remove from the queue
     */
    function removeUrlFromAjaxQueue( url ) {

        // remove url from ajaxQueue
        ajaxQueue = $.grep( ajaxQueue, function ( element, index ) {
            return element.url !== url;
        } );

    }

    /**
     * Add event listeners to avoid exposing functions.
     */
    function ajaxEventListener() {

        $window
            .on( 'PastPresentFuture:GotoUrl', function ( event, url, options ) {

                initialPop = false;

                gotoUrl( url, options );

            } )
            .on( 'PastPresentFuture:RenderUrl', renderUrl )
            .on( 'PastPresentFuture:InitState', function ( event, data ) {
                initState( data );
            } )
        ;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );