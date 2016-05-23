import {expect} from 'chai';

import HasManySerializer from 'coalesce/serializers/revision';
import Container from '../support/simple-hierarchy';

describe('serializers/has-many', function() {

  lazy('container', () => new Container());
  subject('serializer', function() {
    return this.container.get(HasManySerializer);
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
