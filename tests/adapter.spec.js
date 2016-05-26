import {expect} from 'chai';
import fetchMock from 'fetch-mock';

import Container, {Post} from './support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';

describe('adapter', function() {

  beforeEach(function() {
    fetchMock.restore();
  });
  lazy('container', () => new Container())
  subject('adapter', function() {
    return this.container.get(Adapter);
  });

  describe('.load()', function() {

    lazy('entity', function() {
      return this.session.build(Post, {id: 1});
    });
    lazy('opts', () => {{}});
    lazy('session', () => new Session());

    subject(function() {
      return this.adapter.load(this.entity, this.opts, this.session);
    });

    context('with a model', function() {

      beforeEach(function() {
        fetchMock.mock('/posts/1', 'GET', JSON.stringify({type: 'post', id: 1, title: 'revived'}));
      });

      it('GETs data and resolves model', async function() {
        let res = await this.subject;
        expect(res).to.be.an.instanceOf(Post);
        expect(res.title).to.eq('revived');
        expect(res.id).to.eq("1");
      });

    });

  });

  describe('.persist()', function() {

    lazy('session', () => new Session());
    lazy('entity', function() {
      return this.session.create(Post, {title: 'Be Persistent'});
    });
    lazy('shadow', function() {});
    lazy('opts', function() {
      return {};
    });
    subject(function() {
      return this.adapter.persist(this.entity, this.session, this.opts, this.session);
    });

    context('with new entity', function() {

      beforeEach(function() {
        fetchMock.mock('/posts', 'POST', JSON.stringify({type: 'post', id: 1, title: 'Be Persistent'}));
      });

      it('POSTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isNew).to.be.false;
      });

    });

    context('with deleted entity', function() {

      lazy('entity', function() {
        let entity = this.session.push(Post, {id: 1, title: 'Beyond the grave'});
        this.session.delete(entity);
        return entity;
      });

      beforeEach(function() {
        fetchMock.mock('/posts/1', 'DELETE', JSON.stringify({type: 'post', id: 1, title: 'Beyond the grave'}));
      });

      it('DELETEs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isDeleted).to.be.true;
      });

    });

    context('with updated entity', function() {

      lazy('entity', function() {
        let entity = this.session.push(Post, {id: 1, title: 'Be Persistent'});
        entity.title = 'More Persistent';
        return entity;
      });

      beforeEach(function() {
        fetchMock.mock('/posts/1', 'PUT', JSON.stringify({type: 'post', id: 1, title: 'More Persistent'}));
      });

      it('PUTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.title).to.eq('More Persistent');
        expect(model.isNew).to.be.false;
      });

    });

  });

  describe('.resolveUrl()', function() {

    lazy('context', function() {
      return new Post(this.container.get(Graph), {id: 1});
    });
    lazy('action', () => undefined);

    subject(function() {
      return this.adapter.resolveUrl({context: this.context, action: this.action});
    });

    context('with entity as context', function() {

      it('resolves to singular resource root', function() {
        expect(this.subject).to.eq(`/posts/1`);
      });

    });

  });

});
