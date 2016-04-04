import {expect} from 'chai';

import IdManager from 'coalesce/session/id-manager';

describe('session/id-manager', function() {

  subject(function() {
    return new IdManager();
  });

  describe('.reifyClientId', function() {

    it('sets clientId on new record', function() {
      let post = {
        typeKey: 'post',
        isModel: true
      };
      this.subject.reifyClientId(post);
      expect(post.clientId).to.eq("$post1");
    });

    it('reuses clientId on equivalent model', function() {
      let post = {
        typeKey: 'post',
        isModel: true,
        id: '1'
      };
      this.subject.reifyClientId(post);
      expect(post.clientId).to.not.be.undefined;
      let post2 = {
        typeKey: 'post',
        isModel: true,
        id: '1'
      };
      expect(post2.clientId).to.be.undefined;
      this.subject.reifyClientId(post2);
      expect(post2.clientId).to.eq(post.clientId);
    });
  });

});
