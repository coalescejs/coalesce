import { expect } from 'chai';

import Model from 'coalesce/model';

import Container from 'coalesce/container';

describe('container', function() {
  subject('container', () => new Container());

  describe('.get()', function() {
    lazy('Type', function() {
      return class TestClass {};
    });

    it('returns an new instance each invocation', function() {
      let res = this.container.get(this.Type);
      expect(res).to.be.an.instanceOf(this.Type);
      expect(this.container.get(this.Type)).to.not.eq(res);
    });

    context('on a singleton type', function() {
      lazy('Type', function() {
        return class TestClass {
          static singleton = true;
        };
      });

      it('returns the same instance each invocation', function() {
        let res = this.container.get(this.Type);
        expect(res).to.be.an.instanceOf(this.Type);
        expect(this.container.get(this.Type)).to.eq(res);
      });
    });

    context('on a type with dependencies declared', function() {
      lazy('Dep', function() {
        return class Dep {
          static singleton = true;
        };
      });

      lazy('Type', function() {
        return class TestClass {
          static dependencies = [this.Dep];

          constructor(dep) {
            this.dep = dep;
          }
        };
      });

      it('returns the same instance each invocation', function() {
        let res = this.container.get(this.Type);
        expect(res.dep).to.be.an.instanceOf(this.Dep);
      });
    });
  });

  describe('.typeFor', function() {
    lazy('Model', () => {
      return class TestModel extends Model {};
    });

    subject(function() {
      return this.container.typeFor(this.Model);
    });

    it('returns class', function() {
      expect(this.subject).to.eq(this.Model);
    });
  });
});
