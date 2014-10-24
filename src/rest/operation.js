import Coalesce from '../namespace';

/**
  @private
  An operation that is part of a flush

  @namespace rest
  @class Operation
*/
export default class Operation {
  constructor(model, graph, adapter, session) {
    this.model = model;
    this.graph = graph;
    this.adapter = adapter;
    this.session = session;
    // forces the operation to be performed
    this.force = false
    this.children = new Set();
    this.parents = new Set();
    var op = this;
    this.promise = new Coalesce.Promise(function(resolve, reject) {
      op.resolve = resolve;
      op.reject = reject;
    });
  }

  then(...args) {
    var promise = this.promise;
    return promise.then.apply(promise, args);
  }

  // determine which relationships are affected by this operation
  // TODO: we should unify this with dirty checking
  get dirtyRelationships() {
    var adapter = this.adapter,
        model = this.model,
        rels = [],
        shadow = this.shadow;

    if(model.isNew) {
      // if the model is new, all relationships are considered dirty
      model.eachRelationship(function(name, relationship) {
        if(adapter.isRelationshipOwner(relationship)) {
          rels.push({name: name, type: relationship.kind, relationship: relationship, oldValue: null});
        }
      }, this);
    } else {
      // otherwise we check the diff to see if the relationship has changed,
      // in the case of a delete this won't really matter since it will
      // definitely be dirty
      var diff = model.diff(shadow);
      for(var i = 0; i < diff.length; i++) {
        var d = diff[i];
        if(d.relationship && adapter.isRelationshipOwner(d.relationship)) {
          rels.push(d);
        }
      }
    }

    return rels;
  }

  get isDirty() {
    return !!this.dirtyType;
  }

  get isDirtyFromUpdates() {
    var model = this.model,
        shadow = this.shadow,
        adapter = this.adapter;

    // this case could happen via a dirty relationship where the other side does
    // not have an inverse (in which case the model will not be dirty and hence no shadow)
    if(!shadow) return false;

    var diff = model.diff(shadow);
    var dirty = false;
    var relDiff = [];
    for(var i = 0; i < diff.length; i++) {
      var d = diff[i];
      if(d.type == 'attr') {
        dirty = true;
      } else {
        relDiff.push(d);
      }
    }
    return dirty || adapter.isDirtyFromRelationships(model, shadow, relDiff);
  }

  get dirtyType() {
    var model = this.model;
    if(model.isNew) {
      return "created";
    } else if(model.isDeleted) {
      return "deleted";
    } else if(this.isDirtyFromUpdates || this.force) {
      return "updated";
    }
  }

  perform() {
    var adapter = this.adapter,
        session = this.session,
        dirtyType = this.dirtyType,
        model = this.model,
        shadow = this.shadow,
        promise;

    if(!dirtyType || !adapter.shouldSave(model)) {
      if(adapter.isEmbedded(model)) {
        // if embedded we want to extract the model from the result
        // of the parent operation
        promise = this._promiseFromEmbeddedParent();
      } else {
        // return an "identity" promise if we don't want to do anything
        promise = Coalesce.Promise.resolve();
      }
    } else if(dirtyType === "created") {
      promise = adapter._contextualizePromise(adapter._create(model), model);
    } else if(dirtyType === "updated") {
      promise = adapter._contextualizePromise(adapter._update(model), model);
    } else if(dirtyType === "deleted") {
      promise = adapter._contextualizePromise(adapter._deleteModel(model), model);
    }

    promise = promise.then(function(serverModel) {
      // in the case of new records we need to assign the id
      // of the model so dependent operations can use it
      if(!model.id) {
        model.id = serverModel.id;
      }
      if(!serverModel) {
        // if no data returned, assume that the server data
        // is the same as the model
        serverModel = model;
      } else {
        if(serverModel.meta && Object.keys(serverModel).length == 1 ){
          model.meta = serverModel.meta;
          serverModel = model;
        }
        if(!serverModel.clientRev) {
          // ensure the clientRev is set on the returned model
          // 0 is the default value
          serverModel.clientRev = model.clientRev;
        }
      }
      return serverModel;
    }, function(serverModel) {
      // if the adapter returns errors we replace the
      // model with the shadow if no other model returned
      // TODO: could be more intuitive to move this logic
      // into adapter._contextualizePromise

      // there won't be a shadow if the model is new
      if(shadow && serverModel === model) {
        shadow.errors = serverModel.errors;
        throw shadow;
      }
      throw serverModel;
    });
    this.resolve(promise);
    return this;
  }
  
  // Fail this operation. This is called externally when this operation's
  // dependencies fail
  fail() {
    var errors = this.adapter.serializerFactory.serializerFor('errors');
    // TODO: for now just set a status code, need to think through differentiating
    // types of errors, especially ones that are not field-specific
    errors.status = 0;
    this.model.errors = errors;
    return this.model;
  }

  get _embeddedParent() {
    var model = this.model,
        parentModel = this.adapter._embeddedManager.findParent(model),
        graph = this.graph;

    console.assert(parentModel, "Embedded parent does not exist!");

    return graph.getOp(parentModel);
  }

  _promiseFromEmbeddedParent() {
    var model = this.model,
        adapter = this.adapter;

    function findInParent(parentModel) {
      var res = null;
      adapter._embeddedManager.eachEmbeddedRecord(parentModel, function(child, embeddedType) {
        if(res) return;
        if(child.isEqual(model)) res = child;
      });
      return res;
    }

    return this._embeddedParent.then(function(parent) {
      return findInParent(parent);
    }, function(parent) {
      throw findInParent(parent);
    });
  }

  addChild(child) {
    this.children.add(child);
    child.parents.add(this);
  }

}
