import { expect } from 'chai';

import Container, { Post } from '../support/simple-hierarchy';
import Model from 'coalesce/model';
import UrlMiddleware from 'coalesce/middleware/url';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('middleware/url', function() {
  lazy('container', () => new Container());
  subject('middleware', function() {
    return this.container.get(UrlMiddleware);
  });

  describe('.call()', function() {
    lazy('ctx', function() {
      let { graph, entity, action, query, url } = this;
      return { graph, entity, action, query, url };
    });

    lazy('graph', function() {
      return this.container.get(Graph);
    });
    lazy('entity', function() {
      return this.graph.build(Post, { id: 1 });
    });
    lazy('action', () => undefined);
    lazy('query', () => undefined);

    lazy('next', function() {
      return () => {};
    });

    subject(function() {
      return this.middleware.call(this.ctx, this.next);
    });

    context('with model', function() {
      it('resolves to singular resource root', async function() {
        await this.subject;
        expect(this.ctx.url).to.eq('/posts/1');
      });

      context('with compound typeKey', function() {
        class CompoundPost extends Model {}
        CompoundPost.defineSchema({
          typeKey: 'compound_post'
        });

        lazy('entity', function() {
          return this.graph.build(CompoundPost, { id: 1 });
        });

        it('resolves to singular resource root', async function() {
          await this.subject;
          expect(this.ctx.url).to.eq('/compound_posts/1');
        });
      });
    });

    context('with query', function() {
      lazy('entity', function() {
        return this.graph.build(Query, Post, {});
      });

      it('resolves to collective resource root', async function() {
        await this.subject;
        expect(this.ctx.url).to.eq('/posts');
      });

      context('with params', function() {
        lazy('entity', function() {
          return this.graph.build(Query, Post, { q: 'asd' });
        });
        lazy('query', function() {
          return { q: 'asd' };
        });

        it('adds params', async function() {
          await this.subject;
          expect(this.ctx.url).to.eq('/posts?q=asd');
        });
      });
    });

    context('with baseUrl', function() {
      lazy('baseUrl', () => 'https://cdn.com');

      lazy('middleware', function() {
        return this.container.get(UrlMiddleware, this.baseUrl);
      });

      it('prefixes baseUrl', async function() {
        await this.subject;
        expect(this.ctx.url).to.eq('https://cdn.com/posts/1');
      });
    });
  });
});
