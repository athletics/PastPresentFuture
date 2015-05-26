/**
 * State.js
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
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

} ( this, function ( $, Util ) {

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