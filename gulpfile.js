const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const rename = require('gulp-rename');
const htmlreplace = require('gulp-html-replace');
const stripDebug = require('gulp-strip-debug');
var replace = require('gulp-batch-replace');

const url = require('url');
const proxy = require('proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const version = require('gulp-version-number');
const versionConfig = {
    value: '%MDS%',
    append: {
        key: 'v_06ab7eb9a2_',
        to: ['css', 'js']
    }
};

var dev = true;

var config = {
    srcCss: 'app/assets/styles/**/**/*.scss',
    tempCss: '.tmp/assets/styles',
    buildCss: 'dist/assets/styles'
};

gulp.task('styles', () => {
    return gulp
        .src(config.srcCss)
        .pipe($.plumber())
        .pipe($.if(dev, $.sourcemaps.init()))
        .pipe(
            $.sass
            .sync({
                outputStyle: 'expanded',
                precision: 10,
                includePaths: ['.']
            })
            .on('error', $.sass.logError)
        )
        .pipe(
            $.autoprefixer({
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
            })
        )
        .pipe($.if(dev, $.sourcemaps.write()))
        .pipe($.if(dev, gulp.dest(config.tempCss), gulp.dest(config.buildCss)))
        .pipe(
            reload({
                stream: true
            })
        );
});

gulp.task('scripts', () => {
    return gulp
        .src('app/scripts/**/*.js')
        .pipe($.plumber())
        .pipe($.if(dev, $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.if(dev, $.sourcemaps.write('.')))
        .pipe($.if(dev, gulp.dest('.tmp/scripts'), gulp.dest('dist/scripts')))
        .pipe(
            reload({
                stream: true
            })
        );
});

function lint(files) {
    return gulp
        .src(files)
        .pipe(
            $.eslint({
                fix: true
            })
        )
        .pipe(
            reload({
                stream: true,
                once: true
            })
        )
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
    return lint('app/scripts/**/*.js').pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
    return lint('test/spec/**/*.js').pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'scripts'], () => {
    return (
        gulp
        .src('app/**/*.html')
        .pipe(
            $.useref({
                searchPath: ['.tmp', 'app', '.']
            })
        )
        // .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
        .pipe(
            $.if(
                /\.css$/,
                $.cssnano({
                    safe: true,
                    autoprefixer: false
                })
            )
        )
        .pipe(
            $.if(
                /\.html$/,
                $.htmlmin({
                    // collapseWhitespace: true,
                    // minifyCSS: true,
                    // minifyJS: {compress: {drop_console: true}},
                    // processConditionalComments: true,
                    // removeComments: true,
                    // removeEmptyAttributes: true,
                    // removeScriptTypeAttributes: true,
                    // removeStyleLinkTypeAttributes: true
                })
            )
        )
        .pipe(version(versionConfig))
        .pipe(gulp.dest('dist'))
    );
});

gulp.task('images', () => {
    return gulp
        .src('app/assets/images/**/*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', () => {
    return gulp
        .src(
            require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(
                err
            ) {}).concat('app/assets/fonts/**/*')
        )
        .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/assets/fonts')));
});

gulp.task('extras', () => {
    return gulp
        .src(['app/*', '!app/**/*.html'], {
            dot: true
        })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
    runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], () => {
        var proxyOptions = url.parse('http://api.gasman.local:8888/');
        proxyOptions.route = '/gas';

        browserSync.init({
            notify: false,
            port: 9005,
            server: {
                baseDir: ['.tmp', 'app'],
                middleware: [proxy(proxyOptions), historyApiFallback()],
                routes: {
                    '/bower_components': 'bower_components'
                }
            }
        });

        gulp
            .watch([
                'app/**/*.html',
                'app/assets/images/**/*',
                '.tmp/assets/fonts/**/*'
            ])
            .on('change', reload);

        gulp.watch('app/assets/styles/**/*.scss', ['styles']);
        gulp.watch('app/scripts/**/*.js', ['scripts']);
        gulp.watch('app/assets/fonts/**/*', ['fonts']);
        gulp.watch('bower.json', ['wiredep', 'fonts']);
    });
});

gulp.task('serve:dist', ['default'], () => {
    var proxyOptions = url.parse('http://api.gasman.lk/');
    proxyOptions.route = '/gas';

    browserSync.init({
        notify: false,
        port: 9001,
        server: {
            baseDir: ['dist'],
            middleware: [proxy(proxyOptions), historyApiFallback()],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });
});

gulp.task('serve:test', ['default'], () => {
    var proxyOptions = url.parse('http://api.gasman.lk/');
    proxyOptions.route = '/gas';
    browserSync.init({
        notify: false,
        port: 9001,
        server: {
            baseDir: ['dist'],
            middleware: [proxy(proxyOptions), historyApiFallback()],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });
});

// inject bower components
gulp.task('wiredep', () => {
    /*gulp.src('app/assets/styles/!*.scss')
      .pipe($.filter(file => file.stat && file.stat.size))
      .pipe(wiredep({
        ignorePath: /^(\.\.\/)+/
      }))
      .pipe(gulp.dest('app/assets/styles'));

    gulp.src('app/!*.html')
      .pipe(wiredep({
        exclude: ['bootstrap'],
        ignorePath: /^(\.\.\/)*\.\./
      }))
      .pipe(gulp.dest('app'));*/
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
    return gulp.src('dist/**/*').pipe(
        $.size({
            title: 'build',
            gzip: true
        })
    );
});

gulp.task('default', () => {
    return new Promise(resolve => {
        dev = false;
        runSequence(['clean', 'wiredep'], 'build', resolve);
    });
});

gulp.task('ready_prod', function() {
    gulp
        .src('dist/scripts/**/*.js')
        .pipe(stripDebug())
        .pipe(gulp.dest('dist/scripts/'));

    var replacements = [
        ['google-key', 'google-key']
    ];

    gulp
        .src('dist/index.html')
        .pipe(replace(replacements))
        .pipe(gulp.dest('dist/'));
});