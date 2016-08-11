import {expect} from 'chai';

import Container, {Post, User} from '../support/simple-hierarchy';
import QueryParamsMiddleware from 'coalesce/middleware/query-params';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('middleware/query-params', function() {

  lazy('container', () => new Container())
  subject('middleware', function() {
    return this.container.get(QueryParamsMiddleware);
  });

  describe('.serializeParams()', function() {

    lazy('graph', function() {
      return this.container.get(Graph);
    });
    lazy('entity', function() {
      return this.graph.build(Query, Post, this.params);
    });
    lazy('user', function() {
      return this.graph.build(User, {id: 1});
    });
    lazy('params', function() {
      return {user: this.user.clientId};
    });

    subject(function() {
      return this.middleware.serializeParams(this.entity);
    });

    context('with query and clientId relationship param', function() {

      it('serializes to normal ids', function() {
        expect(this.subject).to.eql({user: '1'});
      });

    });

  });

});
