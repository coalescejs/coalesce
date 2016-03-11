var replaceVersion = require('./replace-version'),
    writeFile = require('broccoli-file-creator');

var json = writeFile('bower.json', JSON.stringify({
  name: 'coalesce',
  version: 'VERSION_STRING_PLACEHOLDER',
  license: "MIT",
  main: 'coalesce.js',
  ignore: ['docs', 'test', 'testem.js'],
  keywords: require('../package.json').keywords
}, null, 2));

module.exports = replaceVersion(json);
