import {expect} from 'chai';

import DefaultContainer from 'coalesce/container';
import Graph from 'coalesce/graph';
import Model from 'coalesce/model';
import Collection from 'coalesce/collection';

describe('collection', function() {

  lazy('container', () => new DefaultContainer());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  lazy('Post', function() {
    let klass = class Post extends Model {}
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
          this.graph.create(this.Post, {id: '1', title: 'a'}),
          this.graph.create(this.Post, {id: '2', title: 'b'})
        ]
      });

      it('sets values', function() {
        let ids = Array.from(this.subject).map((m) => m.id);
        expect(ids).to.eql(['1', '2']);
      });

    });

  });

});
