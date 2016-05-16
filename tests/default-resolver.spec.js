import {expect} from 'chai';

import Model from 'coalesce/model';

import DefaultResolver from 'coalesce/default-resolver';

describe('default-resolver', function() {

  subject('resolver', () => new DefaultResolver());

  describe('.resolveProvider()', function() {

    lazy('type', () => 'string');
    lazy('name', () => 'serializer');

    subject(function() {
      return this.resolver.resolveProvider(this.type, this.name);
    });

    context('for primitive serializer', function() {

      it('returns default provider', function() {
        expect(this.subject.name).to.eq('StringSerializer');
      });

    });

  });

});
