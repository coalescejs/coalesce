import {expect} from 'chai';

import Model from 'coalesce/model';
import DefaultContainer from 'coalesce/default-container';
import Graph from 'coalesce/graph';
import Session from 'coalesce/session';

describe('schema/has-many', function() {

  lazy('name', () => 'comments');
  lazy('opts', () => {
    return {kind: 'hasMany', type: 'comment'};
  });
  lazy('container', () => new DefautContainer());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  lazy('Model', function() {
    class TestModel extends Model {}
    TestModel.defineSchema({
      typeKey: 'post',
      relationships: {
        [this.name]: this.opts
      }
    });
    return TestModel;
  });

  lazy('Comment', function() {
    class Comment extends Model {}
    Comment.defineSchema({
      typeKey: 'comment'
    });
    return Comment;
  });

  lazy('container', function() {
    return new DefaultContainer();
  });

  lazy('session', function() {
    return new Session(this.container);
  });

  beforeEach(function() {
    this.container.registerType(this.Model);
    this.container.registerType(this.Comment);
  });

  it('defines property', function() {
    expect(Object.getOwnPropertyDescriptor(this.Model.prototype, this.name)).to.not.be.undefined;
  });

  describe('.get()', function() {

    lazy('model', function() {
      return this.graph.build(this.Model, {
        id: 1,
        [this.name]: this.value
      });
    });

    lazy('value', function() {
      return [this.graph.build(this.Comment, {id: 2})];
    });

    subject(function() {
      return this.model[this.name];
    });

    it('returns value', function() {
      expect(Array.from(this.subject)).to.eql(this.value);
    });

    context('without a value set', function() {

      lazy('model', function() {
        return this.graph.build(this.Model, {
          id: 1
        });
      });

      it('returns unloaded has-many collection', function() {
        expect(this.subject).to.not.be.undefined;
      });

    });

  });

});
