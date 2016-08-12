var nxName          = 'Nexus Font Icons',
    nxVersion       = 'v2.1.0',
    nxGit           = 'https://github.com/Vlasterx/nexus-font-icons';

/***********
 * PLUGINS *
 ***********/

var gulp 		         = require('gulp'),
    sass 		         = require('gulp-sass'),
    less            = require('gulp-less'),
    rename 		       = require('gulp-rename'),
    prefix 		       = require('gulp-autoprefixer'),
    iconfont        = require('gulp-iconfont'),
    iconfontCss     = require('gulp-iconfont-css'),
    resolver 	      = require("gulp-resolver"),
    shell 		        = require('gulp-shell'),
    cssmin 		       = require('gulp-cssmin'),
    cleancss 	      = require('gulp-cleancss'),
    gcmq 		         = require('gulp-group-css-media-queries'),
    concat 		       = require('gulp-concat'),
    insert 		       = require('gulp-insert'),
    clc             = require('cli-color'),
    del             = require('del'),
    plumberNotifier = require('gulp-plumber-notifier'),
    runSequence     = require('run-sequence').use(gulp);


// Colored log messages
var error   = clc.red.bold,
    warn    = clc.yellow,
    notice  = clc.blue,
    notice2 = clc.blue.bold,
    green   = clc.green,
    cyan    = clc.cyan,
    yellow  = clc.yellow;

/**********************
 * Icon font settings *
 **********************/
var fontName = 'icons',
    fontVersion = Math.floor(Date.now()); // Timestamp in miliseconds

// Apply file revving to font files? 
// For `true`, add these lines to .htaccess files:
// 
//    # Turn on mod_rewrite (must be turned on in Apache httpd.conf)
//    Options +FollowSymlinks
//    RewriteEngine On
//
//    ######################
//    # Icons file revving #
//    ######################
//
//    RewriteCond %{REQUEST_FILENAME} !-f
//    RewriteCond %{REQUEST_FILENAME} !-d
//    RewriteRule ^(.+)\.(\d+)\.(eot|svg|woff2?|ttf)$ $1.$3 [L]

var fileRevving = false;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 8', 'opera >= 12.1', 'ios >= 6', 'android >= 4', 'Firefox >= 4'];

// Cleanup this files when compilation ends
var cleanup = [ "public/**/*", "!public/dud.md" ];



/***********
 * LIBSASS *
 ***********/

// SASS to CSS
gulp.task('sass', function () {
    return gulp.src(["project/**/*.scss", "!project/_**/*.scss", "!project/**/icon-font/**"])
        //.pipe(sourcemaps.init())
        .pipe(plumberNotifier())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact'
        }))
        .pipe(cleancss({
            keepBreaks: true,            
            keepSpecialComments: 1,
            debug: true, 
            semanticMerging: true }, 
            function(details) {
                console.log(details.name + ': ' + details.stats.originalSize);
                console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gcmq())
        .pipe(prefix(COMPATIBILITY))
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("public/"));
});

// SASS to minified CSS
gulp.task('minsass', function() {
    return gulp.src(["project/**/*.scss", "!project/**/_*.scss", "!project/_**/*.scss", "!project/**/icon-font/**"])
        // .pipe(sourcemaps.init())
        .pipe(plumberNotifier())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact'
        }))
        .pipe(prefix(COMPATIBILITY))
        .pipe(gcmq())
        .pipe(cleancss({
            keepBreaks: false,            
            keepSpecialComments: 0
        }))
        .pipe(cssmin())
        .pipe(rename(function(path) { path.extname = '.min.css'; }))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("public/"));
        
});

// Minify plain CSS
gulp.task('mincss', function() {
    return gulp.src(["project/**/*.css", "!project/_**/*.css", "!project/**/*.min.css"])
        // .pipe(sourcemaps.init())
        .pipe(plumberNotifier())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compact'
        }))
        .pipe(prefix(COMPATIBILITY))
        .pipe(gcmq())
        .pipe(cleancss({
            keepBreaks: false,            
            keepSpecialComments: 0
        }))
        .pipe(cssmin())
        .pipe(rename(function(path) { path.extname = '.min.css'; }))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("public/"));
        
});

