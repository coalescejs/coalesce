import {expect} from 'chai';

import Container, {Post, Comment} from './support/simple-hierarchy';

import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('query', function() {

  lazy('container', () => new Container());
  lazy('graph', function() {
    return this.container.get(Graph);
  });
  lazy('type', function() {
    return Post;
  });
  lazy('params', () => { return {q: 'asd'};});

  describe('constructor.clientId()', function() {

    subject(function() {
      return Query.clientId(this.type, this.params);
    });

    it('returns clientId', function() {
      expect(this.subject).to.eq('$post${"q":"asd"}');
    });

  });

});
