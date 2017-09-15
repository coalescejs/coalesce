import { expect } from 'chai';

import Container, { Post, Comment } from './support/simple-hierarchy';

import Graph from 'coalesce/graph';
import Query from 'coalesce/query';
import IdManager from 'coalesce/id-manager';

describe('query', function() {
  lazy('container', () => new Container());
  lazy('graph', function() {
    return this.container.get(Graph);
  });
  lazy('idManager', function() {
    return this.container.get(IdManager);
  });
  lazy('type', function() {
    return Post;
  });
  lazy('params', () => {
    return { q: 'asd' };
  });

  describe('constructor.clientId()', function() {
    subject(function() {
      return Query.clientId(this.idManager, this.type, this.params);
    });

    it('returns clientId', function() {
      expect(this.subject).to.eq('$post${"q":"asd"}');
    });
  });

  describe('.build', function() {
    lazy('query', function() {
      return this.graph.build(Query, this.type, {});
    });
    subject(function() {
      return this.query.build({ id: 1, title: 'a' });
    });
    it('uses query type', function() {
      expect(this.subject).to.be.an.instanceOf(Post);
    });
  });
});
