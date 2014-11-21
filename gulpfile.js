// Variables
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    prefix = require('gulp-autoprefixer'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    resolver = require("gulp-resolver"),
    rimraf = require('gulp-rimraf'),
    shell = require('gulp-shell'),
    cssmin = require('gulp-cssmin'),
    cleancss = require('gulp-cleancss'),
    runSequence = require('run-sequence').use(gulp);


// Default task
gulp.task('default', ['final']);

// CSS
gulp.task('sass', function () {
    return gulp.src(['scss/**/*.scss'])
		.pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact'
        }))
		.pipe(prefix("last 2 versions", "> 1%", "ie 8", "ie 7"))
        .pipe(gulp.dest('./css'));
});

// Watch task
gulp.task('watch', ['sass'], function() {
    gulp.watch('scss/**/*.scss', ['sass'])
        .on('change', function(event) {
            console.log('[' + event.type + '] ' + event.path);
        });
});

// Minimize resources
gulp.task('build', function() {

    return gulp.src(['css/**/*.css', '!css/**/*.min.css'])
        .pipe(cleancss({keepBreaks: true}))    
        .pipe(cssmin())
        .pipe(rename(function(path) {
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest('./css'));

});


/* ICONS */
// Font name and version
var fontName = 'vxIcons',
    fontVersion = Math.floor(Date.now()); // Timestamp in miliseconds

/* Making fonts, styles and guides */

// 1st task - delete everything old
gulp.task('clean', function() {
    return gulp.src(['css/'+fontName+'.css', 'fonts/'+fontName], { read: false }) // much faster
        .pipe(rimraf());
});

// 2nd task - make web fonts from SVG and create SCSS file
gulp.task('iconfont', function(){
    return gulp.src(['icons16/*.svg'])
        .pipe(iconfontCss({
            fontName: fontName,
            appendCodepoints: true,
            path: './scss/_iconsTemplate.scss',
            targetPath: fontName+'.scss',
            fontPath: '../fonts/'+fontName+'/'
        }))
        .pipe(iconfont({
            fontHeight: 512,
            normalize: true,
            fontName: fontName
         }))
        .pipe(gulp.dest('./fonts/'+fontName+'/'));
});

// 3rd task - append version for font files
gulp.task('iconrename', function () {
    return gulp.src(['fonts/'+fontName+'/*.*'])
    .pipe(rename({
        suffix: "."+fontVersion,
    }))
    .pipe(gulp.dest('./fonts/'+fontName+'/'));
});
    // 3rd subtask - add revving to scss
    gulp.task('iconrev', function () {
        return gulp.src('fonts/'+fontName+'/*.scss')
            .pipe(resolver.css({
                assetsDir: 'fonts/'+fontName+'/'
            }))
            .pipe(gulp.dest('./fonts/'+fontName+'/'))     
    });
    // 3rd subtask - delete unneeded files
    gulp.task('cleanrev', function() {
        return gulp.src(['fonts/'+fontName+'/*.*.*'], { read: false }) // much faster
            .pipe(rimraf());
    });

// 4th task - Create CSS from SCSS
gulp.task('iconsass', function () {
    return gulp.src('fonts/'+fontName+'/'+fontName+'.scss')
        .pipe(sass())
        .pipe(gulp.dest('./fonts/'+fontName+'/'));
});

// Last task - create KSS style guide
gulp.task('cleanGuide', function() {
    return gulp.src(['styleGuide/'], { read: false }) // much faster
        .pipe(rimraf());
});


gulp.task('kss-shell', shell.task([
    // For each style that is needed in style guide, add line '--css path/sheetName.css'
    'kss-node css styleGuide --css fonts/'+fontName+'/'+fontName+'.css --template styleGuideTemplate'
]));

// Copy assets to styleguide folder
gulp.task('kss-assets', function () {
    return gulp.src(['fonts/**/*.*'])
        .pipe(gulp.dest('styleguide/fonts/'));
});


// Run sequence of font making tasks
gulp.task('icons', function(){ 
    runSequence('clean', 'iconfont', 'iconrename', 'iconrev', 'cleanrev', 'iconsass');
});

gulp.task('guide', function(){ 
    runSequence('sass', 'build', 'cleanGuide', 'kss-shell', 'kss-assets');
});

gulp.task('final', function(){ 
    runSequence('clean', 'iconfont', 'iconrename', 'iconrev', 'cleanrev', 'iconsass', 'sass', 'build', 'cleanGuide', 'kss-shell', 'kss-assets');
});
