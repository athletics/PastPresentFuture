/**
 * Builds the PastPresentFuture prototype.
 * This file should be required directly for CommonJS usage.
 *
 * @see  http://requirejs.org/docs/commonjs.html#intro On CommonJS Transport.
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
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