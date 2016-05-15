import {expect} from 'chai';

import BooleanSerializer from 'coalesce/serializers/boolean';

describe('serializers/boolean', function() {

  subject('serializer', function() {
    return new BooleanSerializer();
  });

  describe('.serialize()', function() {

    lazy('value', () => true);

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    context('with value of true', function() {

      it('returns true', function() {
        expect(this.subject).to.eq(true);
      });

    });

    context('with value of false', function() {

      lazy('value', () => false);

      it('returns true', function() {
        expect(this.subject).to.eq(false);
      });

    });

  });

  describe('.deserialize()', function() {

    lazy('value', () => true);

    subject(function() {
      return this.serializer.deserialize(this.value);
    });

    context('with value of true', function() {

      it('returns true', function() {
        expect(this.subject).to.eq(true);
      });

    });

    context('with value of false', function() {

      lazy('value', () => false);

      it('returns true', function() {
        expect(this.subject).to.eq(false);
      });

    });

  });

});
