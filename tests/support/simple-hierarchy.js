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
    posts: {
      type: 'post',
      kind: 'hasMany'
    },
    comments: {
      type: 'post',
      kind: 'hasMany'
    }
  }
});

export class Post extends Model {}
Post.defineSchema({
  typeKey: 'post',
  attributes: {
    title: {
      type: 'string'
    }
  },
  relationships: {
    user: {
      type: 'post',
      kind: 'belongsTo'
    },
    comments: {
      type: 'post',
      kind: 'hasMany'
    }
  }
});

export class Comment extends Model {}
Comment.defineSchema({
  typeKey: 'comment',
  attributes: {
    body: {
      type: 'string'
    }
  },
  relationships: {
    user: {
      type: 'post',
      kind: 'belongsTo'
    },
    comments: {
      type: 'user',
      kind: 'belongsTo'
    }
  }
});

export default class SimpleHierarchy extends DefaultContainer {

  constructor() {
    super();
    this.registerType(User);
    this.registerType(Post);
    this.registerType(Comment);
  }

}
