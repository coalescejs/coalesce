import {expect} from 'chai';

import Model from 'coalesce/model';
import DefaultContainer from 'coalesce/default-container';
import Graph from 'coalesce/graph';
import Session from 'coalesce/session';

describe('schema/belongs-to', function() {

  lazy('name', () => 'user');
  lazy('opts', () => {
    return {kind: 'belongsTo', type: 'user'};
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

  lazy('User', function() {
    class User extends Model {}
    User.defineSchema({
      typeKey: 'user'
    });
    return User;
  });

  lazy('container', function() {
    return new DefaultContainer();
  });

  lazy('session', function() {
    return new Session(this.container);
  });

  beforeEach(function() {
    this.container.registerType(this.Model);
    this.container.registerType(this.User);
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
      return this.graph.build(this.User, {id: 2});
    });

    subject(function() {
      return this.model[this.name];
    });

    it('returns value', function() {
      expect(this.subject).to.eq(this.value);
    });

    context('without a value set', function() {

      lazy('model', function() {
        return new this.Model(this.graph, {
          id: 1
        });
      });

      it('returns undefined', function() {
        expect(this.subject).to.be.undefined;
      });

    });

    context('with null value set', function() {

      lazy('model', function() {
        return new this.Model(this.graph, {
          id: 1,
          [this.name]: null
        });
      });

      it('returns null', function() {
        expect(this.subject).to.be.null;
      });

    });

  });

});
