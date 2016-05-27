import {expect} from 'chai';

import Model from 'coalesce/model';
import Query from 'coalesce/model';
import QuerySerializer from 'coalesce/serializers/query';
import Container, {Post} from '../support/simple-hierarchy';
import Graph from 'coalesce/graph';

describe('serializers/query', function() {

  lazy('container', () => new Container());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  subject('serializer', function() {
    return this.container.get(QuerySerializer);
  });

  describe('.deserialize()', function() {

    lazy('value', () => {
      return [{
        type: 'post',
        id: 1,
        title: 'A'
      }, {
        type: 'post',
        id: 2,
        title: 'B'
      }];
    });

    subject(function() {
      return this.serializer.deserialize(this.graph, this.value, Post, {});
    });

    it('deserializes', function() {
      let arr = Array.from(this.subject);
      expect(arr.length).to.eq(2);
      expect(arr[0].id).to.eq("1");
    });

  });

});
