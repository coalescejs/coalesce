

import DefaultContainer from 'coalesce/default-container';
import Model from 'coalesce/model';

export class User extends Model {}
User.defineSchema({
  typeKey: 'user',
  attributes: {
    name: {
      type: 'string'
    }
  }
});

export class Tag extends Model {}
Tag.defineSchema({
  typeKey: 'tag',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    prospect: {
      type: 'prospect',
      kind: 'belongsTo'
    }
  }
});

export class Prospect extends Model {}

let prospectAttrs = {};
for(var i = 0; i < 100; i++) {
  prospectAttrs[`string${i}`] = {
    type: 'string'
  }
}

Prospect.defineSchema({
  typeKey: 'prospect',
  attributes: {
    body: {
      type: 'string'
    },
    ...prospectAttrs
  },
  relationships: {
    user: {
      type: 'user',
      kind: 'belongsTo'
    },
    tags: {
      embedded: 'always',
      type: 'tag',
      kind: 'hasMany'
    }
  }
});

export default class ProspectTags extends DefaultContainer {

  constructor() {
    super();
    this.registerType(User);
    this.registerType(Tag);
    this.registerType(Prospect);
  }

}
