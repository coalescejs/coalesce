var fs = require('fs');
var traceur = require('broccoli-traceur');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var moveFile = require('broccoli-file-mover');
var concat = require('broccoli-concat');
var uglify = require('broccoli-uglify-js');
var removeFile = require('broccoli-file-remover');
var defeatureify = require('broccoli-defeatureify');
var coffee = require('broccoli-coffee');
var replace = require('broccoli-replace');
var yuidocCompiler = require('broccoli-yuidoc');

var calculateVersion = require('./lib/calculate-version');

var licenseJs = fs.readFileSync('./generators/license.js').toString();

var devAmd = (function() {
  var tree = pickFiles('src', {
    srcDir: '/',
    destDir: 'coalesce'
  });
  var vendoredPackage = moveFile(tree, {
    srcFile: 'coalesce/main.js',
    destFile: '/coalesce.js'
  });

  tree = mergeTrees([tree, vendoredPackage]);
  tree = removeFile(tree,  {
    files: ['coalesce/main.js']
  });
  var transpiled = traceur(tree, {
    moduleName: true,
    modules: 'amd',
    annotations: true
  });
  return concat(transpiled, {
    inputFiles: ['**/*.js'],
    outputFile: '/coalesce.amd.js'
  });
})();

var prodAmd = (function() {

  var tree = moveFile(devAmd, {
    srcFile: 'coalesce.amd.js',
    destFile: '/coalesce.prod.amd.js'
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

var vendor = mergeTrees(['node_modules/traceur/bin', 'bower_components', 'vendor']);

function concatStandalone(tree, inputFile, outputFile) {
  var iifeStart = writeFile('iife-start', '(function() {');
  var iifeStop  = writeFile('iife-stop', '})();');
  var bootstrap = writeFile('bootstrap', 'this.Coalesce = requireModule("coalesce")["default"];\n');

  var trees = [vendor, iifeStart, iifeStop, bootstrap, tree];

  return concat(mergeTrees(trees), {
    inputFiles: [
      'iife-start',
      'loader/loader.js',
      'traceur-runtime.js',
      'backburner.amd.js',
      inputFile,
      'bootstrap',
      'iife-stop'
    ],
    outputFile: outputFile
  });
}


var devStandalone = concatStandalone(devAmd, 'coalesce.amd.js', '/coalesce.standalone.js');
var prodStandalone = concatStandalone(prodAmd, 'coalesce.prod.amd.js', '/coalesce.prod.standalone.js');

var minStandalone = (function() {

  var tree = moveFile(prodStandalone, {
    srcFile: 'coalesce.prod.standalone.js',
    destFile: '/coalesce.prod.standalone.min.js'
  });
  return uglify(tree);

})();

var testTree = (function() {
  var testAmd = (function() {
    var tree = pickFiles('test', {
      srcDir: '/',
      destDir: 'coalesce-test'
    });

    tree = coffee(tree, {
      bare: true
    });

    var transpiled = traceur(tree, {
      moduleName: true,
      modules: 'amd'
    });
    return concat(transpiled, {
      inputFiles: ['**/*.js'],
      outputFile: '/coalesce-test.amd.js'
    });
  })();
  
  var testVendorJs = concat(vendor, {
    inputFiles: [
      'sinonjs/sinon.js',
      'mocha/mocha.js',
      'mocha-lazy-bdd/dist/mocha-lazy-bdd.js',
      'chai/chai.js',
      'jquery/dist/jquery.js',
      'lodash/dist/lodash.js',
      'loader/loader.js',
      'traceur-runtime.js',
      'backburner.amd.js'
    ],
    outputFile: '/vendor.js'
  });
  
  var testVendorCss = pickFiles(vendor, {
    srcDir: '/mocha',
    files: ['mocha.css'],
    destDir: '/'
  });
  
  var trees = mergeTrees([testVendorJs, testAmd, devAmd, 'test', testVendorCss]);
  return pickFiles(trees, {
    srcDir: '/',
    files: [
      'vendor.js',
      'mocha.css',
      'coalesce.amd.js',
      'coalesce-test.amd.js',
      'index.html'
    ],
    destDir: 'test'
  });
  
})();


var bowerJSON = writeFile('bower.json', JSON.stringify({
  name: 'coalesce',
  version: 'VERSION_STRING_PLACEHOLDER',
  license: "MIT",
  main: 'coalesce.js',
  ignore: ['docs', 'test', 'testem.js'],
  keywords: [
    "coalesce",
    "orm",
    "persistence",
    "data",
    "sync"
  ]
}, null, 2));

distTree = mergeTrees([bowerJSON, devAmd, prodAmd, devStandalone, prodStandalone, minStandalone]);
distTree = replace(distTree, {
  files: [ '**/*.js' ],
  patterns: [
    { match: /^/, replacement: licenseJs }
  ]
});
distTree = replace(distTree, {
  files: [ '**/*' ],
  patterns: [
    { match: /VERSION_STRING_PLACEHOLDER/g, replacement: calculateVersion }
  ]
});

var docs = yuidocCompiler('src', {
  srcDir: '/',
  destDir: 'docs'
});

var testemDummy = writeFile('testem.js', '');

module.exports = mergeTrees([docs, distTree, testTree, testemDummy]);
