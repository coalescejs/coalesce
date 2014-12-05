
// simple promise wrapper for set timeout

function delay(delay, fn) {
  return new Coalesce.Promise(function(resolve, reject) {
    setTimeout( () => {
      resolve(fn());
    }, delay);
  });
};

export {delay};
