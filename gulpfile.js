/***********
 * PLUGINS *
 ***********/

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rsass = require('gulp-ruby-sass'),
    rename = require('gulp-rename'),
    prefix = require('gulp-autoprefixer'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    resolver = require("gulp-resolver"),
    rimraf = require('gulp-rimraf'),
    shell = require('gulp-shell'),
    cssmin = require('gulp-cssmin'),
    cleancss = require('gulp-cleancss'),
    gcmq = require('gulp-group-css-media-queries'),
    uglify = require('gulp-uglify'),
    jsonSass = require('gulp-json-sass'),
    concat = require('gulp-concat'),
    insert = require('gulp-insert'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    gulpkss = require('gulp-kss'),
    runSequence = require('run-sequence').use(gulp);



/*********
 * PATHS *
 *********/
var fontName = 'icons',
    fontVersion = Math.floor(Date.now()); // Timestamp in miliseconds

var basePaths = {
    project : 'project/',
    public  : 'public/'
};
var paths = {
    fonts: {
        root    : basePaths.project + 'fonts/',
        project : basePaths.project + 'fonts/' + fontName + '/',
        public  : basePaths.public + 'fonts/',
        icons   : basePaths.project + 'icons/'
    },
    styleGuide: {
        template: basePaths.project + 'styleGuide-template/',
        final   : basePaths.public + 'styleGuide/'
    },

};
var appFiles = {
    iconCss         : paths.fonts.project + fontName + '/icons-glyphs.css',
    iconScss        : paths.fonts.project + fontName + '/.scss',
    iconSvg         : paths.fonts.icons + '*.svg',
    tplFontFace     : paths.fonts.root + '_iconFontTemplate/icon-template-fontFace.scss',
    tplFontGlyphs   : paths.fonts.root + '_iconFontTemplate/icon-template-glyphs.scss',
    fontFiles       : [paths.fonts.root + '**/*.*',
                       "!" + paths.fonts.root + '_iconFontTemplate',
                      paths.fonts.root + '.htaccess'],
    fontGuide       : paths.fonts.icons + 'styleguide.md',
    cleanIconFont   : [basePaths.project + 'fonts/' + fontName + '/',
                       basePaths.public + 'fonts/' + fontName + '/']
}

/***********
 * LIBSASS *
 ***********/

// SASS to CSS
gulp.task('sass', function () {
    return gulp.src([appFiles.scss])
		.pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact'
        }))
        .pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
        .pipe(gcmq())
        .pipe(gulp.dest(paths.styles.public));
});

