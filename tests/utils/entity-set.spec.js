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
  
});
