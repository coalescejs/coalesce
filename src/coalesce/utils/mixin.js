

function mixinObject(target, source) {
  Object.keys(source).forEach(function(key) {
    var descriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(target, key, descriptor);
  });
  return target;
}

export {mixinObject};

export default function(targetClass, sourceClass) {
  class Extended extends targetClass {};
  mixinObject(Extended.prototype, sourceClass.prototype);
  return Extended;
}
