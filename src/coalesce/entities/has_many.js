import Collection from './collection';
import Relationship from './relationship';
import mixin from '../utils/mixin';

export default class HasMany extends mixin(Collection, Relationship) {

  constructor(owner=null, field=null) {
    super(owner, field);
    this._suspendInverseUpdates = false;
  }

  get() {
    return this;
  }

  set(models) {
    var session = this.session;
    if(this.session) {
      models = models.map(function(model) {
        return session.adopt(model);
      });
    }
    this.isLoaded = true;
    this.replace(0, this.length, models);
  }

  fork(graph) {
    var dest = graph.fetch(this);
    if(this.isLoaded) {
      dest.set(this);
    }
    return dest;
  }

  arrayContentWillChange(index, removed, added) {
    var model = this.owner,
        name = this.field.name,
        session = this.session,
        owner = this.owner;

    if(owner) {
      owner.relationshipWillChange(this.field.name);
    }

    if(session) {
      session.touch(this);
      this.suspendInverseUpdates(() => {
        for (var i=index; i<index+removed; i++) {
          var inverseModel = this.objectAt(i);
          if(inverseModel) {
            var inverse = this.inverseFor(inverseModel);
            inverse.inverseWillRemove(this);
          }
        }
      });
    }

    return super.arrayContentWillChange(index, removed, added);
  }

  arrayContentDidChange(index, removed, added) {
    super.arrayContentDidChange(index, removed, added);

    var model = this.owner,
        name = this.field.name,
        session = this.session,
        owner = this.owner;

    for (var i=index; i<index+added; i++) {

      var inverseModel = this.objectAt(i);
      if (session) {
        this.suspendInverseUpdates(() => {
          var inverse = this.inverseFor(inverseModel);
          inverse.inverseDidAdd(this);
        });
      }

      if(this.embedded) {
        inverseModel._embeddedParent = this;
      }
    }

    if(owner) {
      owner.relationshipDidChange(this.field.name);
    }
  }

  inverseWillRemove(inverse) {
    if(this._suspendInverseUpdates) return;
    this.removeObject(inverse.owner);
  }

  inverseDidAdd(inverse) {
    if(this._suspendInverseUpdates) return;
    this.addObject(inverse.owner);
  }

  static clientId(ownerClientId, field) {
    console.assert(ownerClientId, "Owner must have a clientId set");
    return `${ownerClientId}$${field.name}`;
  }

}
