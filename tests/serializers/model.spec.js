import {expect} from 'chai';

import Model from 'coalesce/model';
import ModelSerializer from 'coalesce/serializers/model';
import DefaultContainer from 'coalesce/default-container';
import Graph from 'coalesce/graph';
import IdManager from 'coalesce/id-manager';

describe('serializers/model', function() {

  lazy('container', () => new DefaultContainer());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  subject('serializer', function() {
    return this.container.get(ModelSerializer);
  });

  lazy('Tag', function() {
    let klass = class Tag extends Model {}
    klass.defineSchema({
      typeKey: 'tag',
      attributes: {
        name: {
          type: 'string'
        }
      },
      relationships: {
        post: {
          kind: 'belongsTo',
          type: 'post'
        }
      }
    });
    return klass;
  });

  beforeEach(function() {
    this.container.registerType(this.Tag);
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
      return this.graph.build(this.Post, {
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

    context('with belongsTo', function() {

      lazy('Post', function() {
        let klass = class Post extends Model {}
        klass.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {
              type: 'string'
            }
          },
          relationships: {
            tag: {
              kind: 'belongsTo',
              type: 'tag'
            }
          }
        });
        return klass;
      });

      lazy('value', function() {
        let post = this.graph.build(this.Post, {
          id: "1",
          clientId: "$post1",
          rev: 1,
          clientRev: 2,
          title: 'Serializing',
        });
        post.tag = this.graph.build(this.Tag, {id: "2", post, name: 'asd'});
        return post;
      });

      it('serializes as id', function() {
        expect(this.subject.tag).to.eq(2);
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
      return this.serializer.deserialize(this.value, this.graph);
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
        raw: {test: true},
        isDeleted: false,
        isNew: false
      });
    });

    context('with default type', function() {

      lazy('value', () => {
        return {
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
        return this.serializer.deserialize(this.value, this.graph, {type: 'post'});
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
          raw: {test: true},
          isDeleted: false,
          isNew: false
        });
      });

    });

  });

});
