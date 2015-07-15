/**
 * Builds the StateManager prototype.
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

        var _StateManager = window.StateManager;

        window.StateManager = factory(
            _StateManager.Util,
            _StateManager.Config,
            _StateManager.PushState,
            _StateManager.Loading,
            _StateManager.Ajax,
            _StateManager.Manager
        );

    }

} ( window, function ( Util, Config, PushState, Loading, Ajax, Manager ) {

    'use strict';

    /**
     * StateManager prototype.
     *
     * @param  {Object} newConfig Optional configuration for initialization.
     */
    function StateManager( newConfig ) {

        newConfig = newConfig || false;

        Config.init( newConfig );
        PushState.init();
        Loading.init();
        Manager.init();

    }

    var module = StateManager.prototype;

    module.Util = Util;
    module.Config = Config;
    module.PushState = PushState;
    module.Loading = Loading;
    module.Ajax = Ajax;
    module.Manager = Manager;

    return StateManager;

} ) );