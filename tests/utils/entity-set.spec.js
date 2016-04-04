import { expect } from 'chai';

import EntitySet from 'coalesce/utils/entity-set';

describe('utils/entity-set', function() {

  lazy('set', () => new EntitySet());

  it('removes based on isEqual', function() {
    var postA, postB;
    postA = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    postB = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    expect(postA).to.not.eq(postB);
    expect(postA.clientId === postB.clientId).to.be.true;
    this.set.add(postA);
    expect(this.set.size).to.eq(1);
    this.set["delete"](postB);
    expect(this.set.size).to.eq(0);
  });

  it('adds based on isEqual and always overwrites', function() {
    var postA, postB;
    postA = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    postB = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    expect(postA).to.not.eq(postB);
    expect(postA.clientId === postB.clientId).to.be.true;
    this.set.add(postA);
    expect(this.set.size).to.eq(1);
    this.set.add(postB);
    expect(this.set.size).to.eq(1);
    expect(this.set[0]).to.eq(postB);
  });

  xit('copies', function() {
    var copy, copyA, copyB, postA, postB;
    postA = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    postB = {
      id: "2",
      title: "two",
      clientId: "post2"
    };
    this.set.add(postA);
    this.set.add(postB);
    copy = this.set.copy();
    expect(copy).to.not.eq(this.set);
    copyA = copy.getModel(postA);
    copyB = copy.getModel(postB);
    expect(copyA).to.eq(postA);
    expect(copyB).to.eq(postB);
  });

  xit('deep copies', function() {
    var copy, copyA, copyB, postA, postB;
    postA = {
      id: "1",
      title: "one",
      clientId: "post1"
    };
    postB = {
      id: "2",
      title: "two",
      clientId: "post2"
    };
    this.set.add(postA);
    this.set.add(postB);
    copy = this.set.copy(true);
    expect(copy).to.not.eq(this.set);
    copyA = copy.getModel(postA);
    copyB = copy.getModel(postB);
    expect(copyA).to.not.eq(postA);
    expect(copyB).to.not.eq(postB);
    expect(copyA.clientId === postA.clientId).to.be.true;
    expect(copyB.clientId === postB.clientId).to.be.true;
  });

  context('with model', function() {
    beforeEach(function() {
      this.post = {
        title: 'test',
        id: "1",
        clientId: "post1"
      };
      this.set.add(this.post);
    });

    xit('finds via getForClientId', function() {
      expect(this.set.getForClientId("post1")).to.eq(this.post);
    });

    xit('finds via getModel', function() {
      expect(this.set.getModel(this.post)).to.eq(this.post);
    });

    xit('finds via getModel with alternate model', function() {
      var post;
      post = {
        title: 'some other',
        id: "1",
        clientId: "post1"
      };
      expect(this.set.getModel(post)).to.eq(this.post);
    });
  });
});
