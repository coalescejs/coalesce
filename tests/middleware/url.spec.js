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
    lazy('query', () => undefined);

    subject(function() {
      return this.middleware.resolveUrl({entity: this.entity, action: this.action, query: this.query});
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
        lazy('query', function() {
          return {q: 'asd'};
        });

        it('adds params', function() {
          expect(this.subject).to.eq(`/posts?q=asd`);
        });

      });

    });

    context('with baseUrl', function() {

      lazy('baseUrl', () => 'https://cdn.com');

      lazy('middleware', function() {
        return this.container.get(UrlMiddleware, this.baseUrl);
      });

      it('prefixes baseUrl', function() {
        expect(this.subject).to.eq(`https://cdn.com/posts/1`);
      });

    });

  });

});
