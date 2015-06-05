/*!
 * statemanager - Where have we been? Where are we going?
 *
 * @author Athletics - http://athleticsnyc.com
 * @see https://github.com/athletics/statemanager
 * @version 0.0.1
 *//**
 * Util.js
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
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
        debug: debug,
        fullyQualifyUrl: fullyQualifyUrl,
        setDocumentTitle: setDocumentTitle,
        getMode: getMode
    };

} ) );
/**
 * Config
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
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

        window.StateManager = window.StateManager || {};

        window.StateManager.Config = factory(
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( $, Util ) {

    var name = 'Config',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        config = {};

    //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Initialize the config module.
     *
     * @param  {Object} newConfig The StateManager config object.
     */
    function init( newConfig ) {

        config = $.extend( {
            content: '.page_content_holder',
            ajaxContainer: '.page_content_holder',
            prefetchCacheLimit: 15,
            ajaxCacheLimit: 15
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
 * State.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/State',[
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

        window.StateManager = window.StateManager || {};

        window.StateManager.State = factory(
            window,
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( window, $, Util ) {

    'use strict';

    var name = 'State',
        debugEnabled = true,
        debug = debugEnabled ? Util.debug : function () {},
        $window = $( window )
    ;

    //////////////////////////////////////////////////////////////////////////////////////

    function init() {

        $window.on( 'StateManager.AfterInitState', newState );

        $window.on( 'StateManager.PushState', pushState );

    }

    /**
     * Decide where to focus the page after push state
     */
    function newState() {

        var state = window.history.state,
            scrollTarget = 0
        ;

        if ( state !== null && typeof state.scrollTarget !== 'undefined' && $( state.scrollTarget ).length > 0 )  {
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

        // $window.trigger( 'OnDemandImages.Init' );

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

    /**
     * Handle how the page updates depending on the browser's use of history
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

            $window.trigger( 'StateManager.NewState' );

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
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
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

        window.StateManager = window.StateManager || {};

        window.StateManager.Loading = factory(
            window,
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( window, $, Util ) {

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
                'StateManager.LoadingReveal',
                reveal
            )
            .on(
                'StateManager.LoadingComplete',
                hide
            )
            .on(
                'StateManager.LoadingProgress',
                onLoadingProgress
            )
        ;

    }

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

    function reveal() {
        $html.addClass( 'is-loading-ajax' );
    }

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
 * @param  {[type]} window    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Ajax',[
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

        request.beforeSend = function ( xhr ) {
            xhr.requestUrl = request.url;
        };

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
            Options.success( data, textStatus, xhr );
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

    /**
     * Get valid links to ajaxify.
     *
     * @param  {Array} element
     * @return {Array} element
     */
    function getElementLinks( element ) {

        var items = $.grep( element.find( 'a' ), function ( element, index ) {

            var $el = $( element ),
                url = $el.attr( 'href' ) || '';

            // Intended for a new window.
            if ( $el.attr( 'target' ) === '_blank' ) {
                return false;
            }

            // Is a special link types.
            if ( url.indexOf( 'mailto:' ) !== -1 || url.indexOf( 'javascript:' ) !== -1 ) {
                return false;
            }

            // Not relative and doesn't have the same hostname.
            if ( url.indexOf( '//' ) !== -1 && url.indexOf( window.location.hostname ) === -1 ) {
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
                    scrollTarget = null,
                    pushObj = {}
                ;

                // Continue as normal for cmd clicks etc
                if ( event.which === 2 || event.metaKey ) {
                    return true;
                }

                if ( typeof $this.data( 'scroll-target' ) !== 'undefined' ) {
                    scrollTarget = $this.data( 'scroll-target' );
                }

                pushObj = {
                    url: url,
                    options: {
                        scrollTarget: scrollTarget,
                        scrollPos: parseInt( $( document ).scrollTop(), 10 ),
                        url: url
                    }
                };

                $window.trigger( 'StateManager.GotoUrl', url, pushObj );

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
/**
 * Manager.js
 *
 * @param  {Object} window    Window
 * @param  {[type]} factory [description]
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

        prefetchCache.limit = Config.get( 'prefetchCacheLimit' );
        ajaxCache.limit = Config.get( 'ajaxCacheLimit' );

        setWrappers();

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
                currentStateUrl(),
                { popstate: true }
            );

            $window.trigger( 'StateManager.PopState' );

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
            pageTitle = 'title' in options ? options.title : document.title
        ;

        if ( typeof options !== 'undefined' && typeof options.isInitLoad !== 'undefined' ) {
            isInitLoad = options.isInitLoad
        }

        setWrappers();

        Util.setDocumentTitle( pageTitle );

        if ( ! isInitLoad ) {
            $window.trigger(
                'EventTrackAjax.RecordPageview',
                {
                    url: currentStateUrl(),
                    title: pageTitle
                }
            );
        }

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

        // stagger prefetch of additional URLs
        $( 'a[data-prefetch]' ).each( function ( index ) {

            var thisHref = Util.fullyQualifyUrl( $( this ).attr( 'href' ) );

            // make sure we don't reload the page we're on
            if ( thisHref !== currentStateUrl() ) {
                setTimeout( function () {
                    prefetchUrl( thisHref );
                }, 50 * ( index + 1 ) );
            }

        });
    }

    /**
     * Make sure the correct wrappers are selected
     * regardless of when the function is initialized
     */
    function setWrappers() {

        $contentHolder = $( Config.get( 'content' ) ).first();

        $ajaxContainer = $( Config.get( 'ajaxContainer' ) ).first();

        if ( Config.get( 'content' ) !== Config.get( 'ajaxContainer' ) ) {
            $window.trigger( 'StateManager.BeforeTransition', [ $contentHolder, $ajaxContainer ] );
        }

    }

    /**
     * Inserts url data to the DOM. Called by gotoUrl().
     *
     * @param  {Object} data
     * @param  {Object} options
     */
    function renderUrl( event, data ) {

        // drop in image_box HTML
        $ajaxContainer.html( data.data );

        Ajax.ajaxifyLinks( $ajaxContainer );

        $body.removeClass().addClass( data.classes );

        if ( Config.get( 'content' ) !== Config.get( 'ajaxContainer' ) ) {

            $window.trigger( 'StateManager.AnimateTransition', data );

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

        options = options || {};
        options = $.extend( { url: url, popstate: false }, options );

        $( window )
            .off( 'StateManager.FetchedData' )
            .on( 'StateManager.FetchedData', function ( event, data ) {

                // Only proceed for currently request url.
                if ( data.url !== url ) {
                    return;
                }

                if ( ! options.popstate ) {
                    // history.pushState has to happen before rendering.
                    // Otherwise the page title in the history gets messed up.
                    $window.trigger( 'StateManager.PushState', options );
                }

                toggleLoading( false );

                $window.trigger( 'StateManager.RenderUrl', data );

                // Unbind window event.
                $( this ).off( 'StateManager.FetchedData' );

            } )
        ;

        var data = getUrlData( {
                url: url,
                afterAjaxLoad: function ( data, textStatus, xhr ) {

                    // save the new data to the cache
                    data = saveCacheData( ajaxCache, xhr.requestUrl, data );

                    $( window ).trigger( 'StateManager.FetchedData', data );

                }
            } )
        ;

        // Waiting on an ajax request to be completed.
        if ( typeof data.loading !== 'undefined' && data.loading ) {
            toggleLoading( true );
        }

    }

    /**
     * Returns html data for a particular url. This data may be cached already. If not
     *       we make an AJAX call to load the data.
     *
     * @param  {Object} options Includes: url, isPrefetch
     * @return {Object}         Trigger the loading function
     */
    function getUrlData( options ) {

        var trackProgress = true,
            data
        ;

        if ( data = checkCacheForData( ajaxCache.list, options.url ) ) {
            return $( window ).trigger( 'StateManager.FetchedData', data );
        }

        if ( data = checkCacheForData( prefetchCache.list, options.url ) ) {
            return $( window ).trigger( 'StateManager.FetchedData', data );
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

        ajaxQueue.push({ url: options.url });

        // if we reach this point, the data wasn't in the cache. make ajax request.
        Ajax.loadAjax({
            url: options.url,
            dataType: 'html',
            trackProgress: trackProgress,
            success: options.afterAjaxLoad,
            error: function () {
                location.reload( true );
            }
        });

        return {
            loading: true
        };

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

        // no, let's make the request
        getUrlData({
            url: url,
            isPrefetch: true,
            afterAjaxLoad: function ( data ) {
                removeUrlFromAjaxQueue( url );
                data = saveCacheData( prefetchCache, url, data );

                $( window ).trigger( 'StateManager.FetchedData', data );
            }
        });
    }

    /**
     * Check supplied cache array for a match against the URI
     *
     * @param  {Array} cacheList  prefetch, ajax, or ajaxQueue cache
     * @param  {String} url       used to identify the correct data in the loop
     * @return {Object|Boolean}   cacheList data if present or false
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
            title: Ajax.parseTitle( data ),
            data: Ajax.parseHtml( data ),
            classes: data.match(/body\sclass=['|"]([^'|"]*)['|"]/)[1]
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

        return cacheObj;

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

        $window.on( 'StateManager.GotoUrl', function ( event, url, optionsObj ) {

            gotoUrl( url, optionsObj );

        } );

        $window.on( 'StateManager.RenderUrl', renderUrl );

        $window.on( 'StateManager.InitState', function( event, data ) {

            initState( data );

        } );

    }

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

    //////////////////////////////////////////////////////////////////////////////////////

    return {
        init: init
    };

} ) );
/**
 * Bootstrap.js
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( 'js/Index',[
            './Util',
            './Config',
            './State',
            './Loading',
            './Ajax',
            './Manager'
        ], factory );

    } else if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( './Util' ),
            require( './Config' ),
            require( './State' ),
            require( './Loading' ),
            require( './Ajax' ),
            require( './Manager' )
        );

    } else {

        var _StateManager = window.StateManager;

        window.StateManager = factory(
            _StateManager.Util,
            _StateManager.Config,
            _StateManager.State,
            _StateManager.Loading,
            _StateManager.Ajax,
            _StateManager.Manager
        );

    }

} ( window, function ( Util, Config, State, Loading, Ajax, Manager ) {

    'use strict';

    function StateManager( newConfig ) {

        newConfig = newConfig || false;

        Config.init( newConfig );

        State.init();

        Loading.init();

        Manager.init();

    }

    StateManager.prototype.Util = Util;
    StateManager.prototype.Config = Config;
    StateManager.prototype.State = State;
    StateManager.prototype.Loading = Loading;
    StateManager.prototype.Ajax = Ajax;
    StateManager.prototype.Manager = Manager;

    return StateManager;

} ) );
