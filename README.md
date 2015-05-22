     Vlasterx                                             
     _|_|_|_|                      _|                
     _|        _|_|    _|_|_|    _|_|_|_|            
     _|_|_|  _|    _|  _|    _|    _|                
     _|      _|    _|  _|    _|    _|                
     _|        _|_|    _|    _|      _|_|            

     _|_|_|                                          
       _|      _|_|_|    _|_|    _|_|_|      _|_|_|  
       _|    _|        _|    _|  _|    _|  _|_|      
       _|    _|        _|    _|  _|    _|      _|_|  
     _|_|_|    _|_|_|    _|_|    _|    _|  _|_|_|                                         

This collection of scripts enables end-user to create font-icons from SVG graphics.
It is build on top of **node.js** and multiple **gulp** processes. 

## How to install?

### Install from scratch:
1. Clone this repo in a local folder
2. Install [Node.js](http://nodejs.org/download) version 0.10.36

### From within local folder run these commands:
1. Install **gulp** globally by running command: `npm install gulp -g`
2. Install all required gulp plugins by running command: `npm install`

You are now all set to use this collection.


## How to use it?
In order to use this collection, you first need to do following steps:

1. Copy your SVG's to `./production/icons` folder
2. In your shell run `gulp` command

Gulp process will do the following
- It will create icon fonts and will copy them to `.public/fonts/icons` folder
- It will create SCSS styles within that folder for glyphs and web fonts
- It will create styleGuide for your icons by using KSS node and will place it in `styleGuide` folder


## File Revving
This font building pack usess font revving, which means that it will add different font version for each build. Apache will be able to read and refresh fonts every time they are rebuilt without user needing to reload a page or empty browser cache, so keep in mind that `.htaccess` file.

File revving is turned off by default. If you want to use this feature, open gulp.js and change 
`var fileRevving` from `false` to `true`

 
## Custom font name
If you want to change font name, you need to change few lines of code.

In `gulpfile.js` find `var fontName = 'icons'` and change to your desired font name




# How to build great pixel perfect icons? #
Icons are autmatically generated from SVG graphics inside `./project/icons` folder. SVG graphics should be made on canvas which has height of `512px` and where gridline is set every 32px, with 4 subdivisions. There is an example Adobe Illustrator file in `./project/icons/test.ai`

When you create icons, in order for them to be pixel perfect in size of `16px`, you must align curves to main gridlines. If you plan to make icons for some other pixel-perfect size, you must recalculate grid and canvas size.

All graphics in SVG must follow these rules
- only vectors are included, all raster graphics are discarded
- only flat surfaces are included. All strokes must be converted to fills, use `Object -> Expand` command.
- only one color is accepted. If you plan to make hollow objects, use `Pathfinder -> Exclude` command.


### Author ###
Vladimir Jovanović
[web site](http://www.webdizajn.org) | [Twitter](https://twitter.com/vlasterx) | [Facebook](https://www.facebook.com/dizajn.ninja) | [LinkedIn](http://vx.rs/linkedin) 
