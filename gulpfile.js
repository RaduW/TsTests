"use strict";
/**
 * Created by raduw on 20.04.2015.
 */

var gulp = require('gulp'),
    path = require('path'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    tsCompiler = require('gulp-typescript'),
    bower = require('gulp-bower2'),
    mainBowerFiles = require('main-bower-files'),
    merge = require('merge2'),
    tsd = require('gulp-tsd'),
    karma = require('karma'),
    del = require('del'),
    gutil = require('gulp-util'),
    karmaParseConfig = require('karma/lib/config').parseConfig;


var baseDir = './src/';

// gulp.task('default', ['typescript'], function () {
//     console.log("running the defaultTask with it's dependencies");
// });
//

gulp.task('server', function(){
    
});

gulp.task('less', function () {
    console.log("building css from less files");
    return gulp.src(baseDir + 'less/**/*.less')
        .pipe(less({
            paths: [path.join(baseDir, 'less')]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(baseDir +'css'))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(baseDir +'css'));
});

gulp.task('typescript', function () {
    console.log("transpiling typescript files to js");
    return gulp.src( baseDir +'ts/**/*.ts').
        pipe(tsCompiler({
            target: 'es5',
        }))
        .pipe(gulp.dest(baseDir +'js'));

});

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

// fetches all bower dependencies (from bower.json)
gulp.task('bower', function(){
    console.log("fetching bower dependencies (listed in bower.json)");
    gulp.src( './manual_download/**/*').
        pipe(gulp.dest(baseDir +'lib/'));

    bower()
        .pipe(gulp.dest('bower_components/'));

    return gulp.src(mainBowerFiles(),{base: './bower_components'})
        .pipe(gulp.dest(baseDir +'lib/'))

});

gulp.task('copyDirectiveTemplates', function () {
    return gulp.src( baseDir +'ts/**/*.html')
        .pipe(gulp.dest(baseDir +'js'));
});


gulp.task('dependencies', ['tsd','bower'],function () {
    console.log("fetching all dependencies");
});

function runKarma(configFilePath, options, cb) {

	configFilePath = path.resolve(configFilePath);

	var server = karma.server;
	var log=gutil.log, colors=gutil.colors;
	var config = karmaParseConfig(configFilePath, {});

    Object.keys(options).forEach(function(key) {
      config[key] = options[key];
    });

	server.start(config, function(exitCode) {
		log('Karma has exited with ' + colors.red(exitCode));
		cb();
		process.exit(exitCode);
	});
}

/** actual tasks */

/** single run */
gulp.task('test', function(cb) {
	runKarma('karma.conf.js', {
		autoWatch: false,
		singleRun: true
	}, cb);
});

/** continuous ... using karma to watch (feel free to circumvent that;) */
gulp.task('test-watch', function(cb) {
	runKarma('karma.conf.js', {
		autoWatch: true,
		singleRun: false
	}, cb);
});

gulp.task('watch', function () {
    gulp.watch(baseDir + 'ts/**/*.ts', ['typescript']);
    gulp.watch(baseDir + 'ts/**/*.html', ['copyDirectiveTemplates'])
    gulp.watch(baseDir + 'less/**/*.less', ['less'])
});
