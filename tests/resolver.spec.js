import {expect} from 'chai';

import Model from 'coalesce/model';

import Resolver from 'coalesce/resolver';

describe('resolver', function() {

  lazy('Model', () => {
    return class TestModel extends Model {}
  });

  subject('resolver', () => new Resolver());

  describe('.resolveType()', function() {

    subject(function() {
      return this.resolver.resolveType(this.Model);
    });

    context('with actual class', function() {

      it('returns class', function() {
        expect(this.subject).to.eq(this.Model);
      });

    });

  });

});
