'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')();


var plumberOpts = {
  errorHandler: function(err) {
    console.log(err);
    $.notify(err);
  }
};

var browserifyOpts = {};

gulp.task('contentScript', function() {
  return gulp.src('./src/scripts/content/index.js')
    .pipe($.plumber(plumberOpts))
    .pipe($.browserify({insertGlobals: true}))
    .pipe($.rename('contentscript.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe($.notify('contentscript.js task completed'));
});


gulp.task('backgroundScript', function() {
  return gulp.src('./src/scripts/background/index.js')
    .pipe($.plumber(plumberOpts))
    .pipe($.browserify(browserifyOpts))
    .pipe($.rename('background.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe($.notify('background.js task completed'));
});


gulp.task('views', function() {
  var viewDest = './dist/views';
  return gulp.src('./src/views/**/*.jade')
    .pipe($.plumber(plumberOpts))
    .pipe($.newer(viewDest))
    .pipe($.jade({pretty: true}))
    .pipe(gulp.dest(viewDest))
    .pipe($.notify('views task completed'));
});


gulp.task('default', ['contentScript', 'backgroundScript', 'views'], function() {
  gulp.watch('./src/scripts/content/**.js', ['contentScript']);
  gulp.watch('./src/scripts/background/**.js', ['backgroundScript']);
  gulp.watch('./src/views/*.jade', ['views']);
});
