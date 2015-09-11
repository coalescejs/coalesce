var fs = require('fs');
var babel = require('broccoli-babel-transpiler');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var moveFile = require('broccoli-file-mover');
var concat = require('broccoli-concat');
var concatWithSourceMaps = require('broccoli-sourcemap-concat');
var removeFile = require('broccoli-file-remover');
var defeatureify = require('broccoli-defeatureify');
var coffee = require('broccoli-coffee');
var replace = require('broccoli-replace');
var sourceMap = require('broccoli-source-map');

var calculateVersion = require('./lib/calculate-version');

var licenseJs = fs.readFileSync('./generators/license.js').toString();

var devBundledModules = (function() {
  var tree = babel('src', {
    modules: 'system',
    moduleIds: true,
    sourceRoot: 'coalesce',
    moduleRoot: 'coalesce',
    externalHelpers: true,
    //sourceMap: 'inline'
  });
  tree = sourceMap.extract(tree);
  return concatWithSourceMaps(tree, {
    inputFiles: ['**/*.js'],
    outputFile: '/coalesce.system.js'
  });
})();


var prodBundledModules = (function() {
  var tree = babel('src', {
    modules: 'system',
    moduleIds: true,
    sourceRoot: 'coalesce',
    moduleRoot: 'coalesce',
    externalHelpers: true,
    sourceMap: 'inline'
  });
  
  tree = sourceMap.extract(tree);
  return concatWithSourceMaps(tree, {
    inputFiles: ['**/*.js'],
    outputFile: '/coalesce.prod.system.js'
  });

  tree = defeatureify(tree, {
    enabled: true,
    enableStripDebug: true,
    debugStatements: [
      "console.assert"
    ]
  });

  return tree;
})();


var vendor = mergeTrees(['bower_components', 'vendor', 'node_modules']);

var testTree = (function() {

  var testBundledModules = (function() {
    // XXX: need add source map support once this gets resolved: https://github.com/joliss/broccoli-coffee/pull/9
    tree = coffee('test', {
      bare: true
    });

    tree = babel(tree, {
      modules: 'system',
      moduleIds: true,
      externalHelpers: true,
      //sourceMap: 'inline',
      sourceRoot: 'coalesce-test'
    });
    //tree = sourceMap.extract(tree);
    return concat(tree, {
      inputFiles: ['**/*.js'],
      outputFile: '/test/coalesce-test.system.js'
    });
  })();

  var testVendor = pickFiles(vendor, {
    srcDir: '/',
    files: [
      'babel-core/browser-polyfill.js',
      'babel-core/external-helpers.js',
      'es6-module-loader/dist/es6-module-loader.js',
      'es6-module-loader/dist/es6-module-loader.js.map',
      'systemjs/dist/system.js',
      'jquery/dist/jquery.js',
      'lodash/dist/lodash.js',
      'backburner.js',
      'sinonjs/sinon.js',
      'mocha/mocha.js',
      'mocha/mocha.css',
      'mocha-lazy-bdd/dist/mocha-lazy-bdd.js',
      'chai/chai.js'
    ],
    destDir: 'test/vendor'
  });

  var testIndex = pickFiles('test', {
    srcDir: '/',
    destDir: '/test',
    files: ['index.html']
  });

  return mergeTrees([testIndex, testBundledModules, testVendor]);

})();


var bowerJSON = writeFile('bower.json', JSON.stringify({
  name: 'coalesce',
  version: 'VERSION_STRING_PLACEHOLDER',
  license: "MIT",
  main: 'coalesce.js',
  ignore: ['docs', 'test', 'testem.js'],
  keywords: require('./package.json').keywords
}, null, 2));

distTree = mergeTrees([bowerJSON, devBundledModules, prodBundledModules]);
// XXX: need to support source maps with this
// distTree = replace(distTree, {
//   files: [ '**/*.js' ],
//   patterns: [
//     { match: /^/, replacement: licenseJs }
//   ]
// });
distTree = replace(distTree, {
  files: [ '**/*' ],
  patterns: [
    { match: /VERSION_STRING_PLACEHOLDER/g, replacement: calculateVersion }
  ]
});

var testemDummy = writeFile('testem.js', '');

module.exports = mergeTrees([distTree, testTree, testemDummy]);
