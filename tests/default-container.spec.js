import { expect } from 'chai';

import Model from 'coalesce/model';

import DefaultContainer from 'coalesce/default-container';

describe('default-container', function() {
  subject('container', () => new DefaultContainer());

  describe('.providerFor()', function() {
    lazy('type', () => 'string');
    lazy('name', () => 'serializer');

    subject(function() {
      return this.container.providerFor(this.type, this.name);
    });

    context('for primitive serializer', function() {
      it('returns default provider', function() {
        expect(this.subject.constructor.name).to.eq('StringSerializer');
      });
    });
  });
});
