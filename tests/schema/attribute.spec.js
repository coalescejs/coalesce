import {expect} from 'chai';

import Model from 'coalesce/model';

describe('schema/attribute', function() {

  lazy('name', () => 'title');
  lazy('opts', () => {
    return {};
  });

  lazy('Model', function() {
    let klass = class TestModel extends Model {

    }
    klass.defineSchema({
      typeKey: 'post',
      attributes: {
        [this.name]: this.opts
      }
    });
    return klass;
  });

  it('creates property', function() {
    expect(Object.getOwnPropertyDescriptor(this.Model.prototype, 'title')).to.not.be.undefined;
  });

});
