/**
 * Import, get, and set configuration values.
 */
( function ( window, factory ) {

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

        window.StateManager = window.StateManager || {};

        window.StateManager.Config = factory(
            window.jQuery,
            window.StateManager.Util
        );

    }

} ( window, function ( $, Util ) {

    var config = {};

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