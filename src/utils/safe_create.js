export default function safeCreate(klass, ...args) {
  // back-compat with ember
  if(typeof klass.create === 'function') {
    return klass.create(...args);
  } else {
    return new klass(...args);
  }
}
