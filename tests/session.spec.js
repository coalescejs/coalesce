import {expect} from 'chai';

import Model from 'coalesce/model';

import Session from 'coalesce/session';

describe('session', function() {

  subject('session', () => new Session());

  lazy('Post', () => {
    return class Post extends Model {
    };
  });

  describe('.build', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.build(this.Post, this.hash);
    });

    it('instantiates', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
    });

  });

  describe('.create', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.create(this.Post, this.hash);
    });

    it('instantiates and adds to session', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
      expect(this.subject.session).to.eq(this.session);
    });

  });

  describe('.get', function() {

    lazy('entity', function() {
      return new this.Post({id: "1"});
    });

    subject(function() {
      return this.session.get(this.entity);
    });

    context('when entity is part of the session', function() {

      beforeEach(function() {
        this.session._adopt(this.entity);
      });

      it('returns the same entity', function() {
        expect(this.subject).to.eq(this.entity);
      });

    });

    context('when entity is not part of the session', function() {

      it('returns an entity', function() {
        expect(this.subject).to.not.eq(this.entity);
        expect(this.subject).to.not.eq(null);
      });

    });

  });

  describe('.getBy', function() {

    lazy('entity', function() {
      return new this.Post({id: "1"});
    });

    lazy('params', () => {});

    subject(function() {
      return this.session.getBy(this.entity, this.params);
    });

    context('when entity is part of the session', function() {

      beforeEach(function() {
        this.session._adopt(this.entity);
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

  describe('.fetch', function() {

    lazy('entity', function() {
      return new this.Post({id: "1"});
    });

    subject(function() {
      return this.session.fetch(this.entity);
    });

    context('when entity is part of the session', function() {

      beforeEach(function() {
        this.session._adopt(this.entity);
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

  describe('.fetchBy', function() {

    lazy('entity', function() {
      return new this.Post({id: "1"});
    });

    subject(function() {
      return this.session.fetchBy(this.Post, {id: this.entity.id});
    });

    context('when entity is part of the session', function() {

      beforeEach(function() {
        this.session._adopt(this.entity);
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

  describe('.merge', function() {

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
        return new this.Post({id: 1, rev: 2, title: 'merging 101'});
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
        lazy('existing', function() { return new this.Post({id: 1, rev: this.rev, title: 'merging 102'}); });

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

  describe('.touch', function() {

    lazy('entity', function() {
      return this.session.merge(new this.Post({id: 1}));
    });

    subject(function() { return this.session.touch(this.entity); });

    it('marks the model dirty', function() {
      expect(this.session.isEntityDirty(this.entity)).to.be.false;
      this.subject;
      expect(this.session.isEntityDirty(this.entity)).to.be.true;
    });

  });

});
