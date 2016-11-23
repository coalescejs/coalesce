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

      context('when not embedded', function() {
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

      context('when embedded', function() {
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
                embedded: 'always',
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

        it('serializes nested model', function() {
          expect(this.subject.tag).to.eql({
            client_id: "$tag1",
            client_rev: 1,
            id: 2,
            name: 'asd',
            post: 1
          });
        });
      });


    });

    context('with hasMany', function() {

      context('when not embedded', function() {

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
              tags: {
                kind: 'hasMany',
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
          post.tags = [this.graph.build(this.Tag, {id: "2", post, name: 'asd'})];
          return post;
        });

        it('does not include field', function() {
          expect(this.subject.tags).to.be.undefined;
        });

      });

      context('when embedded', function() {

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
              tags: {
                embedded: 'always',
                kind: 'hasMany',
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
          post.tags = [this.graph.build(this.Tag, {id: "2", post, name: 'asd'})];
          return post;
        });

        it('includes nested models', function() {
          expect(this.subject.tags).to.eql([{
            client_id: "$tag1",
            client_rev: 1,
            id: 2,
            name: 'asd',
            post: 1
          }]);
        });

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
      expect(this.subject._data).to.eql({
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
        expect(this.subject._data).to.eql({
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

    context('with belongsTo', function() {

      context('when not embedded', function() {
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

        lazy('value', () => {
          return {
            type: 'post',
            id: 1,
            client_id: "$post1",
            rev: 1,
            client_rev: 2,
            tag: 2
          };
        });

        it('deserializes a reference', function() {
          expect(this.subject.tag.id).to.eq('2');
        });
      });

      context('when embedded', function() {
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
                embedded: 'always',
                kind: 'belongsTo',
                type: 'tag'
              }
            }
          });
          return klass;
        });

        lazy('value', () => {
          return {
            type: 'post',
            id: 1,
            client_id: "$post1",
            rev: 1,
            client_rev: 2,
            tag: {
              id: 2,
              name: "asd"
            }
          };
        });

        it('deserializes nested model', function() {
          expect(this.subject.tag.id).to.eq('2')
          expect(this.subject.tag.name).to.eq('asd')
        });
      });


    });

    context('with hasMany', function() {

      context('when not embedded', function() {

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
              tags: {
                kind: 'hasMany',
                type: 'tag'
              }
            }
          });
          return klass;
        });

        lazy('value', () => {
          return {
            type: 'post',
            id: 1,
            client_id: "$post1",
            rev: 1,
            client_rev: 2,
            tags: [2, 3]
          };
        });

        it('deserializes collection', function() {
          expect(Array.from(this.subject.tags).map((t) => t.id)).to.eql(['2', '3']);
        });

      });

      context('when embedded', function() {

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
              tags: {
                embedded: 'always',
                kind: 'hasMany',
                type: 'tag'
              }
            }
          });
          return klass;
        });

        lazy('value', () => {
          return {
            type: 'post',
            id: 1,
            client_id: "$post1",
            rev: 1,
            client_rev: 2,
            tags: [
              {id: 2, name: 'asd'},
              {id: 3, name: 'xyz'}
            ]
          };
        });

        it('deserializes collection', function() {
          expect(Array.from(this.subject.tags).map((t) => t.id)).to.eql(['2', '3']);
          expect(Array.from(this.subject.tags).map((t) => t.name)).to.eql(['asd', 'xyz']);
        });

      });

    });

  });

});
