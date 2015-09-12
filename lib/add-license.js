
var fs = require('fs'),
    replace = require('broccoli-replace'),
    licenseJs = fs.readFileSync('./generators/license.js').toString();

module.exports = function(tree) {
  // XXX: need to support source maps with this
  return replace(tree, {
    files: [ '**/*.js' ],
    patterns: [
      { match: /^/, replacement: licenseJs }
    ]
  });
}
