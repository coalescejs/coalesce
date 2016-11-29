import {expect} from 'chai';

import Container, {Post} from '../support/simple-hierarchy';
import SerializeMiddleware from 'coalesce/middleware/serialize';
import Session from 'coalesce/session';

describe('middleware/serialize', function() {

  lazy('container', () => new Container())
  subject('middleware', function() {
    return this.container.get(SerializeMiddleware);
  });

  lazy('session', function() {
    return this.container.get(Session);
  });

  lazy('entity', function() {
    return this.session.build(Post, {rev: 1, id: 1, title: 'loaded'});
  });

  describe('.call()', function() {

    beforeEach(function() {
      this.next = () => {
        return {
          "type": "post",
          "title": "loaded",
          "id": 1,
          "client_id": "$post1",
          "rev": 1,
          "client_rev": 1
        };
      }
    });

    lazy('deserialize', () => undefined);
    lazy('method', () => 'POST');

    lazy('ctx', function() {
      let {entity, next, method, deserialize} = this;
      return {entity, next, method, deserialize};
    });

    subject(function() {
      return this.middleware.call(this.ctx, this.next);
    });

    it('serializes and deserializes', async function() {
      let res = await this.subject;
      expect(this.ctx.body.id).to.eq(1);
      expect(res).to.be.an.instanceOf(Post);
    });

    context('when deserialize=false', function() {

      lazy('deserialize', () => false);

      it('does not deserialize result', async function() {
        let res = await this.subject;
        expect(res).to.eql({
          "type": "post",
          "title": "loaded",
          "id": 1,
          "client_id": "$post1",
          "rev": 1,
          "client_rev": 1
        });
      });

    });

    context('when method=GET', function() {

      lazy('method', () => 'GET');

      it('does not serialize', async function() {
        let res = await this.subject;
        expect(this.ctx.body).to.be.undefined;
      });

    });

    context("when body already present", function() {

      lazy('body', function() {
        return {x: 2};
      });

      lazy('ctx', function() {
        let {entity, next, body} = this;
        return {entity, next, body};
      });

      it('skips serialization', async function() {
        let res = await this.subject;
        expect(this.ctx.body).to.eql(this.body);
        expect(res).to.be.an.instanceOf(Post);
      });

    });

    context("when metadata on the context", function() {

      lazy('ctx', function() {
        let {entity, next, body} = this;
        let meta = {
          canRead: true
        };
        return {entity, next, body, meta};
      });

      it('sets on entity', async function() {
        let res = await this.subject;
        expect(res.meta).to.eql({canRead: true});
      });

    });

  });

});
