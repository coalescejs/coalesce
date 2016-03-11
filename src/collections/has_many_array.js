import ModelArray  from '../collections/model_array';

export default class HasManyArray extends ModelArray {
  
  get session() {
    return this.owner && this.owner.session;
  }
  
  replace(idx, amt, objects) {
    if(this.session) {
      objects = objects.map(function(model) {
        return this.session.add(model);
      }, this);
    }
    super.replace(idx, amt, objects);
  }

  arrayContentWillChange(index, removed, added) {
    var model = this.owner,
        name = this.name,
        session = this.session;

    if(session) {
      session.modelWillBecomeDirty(model);
      if (!model._suspendedRelationships) {
        for (var i=index; i<index+removed; i++) {
          var inverseModel = this.objectAt(i);
          session.inverseManager.unregisterRelationship(model, name, inverseModel);
        }
      }
    }

    return super.arrayContentWillChange(index, removed, added);
  }

  arrayContentDidChange(index, removed, added) {
    super.arrayContentDidChange(index, removed, added);

    var model = this.owner,
        name = this.name,
        session = this.session;
        
    for (var i=index; i<index+added; i++) {
      var inverseModel = this.objectAt(i);
      if (session && !model._suspendedRelationships) {
        session.inverseManager.registerRelationship(model, name, inverseModel);
      }
      
      if(this.embedded) {
        inverseModel._parent = model;
      }
    }
  }
  
  reify() {
    replace(this, 0, this.length, this.map((model) => {
      return this.session.add(model);
    }));
  }

}

var splice = Array.prototype.splice;

function replace(array, idx, amt, objects) {
  var args = [].concat(objects), chunk, ret = [],
      // https://code.google.com/p/chromium/issues/detail?id=56588
      size = 60000, start = idx, ends = amt, count;

  while (args.length) {
    count = ends > size ? size : ends;
    if (count <= 0) { count = 0; }

    chunk = args.splice(0, size);
    chunk = [start, count].concat(chunk);

    start += size;
    ends -= count;

    ret = ret.concat(splice.apply(array, chunk));
  }
  return ret;
}
