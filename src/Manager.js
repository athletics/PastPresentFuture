/**
 * Manager.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
            'jquery',
            './Util',
            './Ajax'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' ),
            require( './Ajax' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.Manager = factory(
            root.jQuery,
            root.StateManager.Util,
            root.StateManager.Ajax
        );

    }

} ( this, function ( $, Util, Ajax ) {

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
            limit: 15
        },
        ajaxCache = {
            list: [],
            limit: 15
        },
        ajaxQueue = []
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        if ( initialized ) {
            return;
        }

        $contentHolder = $( '.page_content_holder' ).first();

        if ( $contentHolder.length < 1 ) {
            return;
        }

        initHistory();

        initState({
            isInitLoad : true
        });

        ajaxEventListener();

        initialized = true;

    }

    //////////////////////////////////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Initializes whatever state has been loaded
     * (either on page load or on a history push.)
     *
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    function initState( options ) {

        var isInitLoad = false,
            stateInfo = history.state,
            pageConfig = $( 'div.content' ).data( 'config' ),
            pageTitle = ''
        ;

        if ( typeof options !== 'undefined' && typeof options.isInitLoad !== 'undefined' ) {
            isInitLoad = options.isInitLoad
        }

        if ( typeof pageConfig === 'undefined' ) {
            return;
        }

        if ( pageConfig === null ) {
            return;
        }

        if ( typeof pageConfig.title !== 'undefined' ) {
            pageTitle = pageConfig.title;
        }

        // check to see if this page relies on any custom body classes
        if ( typeof pageConfig.bodyClass !== 'undefined' ) {
            $body.addClass( pageConfig.bodyClass );
        }

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
        currentPageConfig = pageConfig;

        prefetchUpcomingUrls();

        $window.trigger( 'StateManager.AfterInitState' );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function prefetchUpcomingUrls() {

        if ( mode !== 'dynamic' ) {
            return false;
        }

        var currentState = history.state;

        // stagger prefetch of additional URLs
        $( 'a[data-prefetch]' ).each( function ( index ) {

            if ( index > prefetchCache.limit ) {
                return false;
            }

            var thisHref = Util.fullyQualifyUrl( $( this ).attr( 'href' ) );

            // make sure we don't reload the page we're on
            if ( thisHref !== currentState.url ) {
                setTimeout( function () {
                    prefetchUrl( thisHref );
                }, 50 * ( index + 1 ) );
            }

        });
    }

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   renderUrl( data, options )
    *       Inserts url data to the DOM. Called by gotoUrl().
    */

    function renderUrl( data, options ) {

        // drop in image_box HTML
        $contentHolder.html( data.data );

        Ajax.ajaxifyLinks( $contentHolder );

        initState();

    }

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   toggleLoading( isLoading )
    *       Toggles whether we're waiting for content to load.
    */

    function toggleLoading( isLoading ) {

        if ( isLoading ) {

            // reveal loading state
            $window.trigger( 'Loading.Reveal' );

        } else {

            // hide loading state
            $window.trigger( 'Loading.Complete' );

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   gotoUrl( url, options  )
    *       Handles loading of a particular url, then moves along to rendering
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
                    var lastUrlInQueue = ajaxQueue[ ajaxQueue.length - 1 ];

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

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   getUrlData( options )
    *       Returns html data for a particular url. This data may be cached already. If not
    *       we make an AJAX call to load the data.
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

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   prefetchUrl( url )
    *       Prefetches URLs we think the user is likely to load in the cache.
    */

    function prefetchUrl( url ) {

        if ( mode === 'traditional' ) {
            return;
        }

        // is the url already in the cache?
        if ( checkCacheForData( ajaxCache.list, url ) ) {
            return true;
        }

        // check if the data exists in the prefetch cache
        if ( checkCacheForData( prefetchCache.list, url ) ) {
            return true;
        }

        // check if the url is already in ajaxQueue
        if ( checkCacheForData( ajaxQueue, url ) ) {
            return true;
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

    //////////////////////////////////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////////////////////////////////

    function removeUrlFromAjaxQueue( url ) {

        // remove url from ajaxQueue
        ajaxQueue = $.grep( ajaxQueue, function ( element, index ) {
            return element.url !== url;
        } );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function ajaxEventListener() {

        $window.on( 'StateManager.gotoUrl', function ( event, url ) {

            gotoUrl( url, {} );

        } );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );