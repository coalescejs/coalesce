import { expect } from 'chai';

import Graph from 'coalesce/graph';

import Container, { Post } from './support/simple-hierarchy';

describe('graph', function() {
  lazy('container', () => new Container());

  subject('graph', function() {
    return this.container.get(Graph);
  });

  subject('graph2', function() {
    return this.container.get(Graph);
  });

  describe('.fetch', function() {
    lazy('entity', function() {
      return this.graph2.build(Post, { id: 1 });
    });

    subject(function() {
      return this.graph.fetch(this.entity);
    });

    context('when no corresponding entity exists', function() {
      it('builds entity', function() {
        expect(this.subject.id).to.eq('1');
        expect(this.subject).to.not.eq(this.entity);
      });
    });

    context('with multiple arguments', function() {
      subject(function() {
        return this.graph.fetch('post', 1);
      });

      it('defers to fetchBy', function() {
        let hit = false;
        this.graph.fetchBy = () => {
          hit = true;
        };
        this.subject;
        expect(hit).to.be.true;
      });
    });
  });
});
