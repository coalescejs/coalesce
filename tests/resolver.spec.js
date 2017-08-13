import { expect } from 'chai';

import Model from 'coalesce/model';

import Resolver from 'coalesce/resolver';

describe('resolver', function() {
  lazy('Model', () => {
    return class TestModel extends Model {};
  });

  subject('resolver', () => new Resolver());

  describe('.resolveType()', function() {
    subject(function() {
      return this.resolver.resolveType('model');
    });

    it('errors', function() {
      expect(() => this.subject).to.throw;
    });
  });
});
