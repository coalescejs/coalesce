import {expect} from 'chai';
import sinon from 'sinon';

import Model from 'coalesce/model';

import DefaultContainer from 'coalesce/default-container';
import Session from 'coalesce/session';
import IdManager from 'coalesce/id-manager';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

import {EntityNotFound} from 'coalesce/errors';

describe('session', function() {

  lazy('container', () => new DefaultContainer());
  subject('session', function() {
    return this.container.get(Session);
  });

  lazy('Post', () => {
    class Post extends Model {
    };
    Post.defineSchema({typeKey: 'post'});
    return Post;
  });

  lazy('graph', function() {
    return this.container.get(Graph);
  });

  describe('.child()', function() {

    subject(function() {
      return this.session.child();
    });

    it('returns a child session', function() {
      expect(this.subject).to.be.an.instanceOf(Session);
      expect(this.subject.parent).to.eq(this.session);
    });

  });

  describe('.build()', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.build(this.Post, this.hash);
    });

    it('instantiates', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
      expect(this.session.get(this.subject)).to.eq(this.subject);
    });

  });

  describe('.push()', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.create(this.Post, this.hash);
    });

    it('instantiates inside session', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
      expect(this.subject.session).to.eq(this.session);
      expect(this.session.get(this.subject)).to.eq(this.subject);
    });

  });

  describe('.create()', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.create(this.Post, this.hash);
    });

    it('instantiates inside session', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
      expect(this.subject.session).to.eq(this.session);
      expect(this.session.get(this.subject)).to.eq(this.subject);
    });

  });

  describe('.get()', function() {

    lazy('entity', function() {
      return new this.Post(this.graph, {id: "1"});
    });

    subject(function() {
      return this.session.get(this.entity);
    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.build(this.Post, {id: "1"});
      });

      beforeEach(function() {
        this.entity;
      });

      it('returns the same entity', function() {
        expect(this.subject).to.eq(this.entity);
      });

    });

    context('when entity is not part of the session', function() {

      it('returns an entity', function() {
        expect(this.subject).to.not.eq(this.entity);
        expect(this.subject).to.be.undefined
      });

      context('but is part of parent session', function() {

        lazy('parentSession', function() {
          return this.container.get(Session);
        });

        lazy('session', function() {
          return this.parentSession.child();
        });

        lazy('entity', function() {
          return this.parentSession.build(this.Post, {id: "1"});
        });

        beforeEach(function() {
          this.entity;
        });

        it('returns an entity', function() {
          expect(this.subject).to.not.eq(this.entity);
          expect(this.subject.clientId).to.eq(this.entity.clientId);
        });

      });

    });

  });

  describe('.getBy()', function() {

    lazy('entity', function() {
      return new this.Post(this.graph, {id: "1"});
    });

    lazy('params', () => {});

    subject(function() {
      return this.session.getBy(this.entity, this.params);
    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.build(this.Post, {id: "1"});
      });

      beforeEach(function() {
        this.entity;
      });

      context('by clientId', function() {

        lazy('params', function() { return {clientId: this.entity.clientId} });

        it('returns the same entity', function() {
          expect(this.subject).to.eq(this.entity);
        });

      });

      context('by id', function() {

        lazy('params', function() { return {id: this.entity.id} });

        it('returns the same entity', function() {
          expect(this.subject).to.eq(this.entity);
        });

      });

    });

  });

  describe('.getQuery()', function() {

    lazy('entity', function() {
      return this.session.build(Query, this.Post, this.params);
    });

    beforeEach(function() {
      this.entity
    });

    lazy('params', () => { return {}; });

    subject(function() {
      return this.session.getQuery(this.Post, this.params);
    });

    it('returns query', function() {
      expect(this.subject).to.eq(this.entity);
    });

  });

  describe('.fetch()', function() {

    lazy('entity', function() {
      return new this.Post(this.graph, {id: "1"});
    });

    subject(function() {
      return this.session.fetch(this.entity);
    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.build(this.Post, {id: "1"});
      });

      beforeEach(function() {
        this.entity;
      });

      it('returns the same entity', function() {
        expect(this.subject).to.eq(this.entity);
      });

    });

    context('when entity is not part of the session', function() {

      it('returns an entity', function() {
        expect(this.subject).to.not.eq(this.entity);
        expect(this.subject.id).to.eq(this.entity.id);
        expect(this.subject.session).to.eq(this.session);
      });

    });

  });

  describe('.fetchBy()', function() {

    lazy('entity', function() {
      return new this.Post(this.graph, {id: "1"});
    });

    subject(function() {
      return this.session.fetchBy(this.Post, {id: this.entity.id});
    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.build(this.Post, {id: "1"});
      });

      beforeEach(function() {
        this.entity;
      });

      it('returns the same entity', function() {
        expect(this.subject).to.eq(this.entity);
      });

    });

    context('when entity is not part of the session', function() {

      it('returns an entity', function() {
        expect(this.subject).to.not.eq(this.entity);
        expect(this.subject.id).to.eq(this.entity.id);
      });

    });

  });

  describe('.fetchQuery()', function() {

    lazy('entity', function() {
      return this.graph.build(Query, this.Post, this.params);
    });

    lazy('type', function() {
      return this.Post;
    });

    subject(function() {
      return this.session.fetchQuery(this.type, this.params);
    });

    context('when entity type is a typeKey', function() {

      lazy('type', function() {
        this.container.registerType(this.Post);
        return 'post';
      });

      it('returns an entity', function() {
        expect(this.subject.type).to.eq(this.Post);
      });

    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.build(Query, this.Post, this.params);
      });

      beforeEach(function() {
        this.entity
      });

      beforeEach(function() {
        this.entity;
      });

      it('returns the same entity', function() {
        expect(this.subject).to.eq(this.entity);
      });

    });

    context('when entity is not part of the session', function() {

      it('returns an entity', function() {
        expect(this.subject).to.not.eq(this.entity);
        expect(this.subject.id).to.eq(this.entity.id);
        expect(this.subject.session).to.eq(this.session);
      });

    });

  });

  describe('.load()', function() {

    lazy('Post', function() {
      let klass = class Post extends Model {}
      klass.adapter = this.Adapter;
      klass.defineSchema({
        typeKey: 'post',
        attributes: {
          title: {
            type: 'string'
          }
        }
      });
      return klass;
    });

    lazy('Adapter', function() {
      let container = this.container;
      let self = this;
      this.adapterHit = false;
      return class TestAdapter {
        async load(entity) {
          let res = entity.fork(container.get(Graph));
          res.title = 'loaded title';
          res.rev = 1;
          self.adapterHit = true;
          return res;
        }
      };
    });

    lazy('entity', function() {
      return this.session.fetchBy(this.Post, {id: 1});
    });

    subject(function() {
      return this.session.load(this.entity);
    });

    it('loads data', async function() {
      let res = await this.subject;
      expect(res.title).to.eq('loaded title');
      expect(res.session).to.eq(this.session);
      expect(this.adapterHit).to.be.true;
    });

    context('when model already loaded', function() {

      beforeEach(function() {
        this.session.merge(new this.Post(this.container.get(Graph), {id: 1, title: "a title"}));
      });

      lazy('cachingStrategy', function() {
        return this.container.cachingStrategyFor(this.Post, this.session);
      });

      context('when cachingStrategy indicates to not use cache', function() {

        beforeEach(function() {
          this.cachingStrategy.useCache = () => false;
        });

        it('uses adapter', async function() {
          let res = await this.subject;
          expect(res.title).to.eq('loaded title');
          expect(res.session).to.eq(this.session);
          expect(this.adapterHit).to.be.true;
        });

      });

      context('when cachingStrategy indicates to use cache', function() {

        beforeEach(function() {
          this.cachingStrategy.useCache = () => true;
        });

        it('hits cached data', async function() {
          let res = await this.subject;
          expect(res.title).to.eq('a title');
          expect(res).to.eq(this.entity);
          expect(this.adapterHit).to.not.be.true;
        });

        context('when .invalidate() called', function() {

          beforeEach(function() {
            this.session.invalidate(this.entity);
          });

          it('uses adapter', async function() {
            let res = await this.subject;
            expect(res.title).to.eq('loaded title');
            expect(res.session).to.eq(this.session);
            expect(this.adapterHit).to.be.true;
          });

        });

      });

    });

    context('with type and id as arguments', function() {

      subject(function() {
        return this.session.load(this.Post, this.entity.id);
      });

      it('loads data', async function() {
        let res = await this.subject;
        expect(res.title).to.eq('loaded title');
        expect(res.session).to.eq(this.session);
      });

    });

    context('when adapter throws EntityNotFound', function() {

      lazy('Adapter', function() {
        let container = this.container;
        return class TestAdapter {
          async load(entity) {
            throw new EntityNotFound(entity, {});
          }
        };
      });

      it('marks the entity as deleted', async function() {
        try {
          await this.subject;
          expect(false).to.be.true;
        } catch(err) {
          expect(err.entity.isDeleted).to.be.true;
        }
      });

    });

  });

  describe('.refresh()', function() {

    lazy('Post', function() {
      let klass = class Post extends Model {}
      klass.adapter = this.Adapter;
      klass.defineSchema({
        typeKey: 'post',
        attributes: {
          title: {
            type: 'string'
          }
        }
      });
      return klass;
    });

    lazy('Adapter', function() {
      let container = this.container;
      return class TestAdapter {
        async load(entity) {
          let res = entity.fork(container.get(Graph));
          res.title = 'loaded title';
          res.rev = 1;
          return res;
        }
      };
    });

    lazy('entity', function() {
      return this.session.fetchBy(this.Post, {id: 1});
    });

    subject(function() {
      return this.session.refresh(this.entity);
    });

    it('loads with refresh=true', async function() {
      let args;
      this.session.load = (..._args) => {
        args = _args;
      }
      this.subject
      expect(args).to.eql([this.entity, {refresh: true}]);
    });

  });

  describe('.merge()', function() {

    lazy('Post', function() {
      let klass = class Post extends Model {}
      klass.defineSchema({
        typeKey: 'post',
        attributes: {
          title: {
            type: 'string'
          }
        }
      });
      return klass;
    });

    subject(function() {
      return this.session.merge(this.entity);
    });

    context('with a model', function() {
      lazy('entity', function() {
        return new this.Post(this.graph, {id: 1, rev: 2, title: 'merging 101'});
      });

      context('when not in session', function() {
        it('copies to session', function() {
          expect(this.subject).to.not.eq(this.entity);
          expect(this.subject.id).to.eq(this.entity.id);
          expect(this.subject.rev).to.eq(this.entity.rev);
          expect(this.subject.title).to.eq(this.entity.title);
          expect(this.subject.session).to.eq(this.session);
        });

        context('with embedded relationships', function() {

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

          lazy('Tag', function() {
            let klass = class Tag extends Model {}
            klass.defineSchema({
              typeKey: 'tag',
              attributes: {
                name: {
                  type: 'string'
                }
              }
            });
            return klass;
          });

          beforeEach(function() {
            this.container.registerType(this.Tag);
          });

          lazy('entity', function() {
            let post = this.graph.build(this.Post, {id: 1});
            post.tags = [this.graph.build(this.Tag, {id: 2, name: 'asd'})];
            return post;
          });

          it('traverses embedded relationships', function() {
            expect(this.subject.tags.get(0).name).to.eq('asd');
          });

        });
      });

      context('when already in session', function() {

        lazy('rev', () => 3);
        lazy('existing', function() { return new this.Post(this.graph, {id: 1, rev: this.rev, title: 'merging 102'}); });

        beforeEach(function() {
          this.session.merge(this.existing);
        });

        context('with a higher rev', function() {

          it('ignores and keeps existing model', function() {
            expect(this.subject.title).to.eq('merging 102');
            expect(this.subject.rev).to.eq(3);
          });

        });

        context('with a lower rev', function() {

          lazy('rev', () => 1);

          it('overwrites existing model', function() {
            expect(this.subject.title).to.eq('merging 101');
            expect(this.subject.rev).to.eq(2);
          });

          context('when modified within session', function() {

            beforeEach(function() {
              this.session.get(this.existing).title = 'merging 103';
            });

            it('merges', function() {
              expect(this.subject.title).to.eq('merging 103');
              expect(this.subject.rev).to.eq(2);
            });

          });

        });

      });

    });
  });

  describe('.rollback()', function() {

    lazy('Post', function() {
      let klass = class Post extends Model {}
      klass.defineSchema({
        typeKey: 'post',
        attributes: {
          title: {
            type: 'string'
          }
        }
      });
      return klass;
    });

    subject(function() {
      return this.session.rollback(this.original);
    });

    context('with a model', function() {
      lazy('original', function() {
        return new this.Post(this.graph, {id: 1, rev: 2, title: 'reverting 101'});
      });
      lazy('shadow', function() {
        return new this.Post(this.graph, {id: 1, rev: 2, title: 'reverting 102'});
      });

      beforeEach(function() {
        this.session.merge(this.shadow);
        this.session.touch(this.shadow);
      });

      context('when shadow is the same version', function() {

        it('updates shadow based on original', function() {
          expect(this.subject.title).to.eq('reverting 101');
        });

      });

    });

  });

  describe('.touch()', function() {

    lazy('entity', function() {
      return this.session.merge(new this.Post(this.graph, {id: 1}));
    });

    subject(function() { return this.session.touch(this.entity); });

    it('marks the model dirty', function() {
      expect(this.session.isEntityDirty(this.entity)).to.be.false;
      this.subject;
      expect(this.session.isEntityDirty(this.entity)).to.be.true;
    });

  });

  describe('.remoteCall()', function() {

    lazy('context', function() {
      return this.session.build(this.Post, {id: 1});
    });
    lazy('name', () => 'approve');
    lazy('params', () => { return {}; });
    lazy('opts', () => null);
    lazy('adapter', function() {
      return this.container.adapterFor(this.Post);
    });

    subject(function() {
      return this.session.remoteCall(this.context, this.name, this.params, this.opts);
    });

    it(`invokes the adapter .remoteCall`, async function() {
      sinon.stub(this.adapter, 'remoteCall');
      await this.subject;
      expect(this.adapter.remoteCall.calledOnce).to.be.true;
    });

    context('with string context', function() {

      lazy('context', () => 'post');

      it(`invokes the adapter .remoteCall with an entity`, async function() {
        sinon.stub(this.adapter, 'remoteCall');
        await this.subject;
        expect(this.adapter.remoteCall.getCall(0).args[0].isModel).to.be.true;
      });

      context('and singular: false', function() {

        lazy('opts', function() {
          return {singular: false};
        });

        it(`invokes the adapter .remoteCall with collection`, async function() {
          sinon.stub(this.adapter, 'remoteCall');
          await this.subject;
          expect(this.adapter.remoteCall.getCall(0).args[0].isQuery).to.be.true;
        });

      });

    });

  });

  describe('.invalidate()', function() {

    lazy('entity', function() {
      return this.session.fetch(this.Post, {id: 1});
    });

    subject(function() {
      return this.session.invalidate(this.entity);
    });

    it('invalidates entity', function() {
      expect(this.subject._invalid).to.be.true;
    });

  });

});
