import {expect} from 'chai';

import Container, {Post} from '../support/simple-hierarchy';
import SessionCacheMiddleware from 'coalesce/middleware/session-cache';
import Session from 'coalesce/session';

describe('middleware/session-cache', function() {

  lazy('container', () => new Container())
  subject('middleware', function() {
    return this.container.get(SessionCacheMiddleware);
  });

  describe('.call()', function() {

    lazy('entity', function() {
      return this.session.build(Post, {rev: 1, id: 1, title: 'loaded'});
    });
    lazy('session', function() {
      return this.container.get(Session);
    });
    lazy('method', () => 'GET');
    lazy('refresh', () => false);

    lazy('ctx', function() {
      return {
        method: this.method,
        session: this.session,
        refresh: this.refresh,
        entity: this.entity
      };
    });

    beforeEach(function() {
      this.hit = false;
      this.next = () => {
        this.hit = true;
      }
    });

    subject(function() {
      return this.middleware.call(this.ctx, this.next);
    });

    context('when loaded in session', function() {

      it('hits', async function() {
        await this.subject;
        expect(this.hit).to.be.false
      });

    });

    context('when not loaded in session', function() {

      lazy('entity', function() {
        return this.session.build(Post, {id: 1});
      });

      it('misses', async function() {
        await this.subject;
        expect(this.hit).to.be.true
      });

    });

  });

});
