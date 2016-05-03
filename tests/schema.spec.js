import {expect} from 'chai';

import Schema from 'coalesce/schema';

import {some} from 'lodash';

describe('schema', function() {

  subject('schema', function() {
    return new Schema(this.config);
  });

  lazy('config', function() {
    return {
      typeKey: 'post',
      attributes: {
        title: {
          type: 'string'
        }
      },
      relationships: {
        comments: {
          type: 'comment',
          kind: 'hasMany'
        }
      }
    };
  });

  describe('.fields()', function() {

    subject(function() { return this.schema.fields(); });

    it('includes meta fields', function() {
      let fields = Array.from(this.subject);
      expect(some(fields, (f) => f.name === 'id')).to.be.true;
    });

    it('includes all configured fields', function() {
      let fields = Array.from(this.subject);
      expect(some(fields, (f) => f.name === 'title')).to.be.true;
      expect(some(fields, (f) => f.name === 'comments')).to.be.true;
    });

  });

  describe('.attributes()', function() {

    subject(function() { return this.schema.attributes(); });

    it('only includes attributes', function() {
      let attrs = Array.from(this.subject);
      expect(some(attrs, (f) => f.name === 'title')).to.be.true;
      expect(some(attrs, (f) => f.name === 'comments')).to.be.false;
    });

  });

});
