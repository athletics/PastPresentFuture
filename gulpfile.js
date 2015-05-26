var gulp = require( 'gulp' ),
    rename = require( 'gulp-rename' ),
    watch = require( 'gulp-watch' ),
    requirejs = require( 'requirejs' ),
    pkg = require( './package.json' ),
    minifyCSS = require( 'gulp-minify-css' )
;

var rjs = function ( name, out, optimize ) {

    var ext = optimize ? '.min.js' : '.js',
        banner = '/*!\n' +
            ' * ' + pkg.name + ' - ' + pkg.description + '\n' +
            ' *\n' +
            ' * @author ' + pkg.author.name + ' - ' + pkg.author.url + '\n' +
            ' * @see ' + pkg.homepage + '\n' +
            ' * @version ' + pkg.version + '\n' +
            ' */'
    ;

    requirejs.optimize( {
        name: name,
        out: out + ext,
        optimize: ( optimize ? 'uglify2' : 'none' ),
        paths: {
            jquery: 'empty:'
        },
        wrap: {
            start: banner
        }

    } );

};

gulp.task( 'js', function () {
    rjs( './js/Index', './dist/StateManager', false );
    rjs( './js/Index', './dist/StateManager', true );
} );

gulp.task( 'css', function () {
    gulp.src( 'css/StateManager.css' )
        .pipe( gulp.dest( 'dist' ) )
        .pipe( minifyCSS({ advanced: false }) )
        .pipe( rename( 'StateManager.min.css' ) )
        .pipe( gulp.dest( 'dist' ) )
    ;
} );

gulp.task( 'watch', function () {
    gulp.watch( 'js/*.js', [ 'js' ] );
} );

gulp.task( 'default', [ 'js', 'css', 'watch' ] );