/**
 * Manager.js
 *
 * @param  {Object} window    Window
 * @param  {[type]} factory [description]
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

        window.StateManager = window.StateManager || {};

        window.StateManager.Manager = factory(
            window,
            window.jQuery,
            window.StateManager.Util,
            window.StateManager.Config,
            window.StateManager.Ajax
        );

    }

} ( window, function ( window, $, Util, Config, Ajax ) {

    'use strict';

    // define any private variables
    var name = 'Manager',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        initialized = false,
        history = null,
        mode = 'traditional', // will either be 'dynamic' or 'traditional'
        $contentHolder,
        $window = $( window ),
        $body = $( 'body' ),
        currentPageConfig = {},
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

        prefetchCache.limit = Config.get( 'prefetchCacheLimit' );
        ajaxCache.limit = Config.get( 'ajaxCacheLimit' );

        $contentHolder = $( Config.get( 'content' ) ).first();

        if ( $contentHolder.length < 1 ) {
            return;
        }

        initHistory();

        initState({
            isInitLoad: true
        });

        ajaxEventListener();

        initialized = true;

    }

    /**
     * Set up history object and add popstate event listener
     */
    function initHistory() {

        // set up our private alias to the history.js adapter
        history = window.history;

        mode = Util.getMode();

        if ( mode === 'traditional' ) {
            return;
        }

        Ajax.ajaxifyLinks( $body );

        // bind to statechanges
        $window.on( 'popstate', function () {

            gotoUrl(
                history.state.url,
                {}
            );

            $window.trigger( 'StateManager.StateChange' );

        } );

    }

    /**
     * Initializes whatever state has been loaded
     * (either on page load or on a history push.)
     *
     * @param  {Object} options
     */
    function initState( options ) {

        var isInitLoad = false,
            stateInfo = history.state,
            // pageConfig = $( Config.get( 'content' ) ).data( 'config' ),
            pageTitle = 'title' in options ? options.title : document.title
        ;

        if ( typeof options !== 'undefined' && typeof options.isInitLoad !== 'undefined' ) {
            isInitLoad = options.isInitLoad
        }

        // if ( typeof pageConfig === 'undefined' ) {
        //     return;
        // }

        // if ( pageConfig === null ) {
        //     return;
        // }

        // check to see if this page relies on any custom body classes
        // if ( typeof pageConfig.bodyClass !== 'undefined' ) {
        //     $body.addClass( pageConfig.bodyClass );
        // }

        Util.setDocumentTitle( pageTitle );

        if ( ! isInitLoad ) {
            $window.trigger(
                'EventTrackAjax.RecordPageview',
                {
                    url: stateInfo.url,
                    title: pageTitle
                }
            );
        }

        // update currentPageConfig
        // currentPageConfig = pageConfig;

        prefetchUpcomingUrls();

        $window.trigger( 'StateManager.AfterInitState' );

    }

    /**
     * Loop through anchor tags with data-prefetch added
     */
    function prefetchUpcomingUrls() {

        if ( mode !== 'dynamic' ) {
            return false;
        }

        var currentState = history.state;

        // stagger prefetch of additional URLs
        $( 'a[data-prefetch]' ).each( function ( index ) {

            // if ( index > prefetchCache.limit ) {
            //     return false;
            // }

            var thisHref = Util.fullyQualifyUrl( $( this ).attr( 'href' ) );

            // make sure we don't reload the page we're on
            if ( thisHref !== currentState.url ) {
                setTimeout( function () {
                    prefetchUrl( thisHref );
                }, 50 * ( index + 1 ) );
            }

        });
    }

    /**
     * Inserts url data to the DOM. Called by gotoUrl().
     *
     * @param  {Object} data
     * @param  {Object} options
     */
    function renderUrl( data, options ) {

        // drop in image_box HTML
        $contentHolder.html( data.data );

        Ajax.ajaxifyLinks( $contentHolder );

        initState();

    }

    /**
     * Toggles whether we're waiting for content to load.
     *
     * @param  {Boolean} isLoading
     */
    function toggleLoading( isLoading ) {

        if ( isLoading ) {

            // reveal loading state
            $window.trigger( 'StateManager.LoadingReveal' );

        } else {

            // hide loading state
            $window.trigger( 'StateManager.LoadingComplete' );

        }

    }

    /**
     * Handles loading of a particular url, then moves along to rendering.
     *
     * @param  {String} url
     * @param  {Object} options
     */
    function gotoUrl( url, options ) {

        // set empty options if they don't exist
        if ( typeof options === 'undefined' ) {
            options = {};
        }

        var thisUrl = url,
            thisOptions = options,
            data = getUrlData({
                url: thisUrl,
                afterAjaxLoad: function ( data ) {
                    // this function only fires if we need to wait for
                    // an ajax load.

                    // record what the last url had been
                    var lastUrlInQueue = ajaxQueue[ ajaxQueue.length - 1 ].url;

                    removeUrlFromAjaxQueue( thisUrl );

                    // save the new data to the cache
                    saveCacheData( ajaxCache, thisUrl, data );

                    // only proceed if this was the last url in the queue
                    if ( lastUrlInQueue == thisUrl ) {

                        // now that we have the data, recall gotoUrl
                        gotoUrl( thisUrl, thisOptions );

                    } else {
                        debug( '******* still loading: ' + lastUrlInQueue );
                    }
                }
            } )
        ;

        // did we get data back, or are we waiting on an ajax request to be completed?
        if ( typeof data.loading !== 'undefined' && data.loading ) {

            toggleLoading( true );

            return false;

        }

        // if we reached this point, we have the data we need and can proceed.
        toggleLoading( false );

        renderUrl( data, options );

    }

    /**
     * Returns html data for a particular url. This data may be cached already. If not
     *       we make an AJAX call to load the data.
     *
     * @param  {Object} options Includes: url, isPrefetch
     * @return {Object}         Trigger the loading function
     */
    function getUrlData( options ) {

        var thisUrl = options.url,
            trackProgress = true,
            data
        ;

        if ( data = checkCacheForData( ajaxCache.list, options.url ) ) {
            return data;
        }

        if ( data = checkCacheForData( prefetchCache.list, options.url ) ) {
            return data;
        }

        if ( data = checkCacheForData( ajaxQueue, options.url ) ) {
            return {
                loading: true
            };
        }

        // Disable tracking progress if this is a prefetch request
        if ( options.isPrefetch ) {
            trackProgress = false;
        }

        ajaxQueue.push({ url: thisUrl });

        // if we reach this point, the data wasn't in the cache. make ajax request.
        Ajax.loadAjax({
            url: thisUrl,
            dataType: 'html',
            trackProgress: trackProgress,
            success: options.afterAjaxLoad,
            error: function () {

            }
        });

        return {
            loading: true
        };

    }

    /**
     * Prefetches URLs we think the user is likely to load in the cache.
     *
     * @param  {String} url Marker to decide which pages should be cached
     */
    function prefetchUrl( url ) {

        if ( mode === 'traditional' ) {
            return;
        }

        // no, let's make the request
        getUrlData({
            url: url,
            isPrefetch: true,
            afterAjaxLoad: function ( data ) {
                removeUrlFromAjaxQueue( url );
                saveCacheData( prefetchCache, url, data );
            }
        });
    }

    /**
     * Check supplied cache array for a match against the URI
     *
     * @param  {Array} cacheList  prefetch, ajax, or ajaxQueue cache
     * @param  {String} url       used to identify the correct data in the loop
     * @return {Object}           cacheList data if present
     * @return {Boolean}          false if no data in cache
     */
    function checkCacheForData( cacheList, url ) {

        if ( cacheList.length > 0 ) {
            for ( var i = 0; i < cacheList.length; i++ ) {
                if ( cacheList[i].url === url ) {
                    return cacheList[i];
                }
            }
        }

        return false;

    }

    /**
     * A function for passing different cache arrays with url and data to save
     *
     * @param  {Array} cacheType  prefetch or ajax cache
     * @param  {String} url       Page URI to cache
     * @param  {String} data      Data from page to be cached, it get's parsed first
     */
    function saveCacheData( cacheType, url, data ) {

        var cacheObj = {
            url: url,
            data: Ajax.parseHtml( data )
        };

        cacheType.list.push( cacheObj );

        // check if cacheType has grown too large
        if ( cacheType.list.length > cacheType.limit ) {
            // remove the oldest data
            debug( 'over cache limit of ' + cacheType.limit + ', removing oldest data' );

            cacheType.list = $.grep( cacheType.list, function ( element, index ) {
                return index !== 0;
            } );

        }

    }

    /**
     * Loop through the queue and remove the url from the array
     *
     * @param  {String} url  string to remove from the queue
     */
    function removeUrlFromAjaxQueue( url ) {

        // remove url from ajaxQueue
        ajaxQueue = $.grep( ajaxQueue, function ( element, index ) {
            return element.url !== url;
        } );

    }

    /**
     * Add any Listeners to avoid exposing functions
     */
    function ajaxEventListener() {

        $window.on( 'StateManager.GotoUrl', function ( event, url ) {

            gotoUrl( url, {} );

        } );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );