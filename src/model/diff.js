import Model from './model';
import ModelSet from '../collections/model_set';

Model.reopen({

  diff: function(model) {
    var diffs = [];

    this.eachLoadedAttribute(function(name, meta) {
      var left = this[name];
      var right = model[name];

      if(left && typeof left.diff === 'function' && right && typeof right.diff === 'function') {
        if(left.diff(right).length > 0) {
          diffs.push({type: 'attr', name: name});
        }
        return;
      }

      if(left && right
        && typeof left === 'object'
        && typeof right === 'object') {
        if(JSON.stringify(left) !== JSON.stringify(right)) {
          diffs.push({type: 'attr', name: name});
        }
        return;
      }

      if(left instanceof Date && right instanceof Date) {
        left = left.getTime();
        right = right.getTime();
      }
      if(left !== right) {
        diffs.push({type: 'attr', name: name});
      }
    }, this);

    this.eachLoadedRelationship(function(name, relationship) {
      var left = this[name];
      var right = model[name];
      if(relationship.kind === 'belongsTo') {
        if(left && right) {
          if(!left.isEqual(right)) {
            diffs.push({type: 'belongsTo', name: name, relationship: relationship, oldValue: right});
          }
        } else if(left || right) {
          diffs.push({type: 'belongsTo', name: name, relationship: relationship, oldValue: right});
        }
      } else if(relationship.kind === 'hasMany') {
        var dirty = false;
        var cache = new ModelSet();
        left.forEach(function(model) {
          cache.add(model);
        });
        right.forEach(function(model) {
          if(dirty) return;
          if(!cache.contains(model)) {
            dirty = true;
          } else {
            cache.remove(model);
          }
        });
        if(dirty || cache.length > 0) {
          diffs.push({type: 'hasMany', name: name, relationship: relationship});
        }
      }
    }, this);

    return diffs;
  }

});
