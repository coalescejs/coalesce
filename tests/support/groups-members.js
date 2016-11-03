import DefaultContainer from 'coalesce/default-container';
import Model from 'coalesce/model';

export class Group extends Model {
}
Group.defineSchema({
  typeKey: 'group',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    members: {
      kind: 'hasMany',
      type: 'member',
      embedded: 'always'
    },
    user: {
      kind: 'belongsTo',
      type: 'user'
    }
  }
});

export class Member extends Model {
}
Member.defineSchema({
  typeKey: 'member',
  attributes: {
    role: {
      type: 'string'
    }
  },
  relationships: {
    user: {
      kind: 'belongsTo',
      type: 'user'
    },
    group: {
      kind: 'belongsTo',
      type: 'group'
    }
  }
});

export class User extends Model {
}
User.defineSchema({
  typeKey: 'user',
  attributes: {
    name: {
      type: 'string'
    }
  },
  relationships: {
    groups: {
      kind: 'hasMany',
      type: 'group'
    },
    members: {
      kind: 'hasMany',
      type: 'member'
    }
  }
});

export default class GroupsMembers extends DefaultContainer {

  constructor() {
    super();
    this.registerType(Group);
    this.registerType(Member);
    this.registerType(User);
  }

}
