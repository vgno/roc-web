This is the entry file for modules.

The purpose of the `entry.js` file is to export the modules styles (that will be converted to ICSS) and the module itself. This will make it easy to override the styles without increasing the bundle size.

The code inside this folder will __NOT__ be transpiled with Babel beforehand at the build step of this project. Instead the transpiling will be done when building a module.

_Since a user of Roc never will use this directly the file has been removed from the automatic documentation with ESDoc._
