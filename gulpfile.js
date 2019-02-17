
const { src, dest, task, watch, series, parallel } = require('gulp');

// CSS related plugins
var sass         = require( 'gulp-sass' );
var autoprefixer = require( 'gulp-autoprefixer' );

// JS related plugins
var uglify       = require( 'gulp-uglify' );

// Utility plugins
var rename       = require( 'gulp-rename' );
var sourcemaps   = require( 'gulp-sourcemaps' );
var notify       = require( 'gulp-notify' );
var plumber      = require( 'gulp-plumber' );
var options      = require( 'gulp-options' );
var gulpif       = require( 'gulp-if' );

// Browers related plugins
var browserSync  = require( 'browser-sync' ).create();

// Project related variables
var styleSrc     = 'src/sass/styles.scss';
var styleDest    = 'dist/css/';
var mapURL       = '/';

var jsSrc        = 'src/js/**/*.js';
// var jsFront      = 'main.js';
// var jsFiles      = [ jsFront ];
var jsDest       = 'dist/js/';

var imgSrc       = 'src/media/**/*';
var imgDest      = 'dist/media/';

var fontsSrc     = 'src/fonts/**/*';
var fontsDest    = 'dist/fonts/';

var htmlSrc      = 'src/**/*.html';
var htmlDest     = 'dist/';

var styleWatch   = 'src/sass/**/*.scss';
var jsWatch      = 'src/js/**/*.js';
var imgWatch     = 'src/media/**/*.*';
var fontsWatch   = 'src/fonts/**/*.*';
var htmlWatch    = 'src/**/*.html';

// Tasks
function browser_sync() {
	browserSync.init({
        open: false,
		server: {
			baseDir: './dist/'
		}
	});
}

function reload(done) {
	browserSync.reload();
	done();
}

function css(done) {
	src( [ styleSrc ] )
		.pipe( sourcemaps.init() )
		.pipe( sass({
			errLogToConsole: true,
			outputStyle: 'compressed'
		}) )
		.on( 'error', console.error.bind( console ) )
		.pipe( autoprefixer({ browsers: [ 'last 2 versions', '> 5%', 'Firefox ESR' ] }) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write( mapURL ) )
		.pipe( dest( styleDest ) )
		.pipe( browserSync.stream() );
	done();
};

function js(done){
    src( jsSrc )
    .pipe( rename({
        extname: '.min.js'
    }) )
    .pipe( sourcemaps.init({ loadMaps: true }) )
    .pipe( uglify() )
    .pipe( sourcemaps.write( '.' ) )
    .pipe(dest(jsDest))
    .pipe( browserSync.stream() );

    done();
};

function triggerPlumber( src_file, dest_file ) {
	return src( src_file )
		.pipe( plumber() )
		.pipe( dest( dest_file ) );
}

function images() {
	return triggerPlumber( imgSrc, imgDest );
};

function fonts() {
	return triggerPlumber( fontsSrc, fontsDest );
};

function html() {
	return triggerPlumber( htmlSrc, htmlDest );
};

function watch_files() {

	watch(styleWatch, series(css));
	watch(jsWatch, series(js, reload));
	watch(imgWatch, series(images, reload));
	watch(fontsWatch, series(fonts, reload));
	watch(htmlWatch, series(html, reload));
	/* src(jsDest + 'main.min.js')
		.pipe( notify({ message: 'Gulp is Watching, Happy Coding!' }) ); */
}

task("css", css);
task("js", js);
task("images", images);
task("fonts", fonts);
task("html", html);
task("default", parallel(css, js, images, fonts, html));
task("watch", parallel(browser_sync, watch_files));