// Minimize CSS
gulp.task('mincss', function() {
    return gulp.src(appFiles.css)
        .pipe(cleancss({
            keepBreaks: true, 
            keepSpecialComments: 0
        }))    
        .pipe(cssmin())
        .pipe(rename(function(path) {
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest(paths.styles.public));
        
});

// Final build
gulp.task('libStyle', function(){ 
    runSequence('sass', 'mincss');
});



/****************************************************
 * RUBY SASS                                        *
 * ------------------------------------------------ *
 * used to compare output CSS                       *
 * need to have sass ruby gem installed:            *
 * > gem install sass                               *
 ****************************************************/

gulp.task('rsass', function() {
    return rsass(paths.styles.project) 
        .on('error', function (err) { console.error('Error!', err.message); })
        .pipe(rename(function(path) {
            path.extname = '.ruby.css';
        }))
        .pipe(gulp.dest(paths.styles.public));
});

// Prefix tags and group media queries
gulp.task('rsassBuild', function() {
    return rsass(paths.styles.project) 
        .on('error', function (err) { console.error('Error!', err.message); })
        .pipe(rename(function(path) {
            path.extname = '.ruby.css';
        }))
        .pipe(prefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
        .pipe(gcmq())
        .pipe(gulp.dest(paths.styles.public));
});

// Minimize ruby CSS
gulp.task('rsassMin', function () {
    return gulp.src(appFiles.rcss)
        .pipe(cleancss({
            keepBreaks: true, 
            keepSpecialComments: 0
        }))    
        .pipe(cssmin())
        .pipe(rename(function(path) {
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest(paths.styles.public));
});

// Final build
gulp.task('rubyStyle', function(){ 
    runSequence('rsass', 'rsassBuild', 'rsassMin');
});



/*******************************************************************************************
 * FONT ICONS                                                                              *
 * --------------------------------------------------------------------------------------- *
 * 1. Delete old font before making a new one                                              *
 * 2. Make new web font from SVG in icons folder and separate Glyphs from fontFace files   *
 * 3. Append version to fonts. For this to work, mod rewrite must be present on the server *
 * 4. Finalize with CSS                                                                    *
 * 5. Copy final font to public folder                                                     *
 *******************************************************************************************/



// 1. Delete everything old
gulp.task('cleanIcons', function() {
    return gulp.src(appFiles.cleanIconFont, { read: false }) // much faster
        .pipe(rimraf());
});

// 2. Make web fonts from SVG and create SCSS files
gulp.task('iconFontFace', function(){
    return gulp.src([appFiles.iconSvg])
        .pipe(iconfontCss({
            fontName: fontName,
            appendCodepoints: true,
            path: appFiles.tplFontFace,
            targetPath: fontName+'.scss',
            fontPath: fontName
        }))
        .pipe(iconfont({
            fontHeight: 512,
            normalize: true,
            descent: 64,
            fontName: fontName
         }))
        .pipe(gulp.dest(paths.fonts.project));
});
gulp.task('iconGlyphs', function(){
    return gulp.src([appFiles.iconSvg])
        .pipe(iconfontCss({
            fontName: fontName,
            appendCodepoints: true,
            path: appFiles.tplFontGlyphs,
            targetPath: fontName+'-glyphs.scss',
            fontPath: fontName
        }))
        .pipe(iconfont({
            fontHeight: 512,
            normalize: true,
            descent: 64,
            fontName: fontName
        }))
        .pipe(gulp.dest(paths.fonts.project));
});

// copy font guide to generated font folder
gulp.task('copyFontGuide', function () {
    console.log('nx: COPY Font guide from "'+appFiles.fontGuide+'" to "'+ paths.fonts.project+fontName + '"');
    return gulp.src(appFiles.fontGuide)
        .pipe(gulp.dest(paths.fonts.project));
});

// 3. Append version for font files
gulp.task('iconRename', function () {
    return gulp.src([paths.fonts.project+'/*.*'])
    .pipe(rename({
        suffix: "."+fontVersion,
    }))
    .pipe(gulp.dest(paths.fonts.project+'/'));
});

// 3.1. Add revving to scss
gulp.task('iconRev', function () {
    return gulp.src(paths.fonts.project+'/*.scss')
        .pipe(resolver.css({
            assetsDir: paths.fonts.project
        }))
        .pipe(gulp.dest(paths.fonts.project))     
});

// 3.2. Delete unneeded rev files
gulp.task('cleanRev', function() {
    return gulp.src([paths.fonts.project+'/*.*.*'], { read: false }) // much faster
        .pipe(rimraf());
});

// 4. Create CSS from SCSS
gulp.task('iconSass', function () {
    return gulp.src(paths.fonts.project+'/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(paths.fonts.project));
});

// 5. Copy finished font to public folder
gulp.task('copyFont', function () {
    console.log('nx: COPY fonts from "'+appFiles.fontFiles+'" to "'+ paths.fonts.public + '"');
    return gulp.src(appFiles.fontFiles)
        .pipe(gulp.dest(paths.fonts.public));
});

// Delete unneeded files 
gulp.task('cleanFontFolder', function() {
    console.log('nx: CLEANING up Font folder');
    return gulp.src(paths.fonts.public + '_iconFontTemplate/', { read: false }) // much faster
        .pipe(rimraf());
});

// Final build - Icon font
gulp.task('buildFont', function(){ 
    runSequence('cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'copyFont', 'cleanFontFolder');
});



/***************
 * STYLE GUIDE *
 ***************/

// Delete old styleGuide
gulp.task('cleanGuide', function() {
    console.log('nx: DELETING old styleGuide');
    return gulp.src(paths.styleGuide.final, { read: false }) // much faster
        .pipe(rimraf());
});

// Create new styleGuide
gulp.task('kss-shell', shell.task([
    // FAQ - https://github.com/kss-node/kss-node
    'kss-node '+paths.fonts.project+' '+paths.styleGuide.final +' --template '+paths.styleGuide.template+' --m *.css'
]));

// Copy assets to styleGuide folder
gulp.task('kss-assets', function () {
    console.log('nx: COPY fonts from "'+appFiles.fontFiles+'" to "'+ paths.styleGuide.final + 'fonts/"');
    return gulp.src(appFiles.fontFiles)
        .pipe(gulp.dest(paths.styleGuide.final + 'fonts/'));
});

// Delete unneeded files 
gulp.task('cleanGuide2', function() {
    console.log('nx: CLEANING up StyleGuide');
    return gulp.src(paths.styleGuide.final + 'fonts/_iconFontTemplate/', { read: false }) // much faster
        .pipe(rimraf());
});

// Final standalone build - styleGuide
gulp.task('guide', function(){ 
    runSequence('libStyle', 'javascript', 'cleanGuide', 'kss-shell', 'kss-assets', 'cleanGuide2');
});
// Final gulp build - styleGuide
gulp.task('buildGuide', function(){ 
    runSequence('cleanGuide', 'kss-shell', 'kss-assets', 'cleanGuide2');
});


/**************
 * WATCH TASK *
 **************/

// Compile assets for guide
gulp.task('watching', function(){ 
    runSequence('buildFont', 'buildGuide');
});

gulp.task('watch', ['watching'], function() {
    // Watch SVG files and create font and guide when they are changed
    gulp.watch(appFiles.iconSvg, ['buildFont', 'buildGuide'])
        .on('change', function(event) {
            console.log('[' + event.type + '] ' + event.path);
        });
});


/********
 * GULP *
 ********/

// Task list 
gulp.task('final', function(){ 
    runSequence('cleanIcons', 'iconFontFace', 'iconGlyphs', 'copyFontGuide', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'copyFont', 'cleanFontFolder', 'cleanGuide', 'kss-shell', 'kss-assets', 'cleanGuide2');
});

// Default task
gulp.task('default', ['final']);