import {expect} from 'chai';

import MiddlewareChain from 'coalesce/middleware-chain';

class TestMiddleware {

}

class TestMiddleware2 {

}

describe('middleware-chain', function() {

  lazy('configs', function() {
    return [];
  });

  subject('chain', function() {
    return new MiddlewareChain(this.configs);
  });

  describe('.use', function() {

    subject(function() {
      return this.chain.use(TestMiddleware, {});
    });

    it('returns new chain with middleware added to the end', function() {
      expect(this.chain).to.not.eq(this.subject);
      expect(this.subject.configs).to.eql([[TestMiddleware, {}]]);
    });

    context('when middleware already exists', function () {

      lazy('configs', function() {
        return [TestMiddleware];
      });

      it('reconfigures existing middleware', function() {
        expect(this.subject.configs).to.eql([[TestMiddleware, {}]]);
      });

    });

    context('when different middleware already exists', function() {

      lazy('configs', function() {
        return [TestMiddleware2];
      });

      it('returns new chain with middleware added to the end', function() {
        expect(this.chain).to.not.eq(this.subject);
        expect(this.subject.configs).to.eql([[TestMiddleware2], [TestMiddleware, {}]]);
      });

    })

  });

  describe('.replace', function() {

    lazy('configs', function() {
      return [TestMiddleware];
    });

    subject(function() {
      return this.chain.replace(TestMiddleware, TestMiddleware2, {});
    });

    it('replaces middleware', function() {
      expect(this.subject.configs).to.eql([[TestMiddleware2, {}]]);
    });

  });

});
