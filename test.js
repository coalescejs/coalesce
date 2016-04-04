import 'mocha-lazy-bdd';

mocha.setup('lazy-bdd');

System.import('coalesce-tests').then(() => {
  mocha.run();
});
