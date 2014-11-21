# Vlasterx Font Icons
This collection of scripts enables end-user to create font-icons from SVG graphics.
It is build on top of *node.js* and multiple *gulp* processes. 

[vxIcons GitHub repo](https://github.com/Vlasterx/vxFontIcons)

## How to install?

### Install from scratch:
1. Clone this repo in a local folder
2. Install [Node.js](http://nodejs.org/download)

### From within local folder run these commands:
1. Install *gulp* globbaly by running command: *npm install gulp -g*
2. Install all required gulp plugins by running command: *npm install*

You are now all set to use this collection.


## How to use it?
In order to use this collection, you first need to do following steps:

1. Copy your SVG's to *icons16* folder
2. In your shell run *gulp* command

Gulp process will do the following
- It will create icon fonts and will copy them to *fonts/vxIcons* folder
- It will create SCSS styles within that folder
- It will create styleGuide for your icons by using KSS node and will place it in *styleGuide* folder

## File Revving
These font building pack usess font revving, which means that it will add different font version for each build. Apache will be able to read and refresh fonts every time they are rebuilt, so keep in mind that .htaccess file.

## Author
Vladimir Jovanović
[Twitter](https://twitter.com/vlasterx) | [Facebook](https://www.facebook.com/dizajn.ninja) | [LinkedIn](http://vx.rs/linkedin) 