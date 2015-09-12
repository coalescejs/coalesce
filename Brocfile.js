var mergeTrees = require('broccoli-merge-trees');

module.exports = mergeTrees([
  require('./lib/dist-tree'),
  require('./lib/test-tree')
]);
