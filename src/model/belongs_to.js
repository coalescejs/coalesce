import Relationship from './relationship';
import isEqual from '../utils/is_equal';

export default class BelongsTo extends Relationship {
  
  defineProperty(prototype) {
    var name = this.name,
        embedded = this.embedded;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        var graph = this.graph;
        if(!graph) {
          return this._relationships[name];
        }
        
        // TODO: explore prototypical inheritance here
        if(!this.isFieldLoaded(name) && this.__parent) {
          value = this._relationships[name] = this.__parent._relationships[name];
        }
        
        return value && graph.fetchByClientId(value);
      },
      set: function(value) {
        var oldValue = this[name];
        if(oldValue === value.clientId) return;
        
        this.belongsToWillChange(name);
        
        var session = this.session,
            graph = this.graph;
            
        if(value && embedded) {
          value._embeddedParent = this;
        }
        
        if(session) {
          session.modelWillBecomeDirty(this);
        }

        if(graph) {
          // internally, only the clientId is tracked
          this._relationships[name] = value.clientId;
        } else {
          this._relationships[name] = value;
        }
        
        this.belongsToDidChange(name);
        
        return value;
      }
    });
  }
  
}
