import Model from 'coalesce/entities/model';

function post() {
  class Post extends Model {};
  Post.defineSchema({
    attributes: {
      title: {type: 'string'},
      submitted: {type: 'boolean'}
    }
  });
  
  return {
    types: {
      post: Post
    }
  };
}

export {post};

//
// Common context configurations for tests

function postWithComments() {
  class Post extends Model {}
  Post.defineSchema({
    attributes: {
      title: {type: 'string'}
    },
    relationships: {
      comments: {kind: 'hasMany', type: 'comment'}
    }
  });

  class Comment extends Model {}
  Comment.defineSchema({
    attributes: {
      body: {type: 'string'}
    },
    relationships: {
      post: {kind: 'belongsTo', type: 'post'}
    }
  });
  
  return {
    types: {
      post: Post,
      comment: Comment
    }
  };
}

export {postWithComments};

function postWithEmbeddedComments() {
  var c = postWithComments();
  c.types.post.defineSchema({
    relationships: {
      comments: {kind: 'hasMany', type: 'comment', embedded: 'always'}
    }
  });
  return c;
}

export {postWithEmbeddedComments};


function userWithProfile() {

  class Profile extends Model {}
  Profile.defineSchema({
    attributes: {
      title: {
        type: 'string'
      }
    },
    relationships: {
      user: {
        kind: 'belongsTo',
        type: 'user',
        owner: false
      }
    }
  });

  class User extends Model {};
  User.defineSchema({
    attributes: {
      name: {
        type: 'string'
      }
    },
    relationships: {
      profile: {
        kind: 'belongsTo',
        type: 'profile'
      }
    }
  });
  
  return {
    types: {
      profile: Profile,
      user: User
    }
  };
  
}

export {userWithProfile};

function userWithEmbeddedProfile() {
  var c = userWithProfile();
  c.types.profile.defineSchema({
    relationships: {
      user: {kind: 'belongsTo', type: 'user', embedded: 'always'}
    }
  });
  return c;
}

export {userWithEmbeddedProfile};

function groupWithMembersWithUsers() {

  class Group extends Model {};
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

  class Member extends Model {};
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

  class User extends Model {};
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

  return {
    types: {
      group: Group,
      member: Member,
      user: User
    }
  }
  
}

export {groupWithMembersWithUsers};
