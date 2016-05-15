import {expect} from 'chai';
import fetchMock from 'fetch-mock';

import Model from 'coalesce/model';

import Adapter from 'coalesce/adapter';

describe('adapter', function() {

  beforeEach(function() {
    fetchMock.restore();
  });

  lazy('Post', function() {
    let klass = class Post extends Model {}
    klass.adapter = this.Adapter;
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

  subject('adapter', () => new Adapter());

  describe('.load()', function() {

    lazy('entity', function() {
      return new this.Post({id: 1});
    });
    lazy('opts', () => {{}});
    lazy('session', () => null);

    subject(function() {
      return this.adapter.load(this.entity, this.opts, this.session);
    });

    context('with a model', function() {

      beforeEach(function() {
        fetchMock.mock('/posts/1', 'GET', JSON.stringify({test: true}));
      });

      it('loads data', async function() {
        let res = await this.subject;
        expect(res.test).to.be.true
      });

    });

  });

  describe('.resolveUrl()', function() {

    lazy('context', function() {
      return new this.Post({id: 1});
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
