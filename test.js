import 'mocha';
import 'mocha/mocha.css';
import 'mocha-lazy-bdd';
import 'babel-polyfill';
import 'isomorphic-fetch';

mocha.setup('lazy-bdd');

System.import('coalesce-tests').then(() => {
  maybeLoadTestem().then(() => {
    mocha.run();
  });
});

// Testem.js will only be present when run in the testem harness
function maybeLoadTestem() {
  return new Promise((onload, onerror) => {
    const script = document.createElement('script');
    const src = '/testem.js';
    Object.assign(script, { src, onload, onerror });
    document.head.appendChild(script);
  }).catch(() => {
    console.warn('Not loading testem');
  });
}
