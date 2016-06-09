import {expect} from 'chai';

import Container, {Post} from '../support/simple-hierarchy';
import UrlMiddleware from 'coalesce/middleware/url';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('middleware/url', function() {

  lazy('container', () => new Container())
  subject('middleware', function() {
    return this.container.get(UrlMiddleware);
  });

  describe('.resolveUrl()', function() {

    lazy('graph', function() {
      return this.container.get(Graph);
    });
    lazy('entity', function() {
      return this.graph.build(Post, {id: 1});
    });
    lazy('action', () => undefined);

    subject(function() {
      return this.middleware.resolveUrl({entity: this.entity, action: this.action});
    });

    context('with model', function() {

      it('resolves to singular resource root', function() {
        expect(this.subject).to.eq(`/posts/1`);
      });

    });

    context('with query', function() {

      lazy('entity', function() {
        return this.graph.build(Query, Post, {});
      });

      it('resolves to collective resource root', function() {
        expect(this.subject).to.eq(`/posts`);
      });

      context('with params', function() {
        lazy('entity', function() {
          return this.graph.build(Query, Post, {q: 'asd'});
        });

        it('adds params', function() {
          expect(this.subject).to.eq(`/posts?q=asd`);
        });

      });

    });

  });

});
