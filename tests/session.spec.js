import {expect} from 'chai';

import Model from 'coalesce/model';

import Session from 'coalesce/session';

describe('session', function() {

  subject('session', () => new Session());

  lazy('Post', () => {
    return class Post extends Model {
    };
  });

  describe('.build', function() {

    lazy('hash', () => {return {};});

    subject(function() {
      return this.session.build(this.Post, this.hash);
    });

    it('instantiates', function() {
      expect(this.subject).to.be.an.instanceOf(this.Post);
    });

  });

});
