/**
 * Config
 * @param  {[type]} root    [description]
 * @param  {[type]} factory [description]
 * @return {[type]}         [description]
 */
( function ( root, factory ) {

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

        root.StateManager.Config = factory(
            root.jQuery,
            root.StateManager.Util
        );

    }

} ( this, function ( $, Util ) {

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