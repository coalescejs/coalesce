import {expect} from 'chai';

import Container, {Post, Comment} from './support/simple-hierarchy';

import CachingStrategy from 'coalesce/caching-strategy';
import Session from 'coalesce/session';

describe('caching-strategy', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return new Session(this.container);
  });

  subject('strategy', function() {
    return this.container.cachingStrategyFor(Post, this.session);
  });

  lazy('entity', function() {
    return this.session.fetch(Post, {id: 1});
  })

  describe('.useCache()', function() {

    subject(function() {
      return this.strategy.useCache(this.entity);
    });

    context('when entity not loaded', function() {

      it('returns false', function() {
        expect(this.subject).to.be.false;
      });

    });

    context('when entity loaded', function() {

      beforeEach(function() {
        this.entity._loaded = true;
      });

      it('returns true', function() {
        expect(this.subject).to.be.true;
      });

    });

  });

});
