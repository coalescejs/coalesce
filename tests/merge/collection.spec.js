import { expect } from 'chai';

import CollectionMerge from 'coalesce/merge/collection';

function q(...args) {
  return args.map(clientId => {
    return { clientId };
  });
}

describe('merge/collection', function() {
  lazy('session', function() {
    let s = {};
    s.merge = e => {
      return e;
    };
    return s;
  });

  describe('.merge', function() {
    lazy('ours', () => q());
    lazy('ancestor', () => q());
    lazy('theirs', () => q());

    subject(function() {
      return new CollectionMerge().merge(this.ours, this.ancestor, this.theirs, this.session);
    });

    context('when new element added in theirs', function() {
      lazy('theirs', () => q('a'));

      it('adds', function() {
        expect(this.subject).to.eql([{ clientId: 'a' }]);
      });
    });

    context('when new element added in both', function() {
      lazy('theirs', () => q('a'));
      lazy('ours', () => q('b'));

      it('adds', function() {
        expect(this.subject).to.eql([{ clientId: 'a' }, { clientId: 'b' }]);
      });
    });

    context('when element removed in theirs', function() {
      lazy('ours', () => q('a'));
      lazy('ancestor', () => q('a'));
      lazy('theirs', () => q());

      it('removes', function() {
        expect(this.subject).to.eql([]);
      });
    });

    context('when element added in ours and removed in theirs', function() {
      lazy('ours', () => q('a', 'b'));
      lazy('ancestor', () => q('a'));
      lazy('theirs', () => q());

      it('removes', function() {
        expect(this.subject).to.eql([{ clientId: 'b' }]);
      });
    });
  });
});
