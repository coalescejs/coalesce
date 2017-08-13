import { expect } from 'chai';
import fetchMock from 'fetch-mock';

import Container, { Post } from './support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('adapter', function() {
  beforeEach(function() {
    fetchMock.restore();
  });
  lazy('container', () => new Container());
  subject('adapter', function() {
    return this.container.get(Adapter);
  });

  describe('static methods', function() {
    subject('klass', function() {
      return class TestAdapter extends Adapter {};
    });

    describe('.baseUrl=', function() {
      lazy('value', function() {
        return 'https://cdn.acme.com/';
      });

      subject(function() {
        return (this.klass.baseUrl = this.value);
      });

      it('configures UrlMiddleware', function() {
        this.subject;
        expect(this.klass.middleware.configs[4][1]).to.eq(this.value);
      });
    });
  });

  describe('.load()', function() {
    lazy('entity', function() {
      return this.session.build(Post, { id: 1 });
    });
    lazy('opts', () => {
      {
      }
    });
    lazy('session', () => new Session());

    subject(function() {
      return this.adapter.load(this.entity, this.opts, this.session);
    });

    context('with a model', function() {
      beforeEach(function() {
        fetchMock.get('/posts/1', JSON.stringify({ type: 'post', id: 1, title: 'revived' }));
      });

      it('GETs data and resolves model', async function() {
        let res = await this.subject;
        expect(res).to.be.an.instanceOf(Post);
        expect(res.title).to.eq('revived');
        expect(res.id).to.eq('1');
      });
    });

    context('with a query', function() {
      lazy('entity', function() {
        return this.session.fetchQuery(Post, {});
      });

      beforeEach(function() {
        fetchMock.get(
          '/posts',
          JSON.stringify([{ type: 'post', id: 1, title: 'a' }, { type: 'post', id: 2, title: 'b' }])
        );
      });

      it('GETs data and resolves query', async function() {
        let res = await this.subject;
        expect(res).to.be.an.instanceOf(Query);
        let arr = Array.from(res);
        expect(arr.length).to.eq(2);
        expect(arr[0]).to.be.an.instanceOf(Post);
      });
    });
  });

  describe('.persist()', function() {
    lazy('session', function() {
      return this.container.get(Session);
    });
    lazy('entity', function() {
      return this.session.create(Post, { title: 'Be Persistent' });
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
        fetchMock.post('/posts', JSON.stringify({ type: 'post', id: 1, title: 'Be Persistent' }));
      });

      it('POSTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isNew).to.be.false;
      });
    });

    context('with destroyed entity', function() {
      lazy('entity', function() {
        let entity = this.session.build(Post, { id: 1, title: 'Beyond the grave' });
        this.session.destroy(entity);
        return entity;
      });

      beforeEach(function() {
        fetchMock.delete('/posts/1', JSON.stringify({}));
      });

      it('DELETEs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isDeleted).to.be.true;
      });
    });

    context('with updated entity', function() {
      lazy('entity', function() {
        let entity = this.session.build(Post, { id: 1, title: 'Be Persistent' });
        entity.title = 'More Persistent';
        return entity;
      });

      beforeEach(function() {
        fetchMock.put('/posts/1', JSON.stringify({ type: 'post', id: 1, title: 'More Persistent' }));
      });

      it('PUTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.title).to.eq('More Persistent');
        expect(model.isNew).to.be.false;
      });
    });
  });

  describe('.remoteCall()', function() {
    lazy('session', () => new Session());
    lazy('context', function() {
      return this.session.build(Post, { id: 1, title: 'More Persistent' });
    });
    lazy('name', () => 'approve');
    lazy('method', () => 'POST');
    lazy('params', () => {
      return {};
    });
    lazy('opts', function() {
      let { method } = this;
      return { method };
    });

    subject(function() {
      return this.adapter.remoteCall(this.context, this.name, this.params, this.opts);
    });

    context('with default method', function() {
      beforeEach(function() {
        fetchMock.post('/posts/1/approve', JSON.stringify({ type: 'post', id: 1, title: 'More Persistent' }));
      });

      it('POSTs and resolves model', async function() {
        let result = await this.subject;
        expect(result.clientId).to.eq(this.context.clientId);
      });
    });

    context('with params', function() {
      beforeEach(function() {
        fetchMock.post('/posts/1/approve', JSON.stringify({ type: 'post', id: 1, title: 'More Persistent' }));
      });

      lazy('params', function() {
        return { a: 1, b: { c: 2 } };
      });

      it('passes params in POST body', function() {
        this.subject;
        let { body } = fetchMock.lastCall()[1];
        expect(JSON.parse(body)).to.eql(this.params);
      });
    });

    context('with method=GET', function() {
      lazy('method', () => 'GET');

      context('and params set', function() {
        lazy('params', function() {
          return { sort: 'desc' };
        });

        beforeEach(function() {
          fetchMock.get(
            '/posts/1/approve?sort=desc',
            JSON.stringify({ type: 'post', id: 1, title: 'More Persistent' })
          );
        });

        it('uses params in query', function() {
          this.subject;
          let { body } = fetchMock.lastCall()[1];
          expect(body).to.be.undefined;
        });
      });
    });
  });
});
