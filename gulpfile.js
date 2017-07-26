var gulp = require('gulp');
var webpack = require('webpack-stream');
var sass = require('gulp-sass');

gulp.task('webpack', function() {
  return gulp.src('./demo/scripts.js')
    .pipe(webpack({
      output: {
        filename: 'bundle.js',
      }
    }))
    .pipe(gulp.dest('./demo/dist/'));
});

gulp.task('sass', [], function() {
    return gulp.src('./demo/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./demo/dist/'))
});


gulp.task('watch', function() {
    gulp.watch(['./*.js', './demo/**/*.js', './*.scss', './demo/**/*.scss'], ['webpack', 'sass']);
});

gulp.task('default', ['webpack', 'sass', 'watch']);

