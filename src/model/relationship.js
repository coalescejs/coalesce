import Field from './field';

export default class Relationship extends Field {
  
  constructor(name, options) {
    // make sure typeKey is set
    console.assert(options.type || options.typeKey, "Must specify a `type` or `typeKey` option");
    if(typeof options.type === "string") {
      var typeKey = options.type;
      delete options.type;
      options.typeKey = typeKey;
    } else if(!options.typeKey) {
      options.typeKey = options.type.typeKey;
    }
    super(name, options);
  }
  
}
