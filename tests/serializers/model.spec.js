import {expect} from 'chai';

import Model from 'coalesce/model';
import ModelSerializer from 'coalesce/serializers/model';
import DefaultContainer from 'coalesce/default-container';
import Graph from 'coalesce/graph';
import IdManager from 'coalesce/id-manager';

describe('serializers/model', function() {

  lazy('container', () => new DefaultContainer());
  lazy('graph', function() {
    return new Graph(this.container.get(IdManager));
  });

  subject('serializer', function() {
    return this.container.get(ModelSerializer);
  });

  lazy('Post', function() {
    let klass = class Post extends Model {}
    klass.defineSchema({
      typeKey: 'post',
      attributes: {
        title: {
          type: 'string'
        },
        longTitle: {
          type: 'string'
        },
        custom: {
          type: 'number',
          key: 'CUSTOM'
        },
        raw: {}
      }
    });
    return klass;
  });

  beforeEach(function() {
    this.container.registerType(this.Post);
  });

  describe('.serialize()', function() {

    lazy('value', function() {
      return new this.Post(this.graph, {
        id: "1",
        clientId: "$post1",
        rev: 1,
        clientRev: 2,
        title: 'Serializing',
        longTitle: 'Serializing in Seattle',
        custom: 3,
        raw: {test: true}
      });
    });;

    subject(function() {
      return this.serializer.serialize(this.value);
    });

    it('serializes all fields', function() {
      expect(this.subject).to.eql({
        id: 1,
        client_id: "$post1",
        rev: 1,
        client_rev: 2,
        title: 'Serializing',
        long_title: 'Serializing in Seattle',
        CUSTOM: 3,
        raw: {test: true}
      });
    });

  });

  describe('.deserialize()', function() {

    lazy('value', () => {
      return {
        type: 'post',
        id: 1,
        client_id: "$post1",
        rev: 1,
        client_rev: 2,
        title: 'Serializing',
        long_title: 'Serializing in Seattle',
        CUSTOM: 3,
        raw: {test: true}
      };
    });

    subject(function() {
      return this.serializer.deserialize(this.graph, this.value);
    });

    it('deserializes all fields', function() {
      expect(this.subject._data.toJS()).to.eql({
        id: "1",
        clientId: "$post1",
        rev: 1,
        clientRev: 2,
        title: 'Serializing',
        longTitle: 'Serializing in Seattle',
        custom: 3,
        raw: {test: true}
      });
    });

  });

});
