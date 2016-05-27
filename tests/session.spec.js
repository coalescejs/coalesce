import {expect} from 'chai';

import Model from 'coalesce/model';

import DefaultContainer from 'coalesce/default-container';
import Session from 'coalesce/session';
import IdManager from 'coalesce/id-manager';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

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
      expect(this.session.get(this.subject)).to.not.eq(this.subject);
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
        return this.session.push(this.Post, {id: "1"});
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
          return this.parentSession.push(this.Post, {id: "1"});
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
        return this.session.push(this.Post, {id: "1"});
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
      return this.session.push(Query, this.Post, this.params);
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
        return this.session.push(this.Post, {id: "1"});
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
        return this.session.push(this.Post, {id: "1"});
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
      return this.graph.create(Query, this.Post, this.params);
    });

    subject(function() {
      return this.session.fetchQuery(this.Post, this.params);
    });

    context('when entity is part of the session', function() {

      lazy('entity', function() {
        return this.session.push(Query, this.Post, this.params);
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
      return class TestAdapter {
        async load(entity) {
          let res = entity.clone(container.get(Graph));
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
      return this.session.load(this.entity);
    });

    it('loads data', async function() {
      let res = await this.subject;
      expect(res.title).to.eq('loaded title');
      expect(res.session).to.eq(this.session);
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

  describe('.revert()', function() {

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
      return this.session.revert(this.original);
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

});
