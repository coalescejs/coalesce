import Serializer from '../../serializers/base';
import Payload from '../payload';
import {singularize} from '../../utils/inflector';

export default class PayloadSerializer extends Serializer {

  singularize(name) {
    return singularize(name);
  }

  typeKeyFor(name) {
    var singular = this.singularize(name),
        aliases = this.aliases,
        alias = aliases[name];
    return alias || singular;
  }

  rootForTypeKey(typeKey) {
    return typeKey;
  }

  /**
    Note: we serialize a model, but we deserialize
    to a payload object.
  */
  serialize(model) {
    var typeKey = model.typeKey,
        root = this.rootForTypeKey(typeKey),
        res = {},
        serializer = this.serializerFor(typeKey);
    res[root] = serializer.serialize(model);
    return res;
  }

  deserialize(hash, opts) {
    opts = opts || {};
    var result = new Payload(),
        metaKey = this.metaKey,
        errorsKey = this.errorsKey,
        context = opts.context,
        xhr = opts.xhr;

    if(context) {
      if(typeof context === 'string') {
        result.context = [];
      } else if(context.isQuery) {
        result.context = context.unloadedCopy();
        result.add(result.context);
      }
    }

    /**
      If a context for the payload has been specified
      we need to check each model to see if it is/belongs in
      the context
    */
    function checkForContext(model) {
      if(context) {
        if(typeof context === 'string' && typeKey === context ||
          context.isQuery && context.typeKey === typeKey) {
          // context is a typeKey (e.g. for a query)
          result.context.push(model);
        } else if(context.isModel && context.isEqual(model)) {
          // context is a model
          result.context = model;
        }
      }
    }

    for (var prop in hash) {
      if (!hash.hasOwnProperty(prop)) {
        continue;
      }

      if(prop === metaKey) {
        result.meta = hash[prop];
        continue;
      }

      var value = hash[prop];

      if(prop === errorsKey) {
        var serializer = this.serializerFor('errors', opts),
            errors = serializer.deserialize(value, opts);
        result.errors = errors;
        continue;
      }

      var typeKey = this.typeKeyFor(prop),
          serializer = this.serializerFor(typeKey);
      console.assert(!!serializer, `No serializer found for '${typeKey}'`);
      if (Array.isArray(value)) {
        for (var i=0; i < value.length; i++) {
          var model = serializer.deserialize(value[i], {graph: result});
          checkForContext(model);
          result.add(model);
        }
      } else {
        var model = serializer.deserialize(value, {graph: result});
        checkForContext(model);
        result.add(model);
      }
    }
    
    // Ensure that an errors object exists if the request
    // failed. Right now we just check the existence of an
    // xhr object (which is only set on error).
    if(xhr) {
      var errors = result.errors;
      if(!errors) {
        var serializer = this.serializerFor('errors'),
            errors = serializer.deserialize({}, opts);
        result.errors = errors;
      }
    }
    
    return result;
  }

}

PayloadSerializer.reopen({
  metaKey: 'meta',
  aliases: {},
  errorsKey: 'errors'
});
