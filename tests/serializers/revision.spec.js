import {expect} from 'chai';

import RevisionSerializer from 'coalesce/serializers/revision';

describe('serializers/revision', function() {

  subject('serializer', function() {
    return new RevisionSerializer();
  });

  describe('.serialize()', function() {

    lazy('value', () => 1);

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    context('with numeric value', function() {

      it('returns number', function() {
        expect(this.subject).to.eq(1);
      });

    });

  });

  describe('.deserialize()', function() {

    lazy('value', () => 1);

    subject(function() {
      return this.serializer.deserialize(this.value);
    });

    context('with numeric value', function() {

      it('returns number', function() {
        expect(this.subject).to.eq(1);
      });

    });

  });

});
