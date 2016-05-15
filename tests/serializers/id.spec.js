import {expect} from 'chai';

import IdSerializer from 'coalesce/serializers/id';

describe('serializers/id', function() {

  subject('serializer', function() {
    return new IdSerializer();
  });

  describe('.serialize()', function() {

    lazy('value', () => '1');

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    context('with string value', function() {

      it('returns integer', function() {
        expect(this.subject).to.eq(1);
      });

    });

  });

  describe('.deserialize()', function() {

    lazy('value', () => 1);

    subject(function() {
      return this.serializer.deserialize(this.value);
    });

    context('with integer value', function() {

      it('returns string', function() {
        expect(this.subject).to.eq('1');
      });

    });

  });

});
