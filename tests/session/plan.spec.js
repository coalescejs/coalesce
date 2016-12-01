import {expect} from 'chai';

import Model from 'coalesce/model';
import Query from 'coalesce/model';
import QuerySerializer from 'coalesce/serializers/query';
import Container, {Post, Comment} from '../support/simple-hierarchy';
import Graph from 'coalesce/graph';
import Session from 'coalesce/session';

describe('session/plan', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });
  lazy('entities', function() {
    return [];
  });

  subject('plan', function() {
    return this.session.plan(this.entities);
  });

  context('with no entities', function() {

    it('has no operations', function() {
      expect(this.plan.entities.size).to.eq(0)
    });

  });

  context('with a single entity', function() {

    lazy('entities', function() {
      return [
        this.session.create(Post, {title: 'always be planning'})
      ];
    });

    it('has a single operation', function() {
      expect(this.plan.entities.size).to.eq(1)
    });

  });

  context('with two dependent entities', function() {

    lazy('entities', function() {
      return [
        this.session.create(Post, {title: 'always be planning'}),
        this.session.create(Comment)
      ];
    });

    beforeEach(function() {
      this.plan.addDependency(this.entities[1], this.entities[0]);
    });

    it('has two operations', function() {
      expect(this.plan.entities.size).to.eq(2);
    });

    it('is iterable', function() {
      expect(Array.from(this.plan).length).to.eq(2);
    });

  });


});
