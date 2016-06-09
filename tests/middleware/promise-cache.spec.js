import {expect} from 'chai';

import Container, {Post} from '../support/simple-hierarchy';
import PromiseCacheMiddleware from 'coalesce/middleware/promise-cache';
import Session from 'coalesce/session';

describe('middleware/promise-cache', function() {

  lazy('container', () => new Container())
  subject('middleware', function() {
    return this.container.get(PromiseCacheMiddleware);
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
      this.next = async () => {
        this.hit = true;
      }
    });

    subject(function() {
      return this.middleware.call(this.ctx, this.next);
    });

    context('previous load in progress', function() {

      it('hits', async function() {
        let doResolve;
        let pendingNext = () => {
          return new Promise((resolve, reject) => {
            doResolve = resolve;
          });
        }
        this.middleware.call(this.ctx, pendingNext);
        let promise = this.subject;
        doResolve.call(this, this.entity);
        await promise;
        expect(this.hit).to.be.false;
      });

    });

    context('never loaded', function() {

      it('misses', async function() {
        await this.subject;
        expect(this.hit).to.be.true
      });

    });

    context('previous load completed', function() {

      it('misses', async function() {
        let doResolve;
        let pendingNext = () => {
          return new Promise((resolve, reject) => {
            doResolve = resolve;
          });
        }
        let p = this.middleware.call(this.ctx, pendingNext);
        doResolve.call(this, this.entity);
        await p;
        await this.subject;
        expect(this.hit).to.be.true;
      });

    });

  });

});
