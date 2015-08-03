/*!
 * pastpresentfuture - Where have we been? Where are we going?
 *
 * @author Athletics - http://athleticsnyc.com
 * @see https://github.com/athletics/PastPresentFuture
 * @version 0.1.3
 *//**
 * Shared utilities.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Util',[
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

        window.PastPresentFuture = window.PastPresentFuture || {};

        window.PastPresentFuture.Util = factory(
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
/**
 * Import, get, and set configuration values.
 */
( function ( window, factory ) {

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Config',[
            'jquery',
            './Util'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' )
        );

    } else {

        window.PastPresentFuture = window.PastPresentFuture || {};

        window.PastPresentFuture.Config = factory(
            window.jQuery,
            window.PastPresentFuture.Util
        );

    }

} ( window, function ( $, Util ) {

    var config = {};

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Initialize the config module.
     *
     * @param  {Object} newConfig The PastPresentFuture config object.
     */
    function init( newConfig ) {

        config = $.extend( {
            content: '.page_content_holder',
            ajaxContainer: '.page_content_holder',
            prefetchCacheLimit: 15,
            ajaxCacheLimit: 15,
            onParseHtml: false
        }, newConfig );

    }

    /**
     * Set
     *
     * @param {String} key
     * @param {Mixed}  value
     */
    function set( key, value ) {

        config[ key ] = value;

    }

    /**
     * Get
     *
     * @param  {String|Null} key Optional.
     * @return {Mixed}
     */
    function get( key ) {

        key = key || false;

        if ( ! key ) {
            return config;
        }

        return key in config ? config[ key ] : null;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init,
        set:  set,
        get:  get
    };

} ) );
/**
 * Handle browser history.pushState() method.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/PushState',[
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
/**
 * Tracks loading state.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Loading',[
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

        window.PastPresentFuture.Loading = factory(
            window,
            window.jQuery,
            window.PastPresentFuture.Util
        );

    }

} ( window, function ( window, $, Util ) {

    var $window = $( window ),
        $html = $( 'html' )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Binds loading events.
     */
    function init() {

        $window
            .on( 'PastPresentFuture:LoadingReveal', reveal )
            .on( 'PastPresentFuture:LoadingComplete', hide );

    }

    function reveal() {
        $html.addClass( 'is-loading-ajax' );
    }

    function hide() {
        $html.removeClass( 'is-loading-ajax' );
    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );
/**
 * Handles the AJAX load of local links in the DOM.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Ajax',[
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

        window.PastPresentFuture = window.PastPresentFuture || {};

        window.PastPresentFuture.Ajax = factory(
            window,
            window.jQuery,
            window.PastPresentFuture.Util,
            window.PastPresentFuture.Config
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

        var marker = Config.get( 'content' ),
            onParseHtml = Config.get( 'onParseHtml' ),
            $data = $( $.parseHTML( data, document, true ) )
        ;

        $data = $data.filter( marker ).add( $data.find( marker ) );

        return $.isFunction( onParseHtml ) ? onParseHtml( $data ) : $data;

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
            titles = $data.filter( 'title' )
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
                .on( 'click.PastPresentFuture', function ( event ) {

                    // Continue as normal for cmd clicks etc
                    if ( event.which === 2 || event.metaKey ) {
                        return true;
                    }

                    var $this = $( this ),
                        url = $this.attr( 'href' )
                    ;

                    $window.trigger( 'PastPresentFuture:GotoUrl', [ url, {
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
/**
 * AJAX + pushState
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Manager',[
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
            if ( event.originalEvent.state === null ) {
                return;
            }

            gotoUrl( Util.currentStateUrl(), {
                popstate: true
            } );

            $window.trigger( 'PastPresentFuture:PopState', event );

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

                toggleLoading( false );

                $window.trigger( 'PastPresentFuture:RenderUrl', data );

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
/**
 * Builds the PastPresentFuture prototype.
 * This file should be required directly for CommonJS usage.
 *
 * @see  http://requirejs.org/docs/commonjs.html#intro On CommonJS Transport.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Index',[
            './Util',
            './Config',
            './PushState',
            './Loading',
            './Ajax',
            './Manager'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( './Util' ),
            require( './Config' ),
            require( './PushState' ),
            require( './Loading' ),
            require( './Ajax' ),
            require( './Manager' )
        );

    } else {

        var _PastPresentFuture = window.PastPresentFuture;

        window.PastPresentFuture = factory(
            _PastPresentFuture.Util,
            _PastPresentFuture.Config,
            _PastPresentFuture.PushState,
            _PastPresentFuture.Loading,
            _PastPresentFuture.Ajax,
            _PastPresentFuture.Manager
        );

    }

} ( window, function ( Util, Config, PushState, Loading, Ajax, Manager ) {

    'use strict';

    /**
     * PastPresentFuture prototype.
     *
     * @param  {Object} newConfig Optional configuration for initialization.
     */
    function PastPresentFuture( newConfig ) {

        newConfig = newConfig || false;

        Config.init( newConfig );
        PushState.init();
        Loading.init();
        Manager.init();

    }

    var module = PastPresentFuture.prototype;

    module.Util = Util;
    module.Config = Config;
    module.PushState = PushState;
    module.Loading = Loading;
    module.Ajax = Ajax;
    module.Manager = Manager;

    return PastPresentFuture;

} ) );
