import { expect } from 'chai';

import diff from 'coalesce/utils/diff';
import Graph from 'coalesce/graph';

import Container, {Post} from '../support/simple-hierarchy';

describe('diff', function() {

  lazy('container', () => new Container());
  lazy('lhsGraph', function() {
    return this.container.get(Graph);
  });
  lazy('rhsGraph', function() {
    return this.container.get(Graph);
  });

  lazy('lhs', function() {
    return this.lhsGraph.build(Post, {
      title: 'test'
    });
  });

  lazy('rhs', function() {
    return this.rhsGraph.build(Post, {
      title: 'test'
    });
  });

  subject(function() {
    return diff(this.lhs, this.rhs);
  });

  context('when no differences', function() {

    it('returns empty iterator', function() {
      expect(Array.from(this.subject)).to.eql([]);
    });

  });

  context('with difference', function() {

    lazy('lhs', function() {
      return this.lhsGraph.build(Post, {
        title: 'A'
      });
    });

    it('returns difference', function() {
      let arr = Array.from(this.subject);
      expect(arr.length).to.eq(1);
      expect(arr[0]).to.eql({
        field: Post.schema.title,
        lhs: 'A',
        rhs: 'test'
      });
    });

  });

  context('with empty rhs', function() {

    lazy('rhs', function() {
      return undefined;
    });

    it('returns all fields', function() {
      let arr = Array.from(this.subject);
      expect(arr.length).to.eq(5);
    });


  });

});
