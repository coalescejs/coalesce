var babel = require('broccoli-babel-transpiler'),
    concatWithSourceMaps = require('broccoli-sourcemap-concat'),
    defeatureify = require('broccoli-defeatureify'),
    replaceVersion = require('./replace-version'),
    sourceMap = require('broccoli-source-map'),
    Funnel = require('broccoli-funnel'),
    _ = require('lodash');
    
module.exports = function bundle(tree, options) {
  if(!options) {
    options = {};
  }
  
  _.defaults(options, {
    optimize: false,
    modules: 'system'
  });
  
  tree = new Funnel(tree, {
    getDestinationPath: function(relativePath) {
      if (relativePath === 'main.js') {
        return 'coalesce.js';
      }
      return "coalesce/" + relativePath;
    }
  });
  
  tree = babel(tree, {
    modules: options.modules,
    moduleIds: true,
    externalHelpers: true,
    sourceMap: 'inline'
  });
  
  tree = sourceMap.extract(tree);
  tree = concatWithSourceMaps(tree, {
    inputFiles: ['**/*.js'],
    outputFile: '/coalesce.' + (options.optimize ? 'prod.' : '') + options.modules + '.js'
  });

  if(options.optimize) {
    tree = defeatureify(tree, {
      enabled: true,
      enableStripDebug: true,
      debugStatements: [
        "console.assert"
      ]
    });
  }
  
  tree = replaceVersion(tree);

  return tree;
}
