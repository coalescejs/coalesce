

import DefaultContainer from 'coalesce/default-container';
import Model from 'coalesce/model';

export class User extends Model {}
User.defineSchema({
  typeKey: 'user',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    profile: {
      type: 'profile',
      kind: 'belongsTo'
    }
  }
});

export class Profile extends Model {}
Profile.defineSchema({
  typeKey: 'profile',
  attributes: {
    name: {
      type: 'string'
    },
    specialId: {
      type: 'number'
    }
  },
  relationships: {
    users: {
      type: 'user',
      kind: 'hasMany'
    },
    permissions: {
      embedded: 'always',
      type: 'permission',
      kind: 'hasMany'
    }
  }
});

export class Permission extends Model{}
Permission.defineSchema({
  typeKey: 'permission',
  attributes: {
    name: {
      type: 'string'
    },
    grants: {}
  },
  relationships: {
    profile: {
      type: 'profile',
      kind: 'belongsTo'
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

export class Stage extends Model {}
Stage.defineSchema({
  typeKey: 'stage',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    prospects: {
      type: 'prospect',
      kind: 'hasMany'
    }
  }
});

export class Account extends Model {}
Account.defineSchema({
  typeKey: 'account',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    user: {
      type: 'user',
      kind: 'belongsTo'
    },
    prospects: {
      type: 'prospect',
      kind: 'hasMany'
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
    },
    account: {
      type: 'account',
      kind: 'belongsTo'
    },
    stage: {
      type: 'stage',
      kind: 'belongsTo'
    }
  }
});

export default class ProspectTags extends DefaultContainer {

  constructor() {
    super();
    this.registerType(User);
    this.registerType(Profile);
    this.registerType(Permission);
    this.registerType(Tag);
    this.registerType(Prospect);
    this.registerType(Account);
    this.registerType(Stage);
  }

}
