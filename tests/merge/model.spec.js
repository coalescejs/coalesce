import { expect } from 'chai';

import Model from 'coalesce/model';
import ModelMerge from 'coalesce/merge/model';

class Post extends Model {

}

Post.defineSchema({
  typeKey: 'post',
  attributes: {
    title: {
      type: 'string'
    },
    desc: {
      type: 'string'
    }
  }
});

describe('merge/model', function() {

  subject('inst', function() {
    return new ModelMerge();
  });

  describe('.merge', function() {

    subject(function() {
      return this.inst.merge(this.ours, this.ancestor, this.theirs);
    });

    lazy('ours', () => new Post({title: 'A', desc: '1'}));
    lazy('ancestor', () => new Post({title: 'A', desc: '1'}));
    lazy('theirs', () => new Post({title: 'A', desc: '1'}));

    it('returns a model', function() {
      expect(this.subject).to.be.an.instanceof(Model);
    });

    context('when unchanged', function() {

      it('noops', function() {
        expect(this.subject.title).to.eq(this.ancestor.title);
        expect(this.subject.desc).to.eq(this.ancestor.desc);
      });

    });

    context('when one field changed in ours', function() {

      lazy('ours', () => new Post({title: 'B', desc: '1'}));

      it('keeps our change', function() {
        expect(this.subject.title).to.eq(this.ours.title);
        expect(this.subject.desc).to.eq(this.ancestor.desc);
      });

    });

    context('when one field changed in theirs', function() {

      lazy('theirs', () => new Post({title: 'B', desc: '1'}));

      it('keeps their change', function() {
        expect(this.subject.title).to.eq(this.ours.title);
        expect(this.subject.desc).to.eq(this.ancestor.desc);
      });

    });

    context('when same field changed in both', function() {

      lazy('ours', () => new Post({title: 'B', desc: '1'}));
      lazy('theirs', () => new Post({title: 'C', desc: '1'}));

      it('keeps our change', function() {
        expect(this.subject.title).to.eq(this.ours.title);
        expect(this.subject.desc).to.eq(this.ancestor.desc);
      });

    });

    context('when separate field changed in both', function() {

      lazy('ours', () => new Post({title: 'B', desc: '1'}));
      lazy('theirs', () => new Post({title: 'A', desc: '2'}));

      it('keeps both changes', function() {
        expect(this.subject.title).to.eq(this.ours.title);
        expect(this.subject.desc).to.eq(this.theirs.desc);
      });

    });

    context('when ours is unloaded', function() {

      lazy('ours', () => new Post({desc: '1'}));
      lazy('ancestor', () => new Post({desc: '1'}));

      it('keeps their change', function() {
        expect(this.subject.title).to.eq(this.theirs.title);
        expect(this.subject.desc).to.eq(this.ancestor.desc);
      });

    });

    context('when theirs is unloaded', function() {

      lazy('theirs', () => new Post({desc: '2'}));

      it('keeps existing value', function() {
        expect(this.subject.title).to.eq(this.ours.title);
        expect(this.subject.desc).to.eq(this.theirs.desc);
      });

    });

  });

});
