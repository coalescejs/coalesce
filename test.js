import 'mocha';
import 'mocha-lazy-bdd';
//import 'testem.js';

mocha.setup('lazy-bdd');

System.import('coalesce-tests').then(() => {
  mocha.run();
});
