import {expect} from 'chai';

import DefaultContainer from 'coalesce/default-container';
import Graph from 'coalesce/graph';
import Model from 'coalesce/model';

describe('schema/attribute', function() {

  lazy('name', () => 'title');
  lazy('opts', () => {
    return {};
  });
  lazy('container', () => new DefaultContainer());
  lazy('graph', function() { return this.container.get(Graph); });

  lazy('Model', function() {
    class TestModel extends Model {}
    TestModel.defineSchema({
      typeKey: 'post',
      attributes: {
        [this.name]: this.opts
      }
    });
    return TestModel;
  });

  it('defines property', function() {
    expect(Object.getOwnPropertyDescriptor(this.Model.prototype, 'title')).to.not.be.undefined;
  });

  describe('.get()', function() {

    lazy('model', function() {
      return new this.Model(this.graph, {
        [this.name]: this.value
      });
    });

    lazy('value', () => { return {test: true}; });

    subject(function() {
      return this.model[this.name];
    });

    it('returns value', function() {
      expect(this.subject).to.eq(this.value);
    });

  });

});
