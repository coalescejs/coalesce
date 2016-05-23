import {expect} from 'chai';

import Container, {Post, Comment} from './support/simple-hierarchy';

import Graph from 'coalesce/graph';
import HasMany from 'coalesce/has-many';

describe('has-many', function() {

  lazy('container', () => new Container());
  lazy('graph', function() {
    return this.container.get(Graph);
  });
  lazy('owner', function() {
    return this.graph.create(Post, {id: '1'});
  });
  lazy('name', () => 'comments');

  describe('constructor.clientId()', function() {

    subject(function() {
      return HasMany.clientId(this.owner, this.name);
    });

    it('returns clientId', function() {
      expect(this.subject).to.eq('$post1$comments');
    });

  });

});
