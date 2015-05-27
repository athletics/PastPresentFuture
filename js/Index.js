/**
 * Bootstrap.js
 */
( function ( window, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
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