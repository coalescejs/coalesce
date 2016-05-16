import {expect} from 'chai';

import Model from 'coalesce/model';

import Container from 'coalesce/container';

describe('container', function() {

  subject('container', () => new Container());

  describe('.typeFor', function() {

    lazy('Model', () => {
      return class TestModel extends Model {}
    });

    subject(function() {
      return this.container.typeFor(this.Model);
    });

    it('returns class', function() {
      expect(this.subject).to.eq(this.Model)
    });

  });

});
