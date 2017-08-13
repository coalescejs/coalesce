import { expect } from 'chai';

import DateSerializer from 'coalesce/serializers/date';

describe('serializers/date', function() {
  subject('serializer', function() {
    return new DateSerializer();
  });

  describe('.serialize()', function() {
    lazy('value', () => new Date('05 October 2011 14:48 UTC'));

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    context('with date value', function() {
      it('returns string', function() {
        expect(this.subject).to.eq('Wed, 05 Oct 2011 14:48:00 GMT');
      });
    });
  });

  describe('.deserialize()', function() {
    lazy('value', () => 'Wed, 05 Oct 2011 14:48:00 GMT');

    subject(function() {
      return this.serializer.deserialize(this.value);
    });

    context('with string value', function() {
      it('returns date', function() {
        expect(this.subject.getTime()).to.eq(new Date('05 October 2011 14:48 UTC').getTime());
      });
    });
  });
});
