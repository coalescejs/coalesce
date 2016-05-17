import {expect} from 'chai';

import Model from 'coalesce/model';

describe('schema/attribute', function() {

  lazy('name', () => 'title');
  lazy('opts', () => {
    return {};
  });

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
      return new this.Model({
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
