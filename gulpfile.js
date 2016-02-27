var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
var less = require('gulp-less');
var inject = require('gulp-inject');
var path = require('path');
var browserSync = require('browser-sync').create();
var ghPages = require('gulp-gh-pages');
var clean = require('gulp-clean');
var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var sourceFolder = 'src';
var destinationFolder = 'dist';

gulp.task('compile-css', function() {
    return gulp.src(sourceFolder + '/content/less/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ],
            plugins: [autoprefix]
        }))
        .pipe(gulp.dest(destinationFolder + '/content/css'));
});

gulp.task('minify-css', ['compile-css'], function() {
    return gulp.src(destinationFolder + '/content/css/*')
        .pipe(cssnano())
        .pipe(gulp.dest(destinationFolder + '/content/css/'));
});

gulp.task('inject-content', ['compile-css'], function () {
    var target = gulp.src(sourceFolder + '/index.html');
    var sources = gulp.src(destinationFolder + '/**/*.css', {read: false});

    return target.pipe(inject(sources, {ignorePath: destinationFolder }))
        .pipe(gulp.dest(destinationFolder));
});

gulp.task('minify-html', ['inject-content'], function() {
    return gulp.src(destinationFolder + '/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(destinationFolder))
});

gulp.task('optimize-images', () => {
    return gulp.src(sourceFolder + '/content/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/content/images'));
});

gulp.task('copy', function () {
    return gulp
        .src(sourceFolder + '/CNAME')
        .pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', ['compile-css'], function() {
    browserSync.init({
        server: {
            baseDir: destinationFolder
        },
        files: [destinationFolder + "/**/*.css", destinationFolder + "/**/*.html"]
    });

    gulp.watch(sourceFolder + '/content/**/*.less', ['compile-css']);
    gulp.watch(sourceFolder + '/**/*.html', ['inject-content']);
});

gulp.task('deploy', ['copy', 'optimize-images', 'minify-css', 'minify-html' ], function() {
    return gulp.src(destinationFolder + '/**/*')
        .pipe(ghPages({
            branch: 'master'
        }));
});

gulp.task('clean', function () {
    return gulp.src(destinationFolder, {read: false})
        .pipe(clean());
});

gulp.task('develop', ['copy', 'inject-content', 'optimize-images', 'browser-sync']);
