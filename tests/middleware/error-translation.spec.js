import { expect } from 'chai';

import Container, { Post } from '../support/simple-hierarchy';

import Graph from 'coalesce/graph';
import ErrorTranslationMiddleware from 'coalesce/middleware/error-translation';

import { EntityNotFound, EntityConflict, EntityInvalid, ServerError, NetworkError } from 'coalesce/errors';

describe('middleware/error-translation', function() {
  lazy('container', () => new Container());

  lazy('response', function() {
    let { status } = this;
    return {
      status
    };
  });

  lazy('status', () => 200);

  lazy('ctx', function() {
    let { entity } = this;
    return { entity };
  });

  lazy('graph', function() {
    return this.container.get(Graph);
  });

  lazy('entity', function() {
    return this.graph.build(Post, { id: 1 });
  });

  lazy('next', function() {
    return async () => {
      return this.response;
    };
  });

  subject('middleware', function() {
    return this.container.get(ErrorTranslationMiddleware);
  });

  describe('.call()', function() {
    subject(function() {
      return this.middleware.call(this.ctx, this.next);
    });

    context('with 200', function() {
      it('returns response', async function() {
        let response = await this.subject;
        expect(response).to.eq(this.response);
      });
    });

    context('with 404', function() {
      lazy('status', () => 404);

      it('throws EntityNotFound', async function() {
        try {
          await this.subject;
          expect(false).to.be.true;
        } catch (err) {
          expect(err).to.be.an.instanceOf(EntityNotFound);
          expect(err.entity).to.eq(this.entity);
        }
      });
    });

    context('with 409', function() {
      lazy('status', () => 409);

      it('throws EntityConflict', async function() {
        try {
          await this.subject;
          expect(false).to.be.true;
        } catch (err) {
          expect(err).to.be.an.instanceOf(EntityConflict);
          expect(err.entity).to.eq(this.entity);
        }
      });
    });

    context('with 422', function() {
      lazy('status', () => 422);

      it('throws EntityInvalid', async function() {
        try {
          await this.subject;
          expect(false).to.be.true;
        } catch (err) {
          expect(err).to.be.an.instanceOf(EntityInvalid);
          expect(err.entity).to.eq(this.entity);
        }
      });
    });

    context('with 500', function() {
      lazy('status', () => 500);

      it('throws ServerError', async function() {
        try {
          await this.subject;
          expect(false).to.be.true;
        } catch (err) {
          expect(err).to.be.an.instanceOf(ServerError);
        }
      });
    });
  });
});
