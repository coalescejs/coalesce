var babel = require('broccoli-babel-transpiler'),
    coffee = require('broccoli-coffee'),
    concat = require('broccoli-concat'),
    mergeTrees = require('broccoli-merge-trees'),
    pickFiles = require('broccoli-static-compiler'),
    writeFile = require('broccoli-file-creator');

var modules =  coffee('test', {
  bare: true
});

modules = babel(modules, {
  modules: 'system',
  moduleIds: true,
  externalHelpers: true,
  //sourceMap: 'inline',
  sourceRoot: 'coalesce-test'
});
//tree = sourceMap.extract(tree);
modules = concat(modules, {
  inputFiles: ['**/*.js'],
  outputFile: '/test/coalesce-test.system.js'
});

var vendor = mergeTrees(['bower_components', 'vendor', 'node_modules']);
vendor = pickFiles(vendor, {
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

var index = pickFiles('test', {
  srcDir: '/',
  destDir: '/test',
  files: ['index.html']
});

var testemDummy = writeFile('testem.js', '');

module.exports = mergeTrees([index, modules, vendor, testemDummy]);
