/**
 * Bootstrap.js
 */
( function ( root, factory ) {

    'use strict';

    if ( typeof define === 'function' && define.amd ) {

        define( [
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