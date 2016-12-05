import 'mocha';
import 'mocha-lazy-bdd';
import 'babel-polyfill';
import 'isomorphic-fetch';
import 'testem.js';

mocha.setup('lazy-bdd');

System.import('coalesce-tests').then(() => {
  mocha.run();
});
