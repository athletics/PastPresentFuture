/*!
 * statemanager - Where have we been? Where are we going?
 *
 * @author Athletics - http://athleticsnyc.com
 * @see https://github.com/athletics/statemanager
 * @version 0.0.1
 *//**
 * Util.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/Util',[
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
/**
 * State.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/State',[
            'jquery',
            './Util'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.State = factory(
            root.jQuery,
            root.StateManager.Util
        );

    }

} ( this, function factory( $, Util ) {

    'use strict';

    var name = 'State',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        $window.on( 'StateManager.AfterInitState', newState );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function newState() {

        var state = window.history.state,
            scrollTarget = 0
        ;

        if ( typeof state.scrollTarget !== 'undefined' && $( state.scrollTarget ).length > 0 )  {
            scrollTarget = $( state.scrollTarget ).first().offset().top;
        }

        if ( ! $( 'html' ).hasClass( 'initial-load' ) ) {

            $( 'html, body' )
                .stop()
                .animate({
                    'scrollTop' : scrollTarget
                }, 200 )
            ;

        } else {

            $( 'html' ).removeClass( 'initial-load' );

        }

        $window.trigger( 'OnDemandImages.Init' );

        // @todo: Break this out to its own module
        // $( '.scroll-to-anchor' ).each( function () {
        //     var $this = $( this );

        //     if ( ! $this.hasClass( 'initialized' ) ) {
        //         return;
        //     }

        //     $this
        //         .off( 'click.Manager' )
        //         .on( 'click.' + name, function ( event ) {

        //         var scroll_target_selector = $(this).data('scroll-target'),
        //             scroll_target_focus = $(this).data('scroll-focus'),
        //             $focus_target = null,
        //             $target = null,
        //             scroll_destination = 0
        //         ;

        //         if ( !_.isUndefined(scroll_target_selector) ) {

        //             $target = $( scroll_target_selector ).first();

        //             if ($target.length > 0) {

        //                 // Continue as normal for cmd clicks etc
        //                 if ( event.which == 2 || event.metaKey ) { return true; }

        //                 // Determine scroll_destination
        //                 scroll_destination = $target.offset().top - Header.get_scroll_offset() - 60;

        //                 $target.addClass('highlight-sequence-init');

        //                 // scroll to top
        //                 // @todo: Abstract window scrolling
        //                 $('html,body').stop().animate(
        //                     {
        //                         'scrollTop' : scroll_destination
        //                     },
        //                     {
        //                         'duration' : 400,
        //                         'easing' : 'easeInOutCubic',
        //                         'complete' : function(){

        //                             // Is there a focus target included?
        //                             if ( !_.isUndefined(scroll_target_focus) ) {
        //                                 $focus_target = $( scroll_target_focus );
        //                                 if ($focus_target.length > 0) {
        //                                     $focus_target.focus();
        //                                 }
        //                             }

        //                             $target.addClass('highlight-sequence');
        //                             setTimeout(function() {
        //                                 $target
        //                                     .removeClass('highlight-sequence-init')
        //                                     .removeClass('highlight-sequence')
        //                                 ;
        //                             }, 1500);
        //                         }
        //                     }
        //                 );

        //                 event.preventDefault();
        //                 return false;
        //             }
        //         }
        //     });

        //     $this.addClass('initialized');
        // });

        // trigger a scroll for good measure
        $window.trigger( 'WindowEvents.Scroll' );

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function pushState( title, url, options ) {

        if ( Util.getMode() === 'traditional' ) {

            window.location = url;

        } else {

            window.history.pushState(
                options,
                title,
                url
            );

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init,
        pushState: pushState
    };

} ) );
/**
 * Ajax.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/Loading',[
            'jquery',
            './Util'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.Loading = factory(
            root.jQuery,
            root.StateManager.Util
        );

    }

} ( this, function factory( $, Util ) {

    // define any private variables
    var name = 'Loading',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window ),
        $html = $( 'html' ),
        $body = $( 'body' )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        $window
            .on(
                name + '.Reveal',
                reveal
            )
            .on(
                name + '.Complete',
                hide
            )
            .on(
                name + '.Progress',
                onLoadingProgress
            )
        ;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function onLoadingProgress( e, options ) {

        //debug(name + ': on_download_progress:');

        var percentComplete = 0,
            total = options.event.target.getResponseHeader( 'X-Content-Length' )
        ;

        if ( typeof total === 'undefined' || total === 0 ) {
            return;
        }

        percentComplete = options.event.loaded / total;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function reveal() {
        $html.addClass( 'is-loading-ajax' );
    }

    //////////////////////////////////////////////////////////////////////////////////////

    function hide() {
        $html.removeClass( 'is-loading-ajax' );
        $body.css({ 'overflow': 'auto' });
    }

    //////////////////////////////////////////////////////////////////////////////////////

    // return any public methods
    return {
        init: init
    };

} ) );
/**
 * Ajax.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/Ajax',[
            'jquery',
            './Util',
            './State'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'jquery' ),
            require( './Util' ),
            require( './State' )
        );

    } else {

        root.StateManager = root.StateManager || {};

        root.StateManager.Ajax = factory(
            root.jQuery,
            root.StateManager.Util,
            root.StateManager.State
        );

    }

} ( this, function factory( $, Util, State ) {

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
            'Loading.Progress',
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
            'Loading.Progress',
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

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Responsible for processing HTML content coming off the server.
     */
    function parseHtml( data ) {

        // Perform parse of ajax content
        data = parseAjaxContent(
            data,
            'page_content'
        );

        return data;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    /*
    *   parseAjaxContent()
    *       Returns content between html comments matching a particular marker. We use this
    *       to get a specific chunk of html within a larger document.
    */

    function parseAjaxContent( data, marker ) {

        var startMarker = '<!-- start:' + marker + ' -->',
            endMarker = '<!-- end:' + marker + ' -->',

            startMarkerOpen = '<!-- start:' + marker,
            endMarkerOpen = 'end:' + marker + ' -->',

            startIndex = data.indexOf( startMarker ),
            endIndex = data.indexOf( endMarker ),

            content = ''
        ;

        if ( startIndex === -1 || endIndex === -1 ) {

            // test against the open markers

            startMarker = startMarkerOpen;
            endMarker = endMarkerOpen;

            startIndex = data.indexOf( startMarker );
            endIndex = data.indexOf( endMarker );

        }

        if ( startIndex == -1 || endIndex == -1 ) {
            return '';
        }

        content = data.substring( ( startIndex + startMarker.length ), endIndex );

        return content;

    }

    //////////////////////////////////////////////////////////////////////////////////////

    function getElementLinks( element ) {

        var items = $.grep( element.find( 'a' ), function ( element, index ) {

            var url = $( element ).attr( 'href' ) || '';

            if ( url.indexOf( 'mailto:' ) !== -1 ) {
                return false;
            } else if ( url.indexOf( 'localhost' ) !== -1 ) {
                return true;
            } else if ( url.indexOf( ':' ) !== -1 ) {
                return false;
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
                if ( event.which == 2 || event.metaKey ) {
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

                $window.trigger( 'StateManager.gotoUrl', url );

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
        parseAjaxContent: parseAjaxContent,
        ajaxifyLinks: ajaxifyLinks
    };

} ) );
/**
 * Manager.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/Manager',[
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

} ( this, function factory( $, Util, Ajax ) {

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
/**
 * Bootstrap.js
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'src/Index',[
            './Util',
            './State',
            './Loading',
            './Ajax',
            './Manager'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( './Util' ),
            require( './State' ),
            require( './Loading' ),
            require( './Ajax' ),
            require( './Manager' )
        );

    } else {

        var _StateManager = root.StateManager;

        root.StateManager = factory(
            _StateManager.Util,
            _StateManager.State,
            _StateManager.Loading,
            _StateManager.Ajax,
            _StateManager.Manager
        );

    }

} ( this, function factory( Util, State, Loading, Ajax, Manager ) {

    'use strict';

    function StateManager() {

        var debug = Util.debug;

        Util.init();

        State.init();

        Loading.init();

        Manager.init();

    }

    StateManager.prototype.Util = Util;
    StateManager.prototype.State = State;
    StateManager.prototype.Loading = Loading;
    StateManager.prototype.Ajax = Ajax;
    StateManager.prototype.Manager = Manager;

    return StateManager;

} ) );