// SASS for DEV environment - First build icons, then build SASS
gulp.task('libStyle', function(){ 
    return runSequence('cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'sass', 'minsass', 'mincss');
});

// Build SASS only, Icons must be built first
gulp.task('libStyleLite', function(){ 
    return runSequence('iconSass', 'sass', 'minsass', 'mincss');
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
gulp.task('cleanIcons', function () {
    return del([
        'project/icon-font/generated/',
        'public/icon-font/generated/'
    ]);
});

// 2. Make web fonts from SVG and create SCSS files
gulp.task('iconFontFace', function(){
    return gulp.src(['project/**/icon-font*/svg/*.svg', '!project/**/_icon-font*/svg/*.svg', '!project/**/icon-font*/svg/_*.svg'])
        .pipe(plumberNotifier())
        .pipe(iconfontCss({
            fontName: fontName,
            appendUnicode: true,
            formats: ['svg', 'ttf', 'eot', 'woff'],
            path: 'project/icon-font/template/icon-template-fontFace.scss',
            targetPath: fontName+'.scss',
            fontPath: fontName
        }))
        .pipe(iconfont({
            fontHeight: 512,
            normalize: true,
            descent: 64,
            fontName: fontName
        }))
        .pipe(gulp.dest('project/icon-font/generated/'));
});
gulp.task('iconGlyphs', function(){
    return gulp.src(['project/**/icon-font*/svg/*.svg', '!project/**/_icon-font*/svg/*.svg', '!project/**/icon-font*/svg/_*.svg'])
        .pipe(plumberNotifier())
        .pipe(iconfontCss({
            fontName: fontName,
            appendUnicode: true,
            formats: ['svg', 'ttf', 'eot', 'woff'],
            path: 'project/icon-font/template/icon-template-glyphs.scss',
            targetPath: fontName+'-glyphs.scss',
            fontPath: fontName
        }))
        .pipe(iconfont({
            fontHeight: 512,
            normalize: true,
            descent: 64,
            fontName: fontName
        }))
        .pipe(gulp.dest('project/icon-font/generated/'));
});

// copy font guide to generated font folder
gulp.task('copyFontGuide', function () {
    console.log(notice('nx: COPYING font guide to generated font folder"'));
    return gulp.src('project/icon-font/styleguide.md')
        .pipe(gulp.dest('public/icon-font/generated/'));
});


// 3. Append version for font files
gulp.task('iconRename', function () {
    if(fileRevving === true) {        
        return gulp.src(['project/icon-font/generated/*.*'])
            .pipe(rename({
                suffix: "."+fontVersion,
            }))
            .pipe(gulp.dest('project/icon-font/generated/'));
    }
});

// 3.1. Add revving to scss
gulp.task('iconRev', function () {
    if(fileRevving === true) { 
        return gulp.src('project/icon-font/generated/*.scss')
            .pipe(resolver.css({
                assetsDir: 'project/icon-font/generated/'
            }))
            .pipe(gulp.dest('project/icon-font/generated/'))  
    }
});

// 3.2. Delete unneeded rev files
gulp.task('cleanRev', function() {
    if(fileRevving === true) { 
        return del([
            'project/icon-font/generated/*.*.*'
        ]);
    }
});

// 4. Create CSS from SCSS
gulp.task('iconSass', function () {
    return gulp.src('project/icon-font/generated/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('project/icon-font/generated/'));
});

// 5. Copy finished font to public folder
gulp.task('copyFont', function () {
    console.log(notice('nx: COPY fonts from project to public folder'));
    return gulp.src(['project/icon-font/generated/**/*.*', 'project/icon-font/.htaccess'])
        .pipe(gulp.dest('public/icon-font/generated/'));
});


// Final build - Icon font
gulp.task('buildFont', function(){ 
    runSequence('cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'copyFont', 'copyFontGuide');
});



/***************
 * STYLE GUIDE *
 ***************/

// Generate kss.css from kss.less file
gulp.task('guideless', function () {
  return gulp.src('styleGuideTemplate/public/kss.less')
    .pipe(plumberNotifier())
    .pipe(less())
    .pipe(gulp.dest('styleGuideTemplate/public/'));
});

// Delete old styleGuide
gulp.task('cleanGuide', function() {
    console.log(notice('nx: DELETING old styleGuide'));
    return del([
        'styleGuide/'
    ]);
});

// Concat all SCSS files for styleguide (it doesn't have to be pretty since you only need comments)
// Font icon templates are excluded
gulp.task('concat-scss', function() {
    return gulp.src(['project/**/*.scss', '!project/**/template/**/*.scss', '!project/_**/*.scss', '!project/**/_*.scss'])
        .pipe(plumberNotifier())
        .pipe(concat('all.scss'))
        .pipe(gulp.dest("styleGuide/"));   
});

// Concat all styleguide.md files and copy them to styleguides folder
gulp.task('concat-md', function() {
    return gulp.src(['project/**/styleguide.md'])
        .pipe(plumberNotifier())
        .pipe(concat('styleguide.md'))
        .pipe(gulp.dest("styleGuide/"));   
});

// Start KSS from shell
gulp.task('kss-shell', shell.task([
    'kss-node --source <%= source %> --destination <%= destination %> --template <%= template %>'
], {
    templateData: {
        source: 'styleGuide',
        destination: 'styleGuide',
        template: 'styleGuideTemplate'
    }
}));

// Copy generated icon fonts to styleGuide folder
gulp.task('kss-assets', function () {
    return gulp.src(['project/icon-font/generated/*.*', 'project/icon-font/.htaccess'])
        .pipe(gulp.dest('styleGuide/fonts/icons/'));
});

// Final standalone build - styleGuide
gulp.task('guide', function(){ 
    runSequence('libStyle', 'javascript', 'guideless', 'cleanGuide', 'concat-md', 'concat-scss', 'kss-shell', 'kss-assets');
});
// Final gulp build - styleGuide
gulp.task('buildGuide', function(){ 
    runSequence('guideless', 'cleanGuide', 'concat-md', 'concat-scss', 'kss-shell', 'kss-assets');
});


// Cleanup
gulp.task('cleanUp', function () {
    return del(cleanup);
});


// Final move fonts from generated
gulp.task('moveFonts1', function () {
   return gulp.src(['public/icon-font/generated/**/*.*'])
    .pipe(gulp.dest('public/'+fontName))
});
gulp.task('moveFonts2', function () {
  return del('public/icon-font/')
});
gulp.task('done', function() {
  console.log(cyan('------------------------------------------------------------------------'));
  console.log(notice2('ICON FONT HAS BEEN GENERATED!\n'));
  console.log(green('Finished webfont:'));
  console.log(yellow('"[project root] public/'+fontName+'/"\n'));
  console.log(green('Styleguide:'));
  console.log(yellow('"[project root] styleGuide/"'));
  console.log(cyan('------------------------------------------------------------------------'));
  console.log(cyan('> Project home:  '+nxGit));
  console.log(cyan('> Author home:   http://www.webdizajn.org'));
  console.log(cyan('> Author blog:   https://steemit.com/@webdesign\n'));
  console.log(notice2(':) Thank you for using '+nxName+' '+nxVersion));
  console.log(cyan('------------------------------------------------------------------------'));
})

/********
 * GULP *
 ********/

// Task list 
gulp.task('final', function(){ 
    runSequence('cleanUp', 'cleanIcons', 'iconFontFace', 'iconGlyphs', 'iconRename', 'iconRev', 'cleanRev', 'iconSass', 'sass', 'copyFont', 'guideless', 'cleanGuide', 'concat-md', 'concat-scss', 'kss-shell', 'kss-assets', 'minsass', 'mincss', 'moveFonts1', 'moveFonts2', 'done');
});


// Default task
gulp.task('default', ['final']);

