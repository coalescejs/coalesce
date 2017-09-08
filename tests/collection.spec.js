import { expect } from 'chai';

import DefaultContainer from 'coalesce/container';
import Graph from 'coalesce/graph';
import Model from 'coalesce/model';
import Collection from 'coalesce/collection';

import { map } from 'lodash';

describe('collection', function() {
  lazy('container', () => new DefaultContainer());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  lazy('Post', function() {
    let klass = class Post extends Model {};
    klass.defineSchema({
      typeKey: 'post',
      attributes: {
        title: {
          type: 'string'
        }
      }
    });
    return klass;
  });

  describe('constructor', function() {
    lazy('arg', () => undefined);
    subject(function() {
      return new Collection(this.graph, this.arg);
    });

    context('with an iterable', function() {
      lazy('arg', function() {
        return [
          this.graph.build(this.Post, { id: '1', title: 'a' }),
          this.graph.build(this.Post, { id: '2', title: 'b' })
        ];
      });

      it('sets values', function() {
        let ids = Array.from(this.subject).map(m => m.id);
        expect(ids).to.eql(['1', '2']);
      });
    });
  });

  describe('.isLoaded', function() {
    lazy('arg', () => undefined);
    lazy('entity', function() {
      return new Collection(this.graph, this.arg);
    });
    subject(function() {
      return this.entity.isLoaded;
    });

    context('when not constructed with an iterable', function() {
      it('returns false', function() {
        expect(this.subject).to.be.false;
      });
    });

    context('when constructed with an iterable', function() {
      lazy('arg', () => []);

      it('returns true', function() {
        expect(this.subject).to.be.true;
      });
    });
  });

  context('when in proxy mode', function() {
    subject(function() {
      return new Collection(this.graph, [
        this.graph.build(this.Post, { id: '1', title: 'a' }),
        this.graph.build(this.Post, { id: '2', title: 'b' })
      ]);
    });

    it('is accessible like a normal array', function() {
      expect(this.subject[1]).to.be.an.instanceOf(this.Post);
    });

    it('is compatible with lodash', function() {
      expect(map(this.subject, 'title')).to.eql(['a', 'b']);
    });
  });
});
