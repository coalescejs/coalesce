import { expect } from 'chai';

import StringSerializer from 'coalesce/serializers/string';

describe('serializers/string', function() {
  subject('serializer', function() {
    return new StringSerializer();
  });

  describe('.serialize()', function() {
    lazy('value', () => 'test');

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    context('with string value', function() {
      it('returns string', function() {
        expect(this.subject).to.eq('test');
      });
    });
  });

  describe('.deserialize()', function() {
    lazy('value', () => 'test');

    subject(function() {
      return this.serializer.deserialize(this.value);
    });

    context('with string value', function() {
      it('returns string', function() {
        expect(this.subject).to.eq('test');
      });
    });
  });
});
