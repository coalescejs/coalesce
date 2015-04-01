define("coalesce-test/_setup", [], function() {
  "use strict";
  var __moduleName = "coalesce-test/_setup";
  return {};
});

define("coalesce-test/active_model/_shared", ['coalesce/container', 'coalesce/active_model/active_model_adapter'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/active_model/_shared";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Container = $__0.default;
  var ActiveModelAdapter = $__2.default;
  var setup;
  setup = function() {
    var TestActiveModelAdapter;
    TestActiveModelAdapter = ActiveModelAdapter.extend({
      h: null,
      r: null,
      init: function() {
        this._super();
        this.h = [];
        return this.r = {};
      },
      ajax: function(url, type, hash) {
        var adapter;
        adapter = this;
        return new Coalesce.Promise.Promise(function(resolve, reject) {
          var json,
              key;
          key = type + ":" + url;
          adapter.h.push(key);
          json = adapter.r[key];
          if (hash && typeof hash.data === 'string') {
            hash.data = JSON.parse(hash.data);
          }
          if (!json) {
            throw "No data for " + key;
          }
          if (typeof json === 'function') {
            json = json(url, type, hash);
          }
          return adapter.runLater((function() {
            return resolve(json);
          }), 0);
        });
      },
      runLater: function(callback) {
        return Coalesce.run.later(callback, 0);
      }
    });
    this.App = {};
    this.container = new Container();
    this.RestAdapter = TestActiveModelAdapter.extend();
    this.container.register('adapter:main', this.RestAdapter);
    this.adapter = this.container.lookup('adapter:main');
    this.session = this.adapter.newSession();
    return this.container = this.adapter.container;
  };
  var $__default = setup;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce-test/active_model/active_model_adapter", ['./_shared', 'coalesce/model/model'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/active_model/active_model_adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var Model = $__2.default;
  describe("ActiveModelAdapter", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      session = this.session;
      Coalesce.__container__ = this.container;
      var MessageThread = function MessageThread() {
        $traceurRuntime.defaultSuperCall(this, $MessageThread.prototype, arguments);
      };
      var $MessageThread = MessageThread;
      ($traceurRuntime.createClass)(MessageThread, {}, {}, Model);
      ;
      MessageThread.defineSchema({
        typeKey: 'message_thread',
        attributes: {subject: {type: 'string'}}
      });
      this.App.MessageThread = this.MessageThread = MessageThread;
      return this.container.register('model:message_thread', this.MessageThread);
    });
    afterEach(function() {
      return delete Coalesce.__container__;
    });
    return describe('.pathForType', function() {
      return it('underscores and pluralizes', function() {
        return expect(adapter.pathForType('message_thread')).to.eq('message_threads');
      });
    });
  });
  return {};
});

define("coalesce-test/adapter", ['coalesce/model/model', 'coalesce/container'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Model = $__0.default;
  var Container = $__2.default;
  describe('Adapter', function() {
    beforeEach(function() {
      this.container = new Container();
      var Post = function Post() {
        $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
      };
      var $Post = Post;
      ($traceurRuntime.createClass)(Post, {}, {}, Model);
      ;
      Post.defineSchema({
        typeKey: 'post',
        attributes: {title: {type: 'string'}}
      });
      this.Post = Post;
      return this.adapter = this.container.lookup('adapter:main');
    });
    return describe('reifyClientId', function() {
      it('sets clientId on new record', function() {
        var post;
        post = this.Post.create({title: 'new post'});
        expect(post.clientId).to.be["null"];
        this.adapter.reifyClientId(post);
        return expect(post.clientId).to.not.be["null"];
      });
      return it('should set existing clientId on detached model', function() {
        var detached,
            post;
        post = this.Post.create({
          title: 'new post',
          id: "1"
        });
        expect(post.clientId).to.be["null"];
        this.adapter.reifyClientId(post);
        expect(post.clientId).to.not.be["null"];
        detached = this.Post.create({
          title: 'different instance',
          id: "1"
        });
        expect(detached.clientId).to.be["null"];
        this.adapter.reifyClientId(detached);
        return expect(detached.clientId).to.eq(post.clientId);
      });
    });
  });
  return {};
});

define("coalesce-test/collections/model_array", ['coalesce/collections/model_array', 'coalesce/model/model', 'coalesce/model/attribute'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/collections/model_array";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var ModelArray = $__0.default;
  var Model = $__2.default;
  var attr = $__4.default;
  describe('ModelArray', function() {
    var array;
    array = null;
    beforeEach(function() {
      var Post = function Post() {
        $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
      };
      var $Post = Post;
      ($traceurRuntime.createClass)(Post, {}, {}, Model);
      ;
      Post.defineSchema({
        typeKey: 'post',
        attributes: {title: {type: 'string'}}
      });
      this.Post = Post;
      return array = new ModelArray();
    });
    describe('removeObject', function() {
      return it('should remove based on `isEqual` equivalence', function() {
        array.addObject(this.Post.create({clientId: '1'}));
        array.removeObject(this.Post.create({clientId: '1'}));
        return expect(array.length).to.eq(0);
      });
    });
    describe('.copyTo', function() {
      var dest;
      dest = null;
      beforeEach(function() {
        return dest = new ModelArray();
      });
      it('should copy objects', function() {
        array.addObjects([this.Post.create({clientId: '1'}), this.Post.create({clientId: '2'})]);
        array.copyTo(dest);
        return expect(dest.length).to.eq(2);
      });
      return it('should remove objects not present in source array', function() {
        array.addObject(this.Post.create({clientId: '1'}));
        dest.addObject(this.Post.create({clientId: '2'}));
        array.copyTo(dest);
        expect(dest.length).to.eq(1);
        return expect(dest.objectAt(0).clientId).to.eq('1');
      });
    });
    return describe('.load', function() {
      beforeEach(function() {
        this.Post.reopen({load: function() {
            this.loadCalled = true;
            return Coalesce.Promise.resolve(this);
          }});
        array.pushObject(this.Post.create({id: "1"}));
        return array.pushObject(this.Post.create({id: "2"}));
      });
      return it('should load all models', function() {
        return array.load().then(function() {
          expect(array.length).to.eq(2);
          return array.forEach(function(model) {
            return expect(model.loadCalled).to.be["true"];
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/collections/model_set", ['coalesce/model/model', 'coalesce/collections/model_set'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/collections/model_set";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Model = $__0.default;
  var ModelSet = $__2.default;
  describe('ModelSet', function() {
    beforeEach(function() {
      var Post = function Post() {
        $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
      };
      var $Post = Post;
      ($traceurRuntime.createClass)(Post, {}, {}, Model);
      ;
      Post.defineSchema({
        typeKey: 'post',
        attributes: {title: {type: 'string'}}
      });
      this.Post = Post;
      return this.set = new ModelSet();
    });
    it('removes based on isEqual', function() {
      var postA,
          postB;
      postA = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      postB = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      expect(postA).to.not.eq(postB);
      expect(postA.isEqual(postB)).to.be["true"];
      this.set.add(postA);
      expect(this.set.size).to.eq(1);
      this.set["delete"](postB);
      return expect(this.set.size).to.eq(0);
    });
    it('adds based on isEqual and always overwrites', function() {
      var postA,
          postB;
      postA = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      postB = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      expect(postA).to.not.eq(postB);
      expect(postA.isEqual(postB)).to.be["true"];
      this.set.add(postA);
      expect(this.set.size).to.eq(1);
      this.set.add(postB);
      expect(this.set.size).to.eq(1);
      return expect(this.set[0]).to.eq(postB);
    });
    it('copies', function() {
      var copy,
          copyA,
          copyB,
          postA,
          postB;
      postA = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      postB = this.Post.create({
        id: "2",
        title: "two",
        clientId: "post2"
      });
      this.set.add(postA);
      this.set.add(postB);
      copy = this.set.copy();
      expect(copy).to.not.eq(this.set);
      copyA = copy.getModel(postA);
      copyB = copy.getModel(postB);
      expect(copyA).to.eq(postA);
      return expect(copyB).to.eq(postB);
    });
    it('deep copies', function() {
      var copy,
          copyA,
          copyB,
          postA,
          postB;
      postA = this.Post.create({
        id: "1",
        title: "one",
        clientId: "post1"
      });
      postB = this.Post.create({
        id: "2",
        title: "two",
        clientId: "post2"
      });
      this.set.add(postA);
      this.set.add(postB);
      copy = this.set.copy(true);
      expect(copy).to.not.eq(this.set);
      copyA = copy.getModel(postA);
      copyB = copy.getModel(postB);
      expect(copyA).to.not.eq(postA);
      expect(copyB).to.not.eq(postB);
      expect(copyA.isEqual(postA)).to.be["true"];
      return expect(copyB.isEqual(postB)).to.be["true"];
    });
    return context('with model', function() {
      beforeEach(function() {
        this.post = this.Post.create({
          title: 'test',
          id: "1",
          clientId: "post1"
        });
        return this.set.add(this.post);
      });
      it('finds via getForClientId', function() {
        return expect(this.set.getForClientId("post1")).to.eq(this.post);
      });
      it('finds via getModel', function() {
        return expect(this.set.getModel(this.post)).to.eq(this.post);
      });
      return it('finds via getModel with alternate model', function() {
        var post;
        post = this.Post.create({
          title: 'some other',
          id: "1",
          clientId: "post1"
        });
        return expect(this.set.getModel(post)).to.eq(this.post);
      });
    });
  });
  return {};
});

define("coalesce-test/merge_strategies/per_field", ['coalesce/merge/per_field', 'coalesce/model/model', 'coalesce/container'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/merge_strategies/per_field";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var PerField = $__0.default;
  var Model = $__2.default;
  var Container = $__4.default;
  describe('PerField', function() {
    var App,
        session;
    session = null;
    App = null;
    beforeEach(function() {
      var adapter;
      App = {};
      this.container = new Container();
      Coalesce.__container__ = this.container;
      var User = function User() {
        $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
      };
      var $User = User;
      ($traceurRuntime.createClass)(User, {}, {}, Model);
      ;
      User.defineSchema({
        typeKey: 'user',
        attributes: {name: {type: 'string'}},
        relationships: {posts: {
            kind: 'hasMany',
            type: 'post'
          }}
      });
      App.User = User;
      var Comment = function Comment() {
        $traceurRuntime.defaultSuperCall(this, $Comment.prototype, arguments);
      };
      var $Comment = Comment;
      ($traceurRuntime.createClass)(Comment, {}, {}, Model);
      ;
      Comment.defineSchema({
        typeKey: 'comment',
        attributes: {body: {type: 'string'}},
        relationships: {post: {
            kind: 'belongsTo',
            type: 'post'
          }}
      });
      App.Comment = this.Comment = Comment;
      var Post = function Post() {
        $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
      };
      var $Post = Post;
      ($traceurRuntime.createClass)(Post, {}, {}, Model);
      ;
      Post.defineSchema({
        typeKey: 'post',
        attributes: {
          title: {type: 'string'},
          body: {type: 'string'},
          createdAt: {type: 'date'}
        },
        relationships: {
          comments: {
            kind: 'hasMany',
            type: 'comment'
          },
          user: {
            kind: 'belongsTo',
            type: 'user'
          }
        }
      });
      App.Post = Post;
      this.container.register('model:post', App.Post);
      this.container.register('model:user', App.User);
      this.container.register('model:comment', App.Comment);
      adapter = this.container.lookup('adapter:main');
      return session = adapter.newSession();
    });
    it('keeps modified fields from both versions', function() {
      var post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'titleA',
        body: 'bodyA',
        createdAt: new Date(1985, 7, 22)
      }));
      post.title = 'titleB';
      session.merge(App.Post.create({
        id: '1',
        title: 'titleA',
        body: 'bodyB',
        createdAt: null,
        comments: []
      }));
      expect(post.title).to.eq('titleB');
      expect(post.body).to.eq('bodyB');
      expect(post.createdAt).to.be["null"];
      post.comments.addObject(session.create('comment'));
      session.merge(App.Post.create({
        id: '1',
        title: 'titleB',
        body: 'bodyB',
        user: App.User.create({
          id: '2',
          posts: [App.Post.create({id: '1'})]
        })
      }));
      expect(post.comments.length).to.eq(1);
      expect(post.comments[0].id).to.be["null"];
      return expect(post.user.id).to.eq('2');
    });
    it('keeps ours if same field modified in both versions', function() {
      var post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'titleA',
        body: 'bodyA'
      }));
      post.title = 'titleB';
      post.body = 'bodyB';
      session.merge(App.Post.create({
        id: '1',
        title: 'titleC',
        body: 'bodyC',
        user: null,
        comments: []
      }));
      expect(post.title).to.eq('titleB');
      expect(post.body).to.eq('bodyB');
      post.comments.addObject(App.Comment.create());
      post.user = App.User.create();
      session.merge(App.Post.create({
        id: '1',
        title: 'titleB',
        body: 'bodyB',
        user: App.User.create({id: '2'}),
        comments: [App.Comment.create({id: '3'})]
      }));
      expect(post.comments.length).to.eq(1);
      expect(post.comments[0].id).to.be["null"];
      return expect(post.user.id).to.be["null"];
    });
    it('keeps ours if only modified in ours', function() {
      var newData,
          post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'titleA',
        body: 'bodyA',
        user: App.User.create({
          id: '2',
          posts: [App.Post.create({id: '1'})]
        }),
        comments: [App.Comment.create({
          id: '3',
          user: App.User.create({id: '2'}),
          post: App.Post.create({id: '1'})
        })]
      }));
      session.create(App.Comment, {post: post});
      expect(post.comments.length).to.eq(2);
      newData = App.Post.create({
        id: '1',
        title: 'titleA',
        body: 'bodyA',
        user: App.User.create({
          id: '2',
          posts: [App.Post.create({id: '1'})]
        }),
        comments: [App.Comment.create({
          id: '3',
          user: App.User.create({id: '2'}),
          post: App.Post.create({id: '1'})
        })]
      });
      newData.comments[0].post = newData;
      session.merge(newData);
      return expect(post.comments.length).to.eq(2);
    });
    it('still merges model if removed from belongsTo in ours', function() {
      var post,
          user;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        user: App.User.create({
          id: '2',
          posts: [App.Post.create({id: '1'})]
        })
      }));
      user = post.user;
      post.user = null;
      session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        user: App.User.create({
          id: '2',
          name: 'grodon',
          posts: [App.Post.create({id: '1'})]
        })
      }));
      expect(post.user).to.be["null"];
      return expect(user.name).to.eq('grodon');
    });
    it('still merges model if removed from hasMany in ours', function() {
      var comment,
          post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        comments: [App.Comment.create({
          id: '2',
          body: 'herp',
          post: App.Post.create({id: '1'})
        })]
      }));
      comment = post.comments[0];
      post.comments.clear();
      expect(post.comments.length).to.eq(0);
      session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        comments: [App.Comment.create({
          id: '2',
          body: 'derp',
          post: App.Post.create({id: '1'})
        })]
      }));
      expect(post.comments.length).to.eq(0);
      return expect(comment.body).to.eq('derp');
    });
    it('still merges model if sibling added to hasMany', function() {
      var comment,
          post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        comments: [App.Comment.create({
          id: '2',
          body: 'herp',
          post: App.Post.create({id: '1'})
        })]
      }));
      post.comments.addObject(session.create(App.Comment, {body: 'derp'}));
      comment = post.comments[0];
      session.merge(App.Post.create({
        id: '1',
        title: 'herp',
        comments: [App.Comment.create({
          id: '2',
          body: 'derp?',
          post: App.Post.create({id: '1'})
        })]
      }));
      expect(post.comments.length).to.eq(2);
      return expect(comment.body).to.eq('derp?');
    });
    return it('will preserve local updates after multiple merges', function() {
      var post;
      post = session.merge(App.Post.create({
        id: '1',
        title: 'A'
      }));
      post.title = 'B';
      session.merge(App.Post.create({
        id: '1',
        title: 'C'
      }));
      expect(post.title).to.eq('B');
      session.merge(App.Post.create({
        id: '1',
        title: 'C'
      }));
      return expect(post.title).to.eq('B');
    });
  });
  return {};
});

define("coalesce-test/model/errors", ['coalesce/model/errors'], function($__0) {
  "use strict";
  var __moduleName = "coalesce-test/model/errors";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Errors = $__0.default;
  describe('Errors', function() {
    return describe('forEach', function() {
      it('should iterate over field errors', function() {
        var count,
            errors;
        errors = new Errors({title: ['is too short']});
        count = 0;
        errors.forEach(function(fieldErrors, key) {
          expect(key).to.eq('title');
          expect(fieldErrors).to.eql(['is too short']);
          return count++;
        });
        return expect(count).to.eq(1);
      });
      return it('should not error if no content specified', function() {
        var count,
            errors;
        errors = new Errors();
        count = 0;
        errors.forEach(function(key, errors) {
          return count++;
        });
        return expect(count).to.eq(0);
      });
    });
  });
  return {};
});

define("coalesce-test/model/has_many", ['coalesce/model/model', 'coalesce/collections/has_many_array', 'coalesce/container'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/model/has_many";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Model = $__0.default;
  var HasManyArray = $__2.default;
  var Container = $__4.default;
  describe('hasMany', function() {
    return it('accepts custom collectionType option', function() {
      var CustomArray = function CustomArray() {
        $traceurRuntime.defaultSuperCall(this, $CustomArray.prototype, arguments);
      };
      var $CustomArray = CustomArray;
      ($traceurRuntime.createClass)(CustomArray, {}, {}, HasManyArray);
      ;
      var User = function User() {
        $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
      };
      var $User = User;
      ($traceurRuntime.createClass)(User, {}, {}, Model);
      ;
      var user;
      User.defineSchema({relationships: {tags: {
            kind: 'hasMany',
            type: 'tag',
            collectionType: CustomArray
          }}});
      User.typeKey = 'user';
      var Tag = function Tag() {
        $traceurRuntime.defaultSuperCall(this, $Tag.prototype, arguments);
      };
      var $Tag = Tag;
      ($traceurRuntime.createClass)(Tag, {}, {}, Model);
      ;
      Tag.typeKey = 'tag';
      user = new User();
      return expect(user.tags).to.be.an.instanceOf(CustomArray);
    });
  });
  return {};
});

define("coalesce-test/model/model", ['coalesce/collections/model_set', 'coalesce/model/model', 'coalesce/container'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/model/model";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var ModelSet = $__0.default;
  var Model = $__2.default;
  var Container = $__4.default;
  var __hasProp = {}.hasOwnProperty,
      __extends = function(child, parent) {
        for (var key in parent) {
          if (__hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      };
  describe('Model', function() {
    var session;
    session = null;
    beforeEach(function() {
      var User = function User() {
        $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
      };
      var $User = User;
      ($traceurRuntime.createClass)(User, {}, {}, Model);
      ;
      User.defineSchema({attributes: {
          name: {type: 'string'},
          raw: {},
          createdAt: {type: 'date'}
        }});
      User.typeKey = 'user';
      this.User = User;
      this.container = new Container();
      this.container.register('model:user', User);
      session = this.container.lookup('session:main');
      return Coalesce.__container__ = this.container;
    });
    afterEach(function() {
      return delete Coalesce.__container__;
    });
    describe('.id', function() {
      return it('triggers metaWillChange and metaDidChange', function() {
        var didHit,
            user,
            willHit;
        user = new this.User();
        willHit = false;
        didHit = false;
        user.metaWillChange = function() {
          return willHit = true;
        };
        user.metaDidChange = function() {
          return didHit = true;
        };
        user.id = 1;
        expect(willHit).to.be["true"];
        return expect(didHit).to.be["true"];
      });
    });
    describe('.errors', function() {
      return it('triggers metaWillChange and metaDidChange', function() {
        var didHit,
            user,
            willHit;
        user = new this.User();
        willHit = false;
        didHit = false;
        user.metaWillChange = function() {
          return willHit = true;
        };
        user.metaDidChange = function() {
          return didHit = true;
        };
        user.errors = {name: 'invalid'};
        expect(willHit).to.be["true"];
        return expect(didHit).to.be["true"];
      });
    });
    describe('.isDirty', function() {
      it('returns false when detached', function() {
        return expect(new this.User().isDirty).to.be["false"];
      });
      it('returns true when dirty', function() {
        var user;
        user = null;
        Object.defineProperty(session, 'dirtyModels', {get: function() {
            return new ModelSet([user]);
          }});
        user = new this.User();
        user.session = session;
        return expect(user.isDirty).to.be["true"];
      });
      return it('returns false when untouched', function() {
        var user;
        Object.defineProperty(session, 'dirtyModels', {get: function() {
            return new ModelSet;
          }});
        user = new this.User();
        user.session = session;
        return expect(user.isDirty).to.be["false"];
      });
    });
    it('can use .find', function() {
      var User;
      User = this.User;
      session.find = function(type, id) {
        expect(type).to.eq(User);
        expect(id).to.eq(1);
        return Coalesce.Promise.resolve(new type({id: id.toString()}));
      };
      return this.User.find(1).then(function(user) {
        return expect(user.id).to.eq("1");
      });
    });
    describe('typeKey class var', function() {
      xit('works with global Ember', function() {
        var typeKey;
        App.SomeThing = (function(_super) {
          __extends(SomeThing, _super);
          function SomeThing() {
            return SomeThing.__super__.constructor.apply(this, arguments);
          }
          return SomeThing;
        })(Coalesce.Model);
        typeKey = App.SomeThing.typeKey;
        return expect(typeKey).to.eq('some_thing');
      });
      return xit('works with modular Ember', function() {
        var SomeThing,
            typeKey;
        SomeThing = (function(_super) {
          __extends(SomeThing, _super);
          function SomeThing() {
            return SomeThing.__super__.constructor.apply(this, arguments);
          }
          return SomeThing;
        })(Coalesce.Model);
        SomeThing._toString = "my-app@model:some-thing:";
        typeKey = Something.typeKey;
        return expect(typeKey).to.eq('some_thing');
      });
    });
    describe('.diff', function() {
      it('detects differences in complex object attributes', function() {
        var left,
            right;
        left = new this.User({raw: {test: 'a'}});
        right = new this.User({raw: {test: 'b'}});
        return expect(left.diff(right)).to.eql([{
          type: 'attr',
          name: 'raw'
        }]);
      });
      return it('detects no difference in complex object attributes', function() {
        var left,
            right;
        left = new this.User({raw: {test: 'a'}});
        right = new this.User({raw: {test: 'a'}});
        return expect(left.diff(right)).to.eql([]);
      });
    });
    describe('.copy', function() {
      it('copies dates', function() {
        var copy,
            date,
            user;
        date = new Date(2014, 7, 22);
        user = new this.User({createdAt: date});
        copy = user.copy();
        return expect(user.createdAt.getTime()).to.eq(copy.createdAt.getTime());
      });
      it('deep copies complex object attributes', function() {
        var copy,
            user;
        user = new this.User({raw: {test: {value: 'a'}}});
        copy = user.copy();
        expect(user).to.not.eq(copy);
        expect(user.raw).to.not.eq(copy.raw);
        expect(user.raw.test).to.not.eq(copy.raw.test);
        return expect(user.raw).to.eql(copy.raw);
      });
      return it('deep copies array attributes', function() {
        var copy,
            user;
        user = new this.User({raw: ['a', 'b', 'c']});
        copy = user.copy();
        expect(user).to.not.eq(copy);
        expect(user.raw).to.not.eq(copy.raw);
        return expect(user.raw).to.eql(copy.raw);
      });
    });
    return describe('subclassing', function() {
      beforeEach(function() {
        var User;
        User = this.User;
        var Admin = function Admin() {
          $traceurRuntime.defaultSuperCall(this, $Admin.prototype, arguments);
        };
        var $Admin = Admin;
        ($traceurRuntime.createClass)(Admin, {}, {}, User);
        ;
        Admin.defineSchema({attributes: {role: {type: 'string'}}});
        this.Admin = Admin;
        var Guest = function Guest() {
          $traceurRuntime.defaultSuperCall(this, $Guest.prototype, arguments);
        };
        var $Guest = Guest;
        ($traceurRuntime.createClass)(Guest, {}, {}, User);
        ;
        Guest.defineSchema({attributes: {anonymous: {type: 'boolean'}}});
        return this.Guest = Guest;
      });
      it('can add fields', function() {
        return expect(this.Admin.fields.get('role')).to.exist;
      });
      it('inherits fields from parent', function() {
        return expect(this.Admin.fields.get('name')).to.exist;
      });
      it('does not modify the parent fields', function() {
        return expect(this.User.fields.get('role')).to.not.exist;
      });
      return it('can share common parent class', function() {
        this.Admin.attributes;
        return expect(this.Guest.attributes.get('anonymous')).to.not.be.undefined;
      });
    });
  });
  return {};
});

define("coalesce-test/model/relationships", ['../support/schemas', 'coalesce/model/model', 'coalesce/container'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/model/relationships";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var $__1 = $__0,
      userWithPost = $__1.userWithPost,
      groupWithMembersWithUsers = $__1.groupWithMembersWithUsers;
  var Model = $__2.default;
  var Container = $__4.default;
  describe("relationships", function() {
    beforeEach(function() {
      this.App = {};
      this.container = new Container();
      Coalesce.__container__ = this.container;
      this.adapter = this.container.lookup('adapter:main');
      return this.session = this.adapter.newSession();
    });
    context('one->many', function() {
      beforeEach(function() {
        var User = function User() {
          $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
        };
        var $User = User;
        ($traceurRuntime.createClass)(User, {}, {}, Model);
        ;
        User.defineSchema({
          typeKey: 'user',
          attributes: {name: {type: 'string'}}
        });
        this.App.User = this.User = User;
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {title: {type: 'string'}},
          relationships: {
            user: {
              kind: 'belongsTo',
              type: 'user'
            },
            comments: {
              kind: 'hasMany',
              type: 'comment'
            }
          }
        });
        this.App.Post = this.Post = Post;
        var Comment = function Comment() {
          $traceurRuntime.defaultSuperCall(this, $Comment.prototype, arguments);
        };
        var $Comment = Comment;
        ($traceurRuntime.createClass)(Comment, {}, {}, Model);
        ;
        Comment.defineSchema({
          typeKey: 'comment',
          attributes: {text: {type: 'string'}},
          relationships: {post: {
              kind: 'belongsTo',
              type: 'post'
            }}
        });
        this.App.Comment = this.Comment = Comment;
        this.container.register('model:post', Post);
        this.container.register('model:comment', Comment);
        return this.container.register('model:user', User);
      });
      it('belongsTo updates inverse', function() {
        var comment,
            post;
        post = this.session.create('post');
        comment = this.session.create('comment');
        comment.post = post;
        expect(post.comments.toArray()).to.eql([comment]);
        comment.post = null;
        return expect(post.comments.toArray()).to.eql([]);
      });
      it('belongsTo updates inverse on delete', function() {
        var comment,
            post;
        post = this.session.create('post');
        comment = this.session.create('comment');
        comment.post = post;
        expect(post.comments.toArray()).to.eql([comment]);
        this.session.deleteModel(comment);
        return expect(post.comments.toArray()).to.eql([]);
      });
      it('belongsTo updates inverse on delete when initially added unloaded', function() {
        var comment,
            post,
            unloadedComment;
        post = this.session.merge(this.session.build('post', {
          id: 1,
          comments: [this.Comment.create({id: 2})]
        }));
        unloadedComment = post.comments[0];
        comment = this.session.merge(this.session.build('comment', {
          id: 2,
          post: this.Post.create({id: 1})
        }));
        unloadedComment.post = post;
        expect(post.comments.toArray()).to.eql([unloadedComment]);
        this.session.deleteModel(unloadedComment);
        return expect(post.comments.toArray()).to.eql([]);
      });
      it('belongsTo updates inverse when set during create', function() {
        var comment,
            post;
        comment = this.session.create('comment', {post: this.session.create('post')});
        post = comment.post;
        expect(post.comments.toArray()).to.eql([comment]);
        comment.post = null;
        return expect(post.comments.toArray()).to.eql([]);
      });
      it('belongsTo adds object to session', function() {
        var comment,
            post;
        post = this.session.merge(this.Post.create({id: '1'}));
        comment = this.session.merge(this.Comment.create({id: '2'}));
        comment.post = this.Post.create({id: '1'});
        return expect(comment.post).to.eq(post);
      });
      it('hasMany updates inverse', function() {
        var comment,
            post;
        post = this.session.create('post');
        comment = this.session.create('comment');
        post.comments.addObject(comment);
        expect(comment.post).to.eq(post);
        post.comments.removeObject(comment);
        return expect(comment.post).to.be["null"];
      });
      it('hasMany updates inverse on delete', function() {
        var comment,
            post;
        post = this.session.create('post');
        comment = this.session.create('comment');
        post.comments.addObject(comment);
        expect(comment.post).to.eq(post);
        this.session.deleteModel(post);
        return expect(comment.post).to.be["null"];
      });
      it('hasMany updates inverse on create', function() {
        var comment,
            post;
        post = this.session.create('post', {comments: []});
        comment = this.session.create('comment');
        post.comments.addObject(comment);
        expect(comment.post).to.eq(post);
        this.session.deleteModel(post);
        return expect(comment.post).to.be["null"];
      });
      it('hasMany adds to session', function() {
        var comment,
            post;
        post = this.session.merge(this.Post.create({
          id: '1',
          comments: []
        }));
        comment = this.session.merge(this.Comment.create({
          id: '2',
          post: null
        }));
        post.comments.addObject(this.Comment.create({id: '2'}));
        return expect(post.comments[0]).to.eq(comment);
      });
      return it('hasMany content can be set directly', function() {
        var post;
        post = this.session.create('post', {comments: [this.Comment.create({id: '2'})]});
        expect(post.comments.length).to.eq(1);
        return expect(post.comments[0].id).to.eq('2');
      });
    });
    context('one->one', function() {
      beforeEach(function() {
        return userWithPost.apply(this);
      });
      it('updates inverse', function() {
        var post,
            user;
        post = this.session.create('post');
        user = this.session.create('user');
        post.user = user;
        expect(user.post).to.eq(post);
        post.user = null;
        return expect(user.post).to.be["null"];
      });
      return it('updates inverse on delete', function() {
        var post,
            user;
        post = this.session.create('post');
        user = this.session.create('user');
        post.user = user;
        expect(user.post).to.eq(post);
        this.session.deleteModel(post);
        return expect(user.post).to.be["null"];
      });
    });
    return context('multiple one->many', function() {
      beforeEach(function() {
        return groupWithMembersWithUsers.apply(this);
      });
      return it('updates inverse on delete', function() {
        var group,
            member,
            user;
        group = this.session.create('group');
        user = this.session.create('user');
        member = this.session.create('member', {
          group: group,
          user: user
        });
        expect(member.user).to.eq(user);
        expect(member.group).to.eq(group);
        expect(user.members.toArray()).to.eql([member]);
        expect(group.members.toArray()).to.eql([member]);
        this.session.deleteModel(member);
        expect(user.members.toArray()).to.eql([]);
        return expect(group.members.toArray()).to.eql([]);
      });
    });
  });
  return {};
});

define("coalesce-test/rest/_shared", ['./_test_adapter', 'coalesce/container'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/_shared";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var TestRestAdapter = $__0.default;
  var Container = $__2.default;
  var setup;
  setup = function() {
    this.App = {};
    this.container = new Container();
    this.RestAdapter = TestRestAdapter.extend();
    this.container.register('adapter:main', this.RestAdapter);
    this.adapter = this.container.lookup('adapter:main');
    this.session = this.adapter.newSession();
    this.container = this.adapter.container;
    return Coalesce.__container__ = this.container;
  };
  var $__default = setup;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce-test/rest/_test_adapter", ['coalesce/rest/rest_adapter', 'coalesce'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/_test_adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var RestAdapter = $__0.default;
  var Coalesce = $__2.default;
  var TestRestAdapter = function TestRestAdapter() {
    $traceurRuntime.superCall(this, $TestRestAdapter.prototype, "constructor", []);
    this.h = [];
    this.r = {};
  };
  var $TestRestAdapter = TestRestAdapter;
  ($traceurRuntime.createClass)(TestRestAdapter, {
    ajax: function(url, type, hash) {
      var adapter = this;
      return new Coalesce.Promise(function(resolve, reject) {
        adapter.runLater(function() {
          var key = type + ":" + url;
          adapter.h.push(key);
          var json = adapter.r[key];
          if (hash && typeof hash.data === 'string') {
            hash.data = JSON.parse(hash.data);
          }
          if (!json) {
            throw "No data for #{key}";
          }
          if (typeof json === 'function') {
            try {
              json = json(url, type, hash);
            } catch (e) {
              reject(e);
            }
          }
          resolve(json);
        }, 0);
      });
    },
    runLater: function(callback) {
      Coalesce.run.later(callback, 0);
    }
  }, {}, RestAdapter);
  var $__default = TestRestAdapter;
  return {
    get default() {
      return $__default;
    },
    __esModule: true
  };
});

define("coalesce-test/rest/embedded_manager", ['./_shared', '../support/schemas'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/embedded_manager";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var postWithEmbeddedComments = $__2.postWithEmbeddedComments;
  describe('EmbeddedManager', function() {
    var adapter,
        manager,
        session;
    adapter = null;
    session = null;
    manager = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      session = this.session;
      postWithEmbeddedComments.apply(this);
      return manager = adapter._embeddedManager;
    });
    return it('can determine if a record is embedded', function() {
      this.post = this.Post.create({id: 1});
      this.comment = this.Comment.create({id: 2});
      expect(manager.isEmbedded(this.post)).to.be["false"];
      return expect(manager.isEmbedded(this.comment)).to.be["true"];
    });
  });
  return {};
});

define("coalesce-test/rest/rest.acceptance", ['./_shared', '../support/schemas', 'coalesce/model/model', 'coalesce/serializers/model', 'coalesce'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.acceptance";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var setup = $__0.default;
  var $__3 = $__2,
      postWithComments = $__3.postWithComments,
      groupWithMembersWithUsers = $__3.groupWithMembersWithUsers;
  var Model = $__4.default;
  var ModelSerializer = $__6.default;
  var Coalesce = $__8.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      session = this.session;
      return Coalesce.__container__ = this.container;
    });
    afterEach(function() {
      return delete Coalesce.__container__;
    });
    describe("managing groups with embedded members", function() {
      beforeEach(function() {
        var GroupSerializer;
        groupWithMembersWithUsers.apply(this);
        GroupSerializer = ModelSerializer.extend({properties: {members: {embedded: 'always'}}});
        return this.container.register('serializer:group', GroupSerializer);
      });
      it('creates new group and then deletes a member', function() {
        var childSession,
            group,
            member,
            user;
        adapter.r['POST:/users'] = function() {
          return {users: {
              client_id: user.clientId,
              id: 1,
              name: "wes"
            }};
        };
        adapter.r['POST:/groups'] = function(url, type, hash) {
          expect(hash.data.group.members[0].role).to.eq('chief');
          return {groups: {
              client_id: group.clientId,
              id: 2,
              name: "brogrammers",
              members: [{
                client_id: member.clientId,
                id: 3,
                role: "chief",
                group: 2,
                user: 1
              }],
              user: 1
            }};
        };
        childSession = session.newSession();
        user = childSession.create('user', {name: 'wes'});
        group = null;
        member = null;
        return childSession.flushIntoParent().then(function() {
          expect(user.id).to.not.be["null"];
          expect(adapter.h).to.eql(['POST:/users']);
          childSession = session.newSession();
          user = childSession.add(user);
          group = childSession.create('group', {
            name: 'brogrammers',
            user: user
          });
          member = childSession.create('member', {
            role: 'chief',
            user: user,
            group: group
          });
          return childSession.flushIntoParent().then(function() {
            expect(adapter.h).to.eql(['POST:/users', 'POST:/groups']);
            expect(user.id).to.not.be["null"];
            expect(group.id).to.not.be["null"];
            expect(group.members.length).to.eq(1);
            expect(user.groups.length).to.eq(1);
            expect(user.members.length).to.eq(1);
            expect(member.id).to.not.be["null"];
            childSession = session.newSession();
            member = childSession.add(member);
            user = childSession.add(user);
            group = childSession.add(group);
            childSession.deleteModel(member);
            expect(user.members.length).to.eq(0);
            expect(group.members.length).to.eq(0);
            expect(user.groups.length).to.eq(1);
            adapter.r['PUT:/groups/2'] = function() {
              return {groups: {
                  client_id: group.clientId,
                  id: 2,
                  name: "brogrammers",
                  members: [],
                  user: 1
                }};
            };
            return childSession.flushIntoParent().then(function() {
              expect(member.isDeleted).to.be["true"];
              expect(group.members.length).to.eq(0);
              expect(user.members.length).to.eq(0);
              expect(user.groups.length).to.eq(1);
              return expect(adapter.h).to.eql(['POST:/users', 'POST:/groups', 'PUT:/groups/2']);
            });
          });
        });
      });
      it("doesn't choke when loading a group without a members key", function() {
        adapter.r['GET:/groups'] = {groups: [{
            client_id: null,
            id: "1",
            name: "brogrammers",
            user: "1"
          }]};
        return session.query("group").then(function(result) {
          expect(adapter.h).to.eql(['GET:/groups']);
          expect(result.length).to.eq(1);
          expect(result[0].name).to.eq("brogrammers");
          return expect(result[0].groups).to.be.undefined;
        });
      });
      return it('adds a member to an existing group', function() {
        adapter.r['GET:/groups/1'] = function() {
          return {
            groups: {
              id: 1,
              name: "employees",
              members: [{
                id: 2,
                name: "kinz",
                group: 1,
                user: 3
              }]
            },
            users: {
              id: 3,
              name: "wtf",
              members: [2],
              groups: [1]
            }
          };
        };
        return session.load("group", 1).then(function(group) {
          var childGroup,
              childSession,
              existingMember,
              member,
              promise;
          expect(adapter.h).to.eql(['GET:/groups/1']);
          childSession = session.newSession();
          childGroup = childSession.add(group);
          existingMember = childGroup.members[0];
          expect(existingMember.user).to.not.be["null"];
          expect(existingMember.user.isDetached).to.be["false"];
          member = childSession.create('member', {name: "mollie"});
          childGroup.members.addObject(member);
          expect(childGroup.members.length).to.eq(2);
          expect(group.members.length).to.eq(1);
          adapter.r['PUT:/groups/1'] = function() {
            return {groups: {
                id: 1,
                name: "employees",
                members: [{
                  id: 2,
                  name: "kinz",
                  group: 1
                }, {
                  id: 3,
                  client_id: member.clientId,
                  name: "mollie",
                  group: 1
                }]
              }};
          };
          promise = childSession.flushIntoParent().then(function() {
            expect(childGroup.members.length).to.eq(2);
            expect(group.members.length).to.eq(2);
            return expect(adapter.h).to.eql(['GET:/groups/1', 'PUT:/groups/1']);
          });
          expect(group.members.length).to.eq(2);
          return promise;
        });
      });
    });
    describe("managing comments", function() {
      beforeEach(function() {
        return postWithComments.apply(this);
      });
      return it('creates a new comment within a child session', function() {
        var childPost,
            childSession,
            comment,
            post,
            promise;
        adapter.r['POST:/comments'] = function() {
          return {comment: {
              client_id: comment.clientId,
              id: "3",
              message: "#2",
              post: "1"
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: "brogrammer's guide to beer pong",
          comments: []
        }));
        session.merge(this.Comment.create({
          id: "2",
          message: "yo",
          post: post
        }));
        childSession = session.newSession();
        childPost = childSession.add(post);
        comment = childSession.create('comment', {
          message: '#2',
          post: childPost
        });
        expect(childPost.comments.length).to.eq(2);
        promise = childSession.flushIntoParent().then(function() {
          expect(childPost.comments.length).to.eq(2);
          return expect(post.comments.length).to.eq(2);
        });
        expect(childPost.comments.length).to.eq(2);
        expect(post.comments.length).to.eq(2);
        return promise;
      });
    });
    describe("two levels of embedded", function() {
      beforeEach(function() {
        var User = function User() {
          $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
        };
        var $User = User;
        ($traceurRuntime.createClass)(User, {}, {}, Model);
        ;
        var ProfileSerializer,
            UserSerializer;
        User.defineSchema({
          typeKey: 'user',
          attributes: {name: {type: 'string'}},
          relationships: {profile: {
              kind: 'belongsTo',
              type: 'profile'
            }}
        });
        this.App.User = this.User = User;
        var Profile = function Profile() {
          $traceurRuntime.defaultSuperCall(this, $Profile.prototype, arguments);
        };
        var $Profile = Profile;
        ($traceurRuntime.createClass)(Profile, {}, {}, Model);
        ;
        Profile.defineSchema({
          typeKey: 'profile',
          attributes: {bio: {type: 'string'}},
          relationships: {
            user: {
              kind: 'belongsTo',
              type: 'user'
            },
            tags: {
              kind: 'hasMany',
              type: 'tag'
            }
          }
        });
        this.App.Profile = this.Profile = Profile;
        var Tag = function Tag() {
          $traceurRuntime.defaultSuperCall(this, $Tag.prototype, arguments);
        };
        var $Tag = Tag;
        ($traceurRuntime.createClass)(Tag, {}, {}, Model);
        ;
        Tag.defineSchema({
          typeKey: 'tag',
          attributes: {name: {type: 'string'}},
          relationships: {profile: {
              kind: 'belongsTo',
              type: 'profile'
            }}
        });
        this.App.Tag = this.Tag = Tag;
        this.container.register('model:user', this.User);
        this.container.register('model:profile', this.Profile);
        this.container.register('model:tag', this.Tag);
        UserSerializer = ModelSerializer.extend({properties: {profile: {embedded: 'always'}}});
        this.container.register('serializer:user', UserSerializer);
        ProfileSerializer = ModelSerializer.extend({properties: {tags: {embedded: 'always'}}});
        return this.container.register('serializer:profile', ProfileSerializer);
      });
      return it('deletes root', function() {
        var user;
        adapter.r['DELETE:/users/1'] = {};
        this.User.create({id: '1'});
        user = session.merge(this.User.create({
          id: '1',
          name: 'abby',
          profile: this.Profile.create({
            id: '2',
            bio: 'asd',
            tags: [this.Tag.create({
              id: '3',
              name: 'java'
            })]
          })
        }));
        session.deleteModel(user);
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['DELETE:/users/1']);
          return expect(user.isDeleted).to.be["true"];
        });
      });
    });
    describe('multiple belongsTo', function() {
      beforeEach(function() {
        var Foo = function Foo() {
          $traceurRuntime.defaultSuperCall(this, $Foo.prototype, arguments);
        };
        var $Foo = Foo;
        ($traceurRuntime.createClass)(Foo, {}, {}, Model);
        ;
        Foo.defineSchema({
          typeKey: 'foo',
          relationships: {
            bar: {
              kind: 'belongsTo',
              type: 'bar'
            },
            baz: {
              kind: 'belongsTo',
              type: 'baz'
            }
          }
        });
        this.App.Foo = this.Foo = Foo;
        var Bar = function Bar() {
          $traceurRuntime.defaultSuperCall(this, $Bar.prototype, arguments);
        };
        var $Bar = Bar;
        ($traceurRuntime.createClass)(Bar, {}, {}, Model);
        ;
        Bar.defineSchema({
          typeKey: 'bar',
          relationships: {foos: {
              kind: 'hasMany',
              type: 'foo'
            }}
        });
        this.App.Bar = this.Bar = Bar;
        var Baz = function Baz() {
          $traceurRuntime.defaultSuperCall(this, $Baz.prototype, arguments);
        };
        var $Baz = Baz;
        ($traceurRuntime.createClass)(Baz, {}, {}, Model);
        ;
        Baz.defineSchema({
          typeKey: 'baz',
          relationships: {foos: {
              kind: 'hasMany',
              type: 'foo'
            }}
        });
        this.App.Baz = this.Baz = Baz;
        this.container.register('model:foo', this.Foo);
        this.container.register('model:bar', this.Bar);
        return this.container.register('model:baz', this.Baz);
      });
      return it('sets ids properly', function() {
        var bar,
            baz,
            childSession,
            foo;
        adapter.r['POST:/bars'] = function() {
          return {bar: {
              client_id: bar.clientId,
              id: "1"
            }};
        };
        adapter.r['POST:/bazs'] = function() {
          return {baz: {
              client_id: baz.clientId,
              id: "1"
            }};
        };
        adapter.r['POST:/foos'] = function(url, type, hash) {
          expect(hash.data.foo.bar).to.eq(1);
          expect(hash.data.foo.baz).to.eq(1);
          return {foo: {
              client_id: foo.clientId,
              id: "1",
              bar: "1",
              baz: "1"
            }};
        };
        childSession = session.newSession();
        foo = childSession.create('foo');
        bar = childSession.create('bar');
        baz = childSession.create('baz');
        foo.bar = bar;
        foo.baz = baz;
        return childSession.flushIntoParent().then(function() {
          expect(adapter.h.length).to.eq(3);
          expect(adapter.h[adapter.h.length - 1]).to.eq('POST:/foos');
          expect(adapter.h).to.include('POST:/bars');
          expect(adapter.h).to.include('POST:/bazs');
          expect(foo.id).to.not.be["null"];
          expect(bar.id).to.not.be["null"];
          expect(baz.id).to.not.be["null"];
          expect(foo.bar).to.not.be["null"];
          expect(foo.baz).to.not.be["null"];
          expect(bar.foos.length).to.eq(1);
          return expect(baz.foos.length).to.eq(1);
        });
      });
    });
    describe('deep embedded relationship with leaf referencing a model without an inverse', function() {
      beforeEach(function() {
        var Template = function Template() {
          $traceurRuntime.defaultSuperCall(this, $Template.prototype, arguments);
        };
        var $Template = Template;
        ($traceurRuntime.createClass)(Template, {}, {}, Model);
        ;
        var CampaignSerializer,
            CampaignStepSerializer;
        Template.defineSchema({
          typeKey: 'template',
          attributes: {subject: {type: 'string'}}
        });
        this.App.Template = this.Template = Template;
        var Campaign = function Campaign() {
          $traceurRuntime.defaultSuperCall(this, $Campaign.prototype, arguments);
        };
        var $Campaign = Campaign;
        ($traceurRuntime.createClass)(Campaign, {}, {}, Model);
        ;
        Campaign.defineSchema({
          typeKey: 'campaign',
          attributes: {name: {type: 'string'}},
          relationships: {campaignSteps: {
              kind: 'hasMany',
              type: 'campaign_step'
            }}
        });
        this.App.Campaign = this.Campaign = Campaign;
        var CampaignStep = function CampaignStep() {
          $traceurRuntime.defaultSuperCall(this, $CampaignStep.prototype, arguments);
        };
        var $CampaignStep = CampaignStep;
        ($traceurRuntime.createClass)(CampaignStep, {}, {}, Model);
        ;
        CampaignStep.defineSchema({
          typeKey: 'campaign_step',
          relationships: {
            campaign: {
              kind: 'belongsTo',
              type: 'campaign'
            },
            campaignTemplates: {
              kind: 'hasMany',
              type: 'campaign_template'
            }
          }
        });
        this.App.CampaignStep = this.CampaignStep = CampaignStep;
        var CampaignTemplate = function CampaignTemplate() {
          $traceurRuntime.defaultSuperCall(this, $CampaignTemplate.prototype, arguments);
        };
        var $CampaignTemplate = CampaignTemplate;
        ($traceurRuntime.createClass)(CampaignTemplate, {}, {}, Model);
        ;
        CampaignTemplate.defineSchema({
          typeKey: 'campaign_template',
          relationships: {
            campaignStep: {
              kind: 'belongsTo',
              type: 'campaign_step'
            },
            template: {
              kind: 'belongsTo',
              type: 'template'
            }
          }
        });
        this.App.CampaignTemplate = this.CampaignTemplate = CampaignTemplate;
        this.container.register('model:template', this.Template);
        this.container.register('model:campaign', this.Campaign);
        this.container.register('model:campaign_template', this.CampaignTemplate);
        this.container.register('model:campaign_step', this.CampaignStep);
        CampaignSerializer = ModelSerializer.extend({properties: {campaignSteps: {embedded: 'always'}}});
        CampaignStepSerializer = ModelSerializer.extend({properties: {campaignTemplates: {embedded: 'always'}}});
        this.container.register('serializer:campaign', CampaignSerializer);
        return this.container.register('serializer:campaign_step', CampaignStepSerializer);
      });
      it('creates new embedded children with reference to new hasMany', function() {
        var calls,
            campaign,
            campaignStep,
            campaignStep2,
            campaignTemplate,
            campaignTemplate2,
            template,
            template2;
        adapter.r['POST:/templates'] = function(url, type, hash) {
          if (hash.data.template.client_id === template.clientId) {
            return {templates: {
                client_id: template.clientId,
                id: 2,
                subject: 'topological sort'
              }};
          } else {
            return {templates: {
                client_id: template2.clientId,
                id: 5,
                subject: 'do you speak it?'
              }};
          }
        };
        adapter.r['PUT:/campaigns/1'] = function(url, type, hash) {
          expect(hash.data.campaign.campaign_steps[0].campaign_templates[0].template).to.eq(2);
          expect(hash.data.campaign.campaign_steps[1].campaign_templates[0].template).to.eq(5);
          return {campaigns: {
              id: 1,
              client_id: campaign.clientId,
              campaign_steps: [{
                client_id: campaignStep.clientId,
                id: 3,
                campaign_templates: [{
                  id: 4,
                  client_id: campaignTemplate.clientId,
                  template: 2,
                  campaign_step: 3
                }]
              }, {
                client_id: campaignStep2.clientId,
                id: 6,
                campaign_templates: [{
                  id: 7,
                  client_id: campaignTemplate2.clientId,
                  template: 5,
                  campaign_step: 6
                }]
              }]
            }};
        };
        calls = 0;
        adapter.runLater = function(callback) {
          calls++;
          return Coalesce.run.later(callback, calls * 100);
        };
        campaign = session.merge(this.session.build('campaign', {
          id: 1,
          campaignSteps: []
        }));
        session = session.newSession();
        campaign = session.add(campaign);
        campaignStep = session.create('campaign_step', {campaign: campaign});
        campaignTemplate = session.create('campaign_template');
        campaignStep.campaignTemplates.pushObject(campaignTemplate);
        template = session.create('template');
        template.subject = 'topological sort';
        campaignTemplate.template = template;
        campaignStep2 = session.create('campaign_step', {campaign: campaign});
        campaignTemplate2 = session.create('campaign_template');
        campaignStep2.campaignTemplates.pushObject(campaignTemplate2);
        template2 = session.create('template');
        template2.subject = 'do you speak it?';
        campaignTemplate2.template = template2;
        return session.flush().then(function() {
          expect(template.id).to.eq("2");
          expect(template.isNew).to.be["false"];
          expect(template.subject).to.eq('topological sort');
          expect(campaignTemplate.id).to.not.be["null"];
          expect(campaignTemplate.template).to.eq(template);
          expect(campaignTemplate.campaignStep).to.eq(campaignStep);
          expect(template2.id).to.eq("5");
          expect(template2.isNew).to.be["false"];
          expect(template2.subject).to.eq('do you speak it?');
          expect(campaignTemplate2.id).to.not.be["null"];
          expect(campaignTemplate2.template).to.eq(template2);
          expect(campaignTemplate2.campaignStep).to.eq(campaignStep2);
          return expect(adapter.h).to.eql(['POST:/templates', 'POST:/templates', 'PUT:/campaigns/1']);
        });
      });
      return it('save changes to parent when children not loaded in child session', function() {
        var campaign,
            step,
            step2;
        adapter.r['PUT:/campaigns/1'] = function(url, type, hash) {
          return hash.data;
        };
        campaign = session.merge(this.session.build('campaign', {
          name: 'old name',
          id: 1,
          campaignSteps: []
        }));
        step = session.merge(this.session.build('campaign_step', {
          id: 2,
          campaign: campaign,
          campaignTemplates: []
        }));
        step2 = session.merge(this.session.build('campaign_step', {
          id: 4,
          campaign: campaign,
          campaignTemplates: []
        }));
        session.merge(this.session.build('campaign_template', {
          id: 3,
          campaignStep: step
        }));
        expect(campaign.campaignSteps[0]).to.eq(step);
        session = session.newSession();
        campaign = session.add(campaign);
        campaign.name = 'new name';
        return session.flush().then(function() {
          expect(campaign.name).to.eq('new name');
          return expect(adapter.h).to.eql(['PUT:/campaigns/1']);
        });
      });
    });
    return describe('belongsTo without inverse', function() {
      beforeEach(function() {
        var Contact = function Contact() {
          $traceurRuntime.defaultSuperCall(this, $Contact.prototype, arguments);
        };
        var $Contact = Contact;
        ($traceurRuntime.createClass)(Contact, {}, {}, Model);
        ;
        Contact.defineSchema({
          typeKey: 'contact',
          attributes: {name: {type: 'string'}},
          relationships: {account: {
              kind: 'belongsTo',
              type: 'account'
            }}
        });
        this.App.Contact = this.Contact = Contact;
        var Account = function Account() {
          $traceurRuntime.defaultSuperCall(this, $Account.prototype, arguments);
        };
        var $Account = Account;
        ($traceurRuntime.createClass)(Account, {}, {}, Model);
        ;
        Account.defineSchema({
          typeKey: 'account',
          attributes: {name: {type: 'string'}}
        });
        this.App.Account = this.Account = Account;
        this.container.register('model:contact', this.Contact);
        this.container.register('model:account', this.Account);
        return session = session.newSession();
      });
      return it('creates hierarchy', function() {
        var contact;
        adapter.r['POST:/contacts'] = function() {
          return {contact: {
              id: 1,
              client_id: contact.clientId,
              name: "test contact",
              account: 2
            }};
        };
        adapter.r['POST:/accounts'] = function() {
          return {account: {
              id: 2,
              client_id: contact.account.clientId,
              name: "test account"
            }};
        };
        contact = session.create('contact', {name: 'test contact'});
        contact.account = session.create('account', {name: 'test account'});
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['POST:/accounts', 'POST:/contacts']);
          return expect(contact.account.id).to.eq("2");
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.concurrent", ['./_shared', 'coalesce'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.concurrent";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var Coalesce = $__2.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('concurrent updates with simple model', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Coalesce.Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {type: 'string'},
            submitted: {type: 'boolean'}
          }
        });
        this.App.Post = this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      it('all flushes resolve', function() {
        var f1,
            f2,
            post;
        adapter.r['PUT:/posts/1'] = function(url, type, hash) {
          return {posts: {
              id: 1,
              title: hash.data.post.title,
              submitted: "true"
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'twerkin',
          submitted: false
        }));
        post.title = 'update1';
        f1 = session.flush();
        post.title = 'update2';
        f2 = session.flush();
        return Coalesce.Promise.all([f1, f2]).then(function() {
          expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
          return expect(post.title).to.eq('update2');
        });
      });
      it('second flush waits for first to complete', function() {
        var calls,
            f1,
            f2,
            post;
        calls = 0;
        adapter.runLater = function(callback) {
          var delay;
          delay = calls > 0 ? 0 : 10;
          calls++;
          return Coalesce.run.later(callback, delay);
        };
        adapter.r['PUT:/posts/1'] = function(url, type, hash) {
          return {posts: {
              id: 1,
              title: hash.data.post.title,
              submitted: "true"
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'twerkin',
          submitted: false
        }));
        post.title = 'update1';
        f1 = session.flush();
        post.title = 'update2';
        f2 = session.flush();
        return Coalesce.Promise.all([f1, f2]).then(function() {
          expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
          return expect(post.title).to.eq('update2');
        });
      });
      it('three concurrent flushes', function() {
        var calls,
            f1,
            f2,
            f3,
            post;
        calls = 0;
        adapter.runLater = function(callback) {
          var delay;
          delay = calls % 2 === 1 ? 0 : 10;
          calls++;
          return Coalesce.run.later(callback, delay);
        };
        adapter.r['PUT:/posts/1'] = function(url, type, hash) {
          return {posts: {
              id: 1,
              title: hash.data.post.title,
              submitted: "true"
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'twerkin',
          submitted: false
        }));
        post.title = 'update1';
        f1 = session.flush();
        post.title = 'update2';
        f2 = session.flush();
        post.title = 'update3';
        f3 = session.flush();
        return Coalesce.Promise.all([f1, f2, f3]).then(function() {
          expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1', 'PUT:/posts/1']);
          return expect(post.title).to.eq('update3');
        });
      });
      it('cascades failures', function() {
        var calls,
            f1,
            f2,
            f3,
            post;
        calls = 0;
        adapter.runLater = function(callback) {
          var delay;
          delay = calls % 2 === 1 ? 0 : 10;
          calls++;
          return Coalesce.run.later(callback, delay);
        };
        adapter.r['PUT:/posts/1'] = function(url, type, hash) {
          var rev;
          if (hash.data.post.title === 'update1') {
            throw "twerkin too hard";
          }
          rev = parseInt(hash.data.post.title.split("update")[1]) + 1;
          return {posts: {
              id: 1,
              title: hash.data.post.title,
              submitted: "true",
              rev: rev
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'twerkin',
          submitted: false,
          rev: 1
        }));
        post.title = 'update1';
        f1 = session.flush();
        post.title = 'update2';
        f2 = session.flush();
        post.title = 'update3';
        f3 = session.flush();
        return f3.then(null, function() {
          var shadow;
          expect(adapter.h).to.eql(['PUT:/posts/1']);
          expect(post.title).to.eq('update3');
          shadow = session.getShadow(post);
          return expect(shadow.title).to.eq('twerkin');
        });
      });
      return it('can retry after failure', function() {
        var count,
            post;
        count = 0;
        adapter.r['PUT:/posts/1'] = function(url, type, hash) {
          if (count++ === 0) {
            throw "plz twerk again";
          }
          return {posts: {
              id: 1,
              title: hash.data.post.title,
              submitted: "true"
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'twerkin',
          submitted: false
        }));
        post.title = 'update1';
        return session.flush().then(null, function() {
          var shadow;
          expect(post.title).to.eq('update1');
          shadow = session.getShadow(post);
          expect(shadow.title).to.eq('twerkin');
          return session.flush().then(function() {
            expect(post.title).to.eq('update1');
            shadow = session.getShadow(post);
            return expect(shadow.title).to.eq('update1');
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.errors", ['./_shared', 'coalesce/model/model', 'coalesce/model/errors'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.errors";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var setup = $__0.default;
  var Model = $__2.default;
  var Errors = $__4.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('simple model with errors', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {type: 'string'},
            category: {type: 'string'},
            createdAt: {type: 'date'}
          }
        });
        this.App.Post = this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      context('on update', function() {
        it('handles validation errors', function() {
          adapter.r['PUT:/posts/1'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({errors: {
                  title: 'is too short',
                  created_at: 'cannot be in the past'
                }})
            };
          };
          session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return session.load('post', 1).then(function(post) {
            expect(post.title).to.eq('test');
            post.title = '';
            return session.flush().then(null, function() {
              expect(post.hasErrors).to.be["true"];
              expect(post.title).to.eq('');
              expect(post.errors.title).to.eq('is too short');
              expect(post.errors.createdAt).to.eq('cannot be in the past');
              return expect(adapter.h).to.eql(['PUT:/posts/1']);
            });
          });
        });
        it('overwrites existing errors when error-only payload returned', function() {
          var post;
          adapter.r['PUT:/posts/1'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({errors: {title: 'is too short'}})
            };
          };
          post = session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          post.title = '';
          post.errors = new Errors({title: 'is not good'});
          expect(post.errors.title).to.eq('is not good');
          return session.flush().then(null, function() {
            expect(post.hasErrors).to.be["true"];
            expect(post.title).to.eq('');
            expect(post.errors.title).to.eq('is too short');
            return expect(adapter.h).to.eql(['PUT:/posts/1']);
          });
        });
        it('handles payload with error properties', function() {
          adapter.r['PUT:/posts/1'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({post: {
                  id: 1,
                  title: 'test',
                  errors: {title: 'is too short'}
                }})
            };
          };
          session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return session.load('post', 1).then(function(post) {
            expect(post.title).to.eq('test');
            post.title = '';
            return session.flush().then(null, function() {
              expect(post.hasErrors).to.be["true"];
              expect(post.title).to.eq('');
              expect(post.errors.title).to.eq('is too short');
              return expect(adapter.h).to.eql(['PUT:/posts/1']);
            });
          });
        });
        it('merges payload with error properties and higher rev', function() {
          adapter.r['PUT:/posts/1'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({post: {
                  id: 1,
                  title: '',
                  category: 'new',
                  rev: 10,
                  errors: {title: 'is too short'}
                }})
            };
          };
          session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return session.load('post', 1).then(function(post) {
            expect(post.title).to.eq('test');
            post.title = '';
            return session.flush().then(null, function() {
              expect(post.hasErrors).to.be["true"];
              expect(post.title).to.eq('');
              expect(post.category).to.eq('new');
              expect(post.errors.title).to.eq('is too short');
              return expect(adapter.h).to.eql(['PUT:/posts/1']);
            });
          });
        });
        it('merges payload with error and latest client changes against latest client version', function() {
          adapter.r['PUT:/posts/1'] = function(url, type, hash) {
            throw {
              status: 422,
              responseText: JSON.stringify({post: {
                  id: 1,
                  title: 'Something',
                  client_rev: hash.data.post.client_rev,
                  errors: {title: 'cannot be empty'}
                }})
            };
          };
          session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return session.load('post', 1).then(function(post) {
            expect(post.title).to.eq('test');
            post.title = '';
            return session.flush().then(null, function() {
              expect(post.hasErrors).to.be["true"];
              expect(post.title).to.eq('Something');
              return expect(adapter.h).to.eql(['PUT:/posts/1']);
            });
          });
        });
        return it('empty errors object should deserialize without errors', function() {
          adapter.r['PUT:/posts/1'] = function() {
            return {post: {
                id: 1,
                title: '',
                errors: {}
              }};
          };
          session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return session.load('post', 1).then(function(post) {
            expect(post.title).to.eq('test');
            post.title = '';
            return session.flush().then(null, function() {
              expect(post.hasErrors).to.be["false"];
              expect(post.title).to.eq('');
              return expect(adapter.h).to.eql(['PUT:/posts/1']);
            });
          });
        });
      });
      context('on create', function() {
        it('handles 422', function() {
          var post;
          adapter.r['POST:/posts'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({errors: {title: 'is lamerz'}})
            };
          };
          post = session.create('post', {title: 'errorz'});
          return session.flush().then(null, function() {
            return expect(post.errors.title).to.eq('is lamerz');
          });
        });
        it('handle arbitrary errors', function() {
          var post;
          adapter.r['POST:/posts'] = function() {
            throw {
              status: 500,
              responseText: JSON.stringify({error: "something is wrong"})
            };
          };
          post = session.create('post', {title: 'errorz'});
          return session.flush().then(null, function() {
            expect(session.newModels.has(post)).to.be["true"];
            return expect(post.isNew).to.be["true"];
          });
        });
        it('handle errors with multiple staggered creates', function() {
          var calls,
              post1,
              post2;
          calls = 0;
          adapter.runLater = function(callback) {
            var delay;
            delay = calls % 2 === 1 ? 0 : 1000;
            calls++;
            return Coalesce.run.later(callback, delay);
          };
          adapter.r['POST:/posts'] = function() {
            throw {status: 0};
          };
          post1 = session.create('post', {title: 'bad post'});
          post2 = session.create('post', {title: 'another bad post'});
          return session.flush().then(null, function() {
            expect(session.newModels.has(post1)).to.be["true"];
            expect(session.newModels.has(post2)).to.be["true"];
            expect(post1.isNew).to.be["true"];
            return expect(post2.isNew).to.be["true"];
          });
        });
        it('merges payload with latest client changes against latest client version', function() {
          var post;
          adapter.r['POST:/posts'] = function(url, type, hash) {
            throw {
              status: 422,
              responseText: JSON.stringify({post: {
                  title: 'Something',
                  client_id: hash.data.post.client_id,
                  client_rev: hash.data.post.client_rev,
                  errors: {title: 'cannot be empty'}
                }})
            };
          };
          post = session.create('post', {title: ''});
          return session.flush().then(null, function() {
            return expect(post.title).to.eq('Something');
          });
        });
        it('succeeds after retry', function() {
          var post;
          adapter.r['POST:/posts'] = function() {
            throw {
              status: 422,
              responseText: JSON.stringify({errors: {title: 'is lamerz'}})
            };
          };
          post = session.create('post', {title: 'errorz'});
          return session.flush().then(null, function() {
            expect(post.errors.title).to.eq('is lamerz');
            adapter.r['POST:/posts'] = function(url, type, hash) {
              return {post: {
                  title: 'linkbait',
                  id: 1,
                  client_id: hash.data.post.client_id,
                  client_rev: hash.data.post.client_rev
                }};
            };
            session.title = 'linkbait';
            return session.flush().then(function() {
              expect(post.title).to.eq('linkbait');
              return expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts']);
            });
          });
        });
        return it('succeeds after retry when failure merged data', function() {
          var post;
          adapter.r['POST:/posts'] = function(url, type, hash) {
            throw {
              status: 422,
              responseText: JSON.stringify({post: {
                  title: 'Something',
                  client_id: hash.data.post.client_id,
                  client_rev: hash.data.post.client_rev,
                  errors: {title: 'is lamerz'}
                }})
            };
          };
          post = session.create('post', {title: 'errorz'});
          return session.flush().then(null, function() {
            expect(post.title).to.eq('Something');
            expect(post.errors.title).to.eq('is lamerz');
            adapter.r['POST:/posts'] = function(url, type, hash) {
              return {post: {
                  title: 'linkbait',
                  id: 1,
                  client_id: hash.data.post.client_id,
                  client_rev: hash.data.post.client_rev
                }};
            };
            session.title = 'linkbait';
            return session.flush().then(function() {
              expect(post.title).to.eq('linkbait');
              expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts']);
              return expect(post.hasErrors).to.be["false"];
            });
          });
        });
      });
      context('when querying', function() {
        it('does not merge into session', function() {
          adapter.r['GET:/posts'] = function(url, type, hash) {
            throw {
              status: 0,
              responseText: ""
            };
          };
          return session.query('post').then(null, function(err) {
            return expect(err.status).to.eq(0);
          });
        });
        return context('in child session', function() {
          it('merges payload with latest client changes against latest client version', function() {
            var post;
            adapter.r['POST:/posts'] = function(url, type, hash) {
              throw {
                status: 422,
                responseText: JSON.stringify({post: {
                    title: 'Something',
                    client_id: hash.data.post.client_id,
                    client_rev: hash.data.post.client_rev,
                    errors: {title: 'cannot be empty'}
                  }})
              };
            };
            session = session.newSession();
            post = session.create('post', {title: ''});
            return session.flush().then(null, function() {
              return expect(post.title).to.eq('Something');
            });
          });
          it('succeeds after retry', function() {
            var post;
            adapter.r['POST:/posts'] = function() {
              throw {
                status: 422,
                responseText: JSON.stringify({errors: {title: 'is lamerz'}})
              };
            };
            session = session.newSession();
            post = session.create('post', {title: 'errorz'});
            return session.flush().then(null, function() {
              expect(post.errors.title).to.eq('is lamerz');
              adapter.r['POST:/posts'] = function(url, type, hash) {
                return {post: {
                    title: 'linkbait',
                    id: 1,
                    client_id: hash.data.post.client_id,
                    client_rev: hash.data.post.client_rev
                  }};
              };
              session.title = 'linkbait';
              return session.flush().then(function() {
                expect(post.title).to.eq('linkbait');
                return expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts']);
              });
            });
          });
          return it('succeeds after retry when failure merged data', function() {
            var post;
            adapter.r['POST:/posts'] = function(url, type, hash) {
              throw {
                status: 422,
                responseText: JSON.stringify({post: {
                    title: 'Something',
                    client_id: hash.data.post.client_id,
                    client_rev: hash.data.post.client_rev,
                    errors: {title: 'is lamerz'}
                  }})
              };
            };
            session = session.newSession();
            post = session.create('post', {title: 'errorz'});
            return session.flush().then(null, function() {
              expect(post.title).to.eq('Something');
              adapter.r['POST:/posts'] = function(url, type, hash) {
                return {post: {
                    title: 'linkbait',
                    id: 1,
                    client_id: hash.data.post.client_id,
                    client_rev: hash.data.post.client_rev
                  }};
              };
              session.title = 'linkbait';
              return session.flush().then(function() {
                expect(post.title).to.eq('linkbait');
                return expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts']);
              });
            });
          });
        });
      });
      context('on load', function() {
        return [401, 403, 404].forEach(function(errorCode) {
          return it("handles " + errorCode, function() {
            adapter.r['GET:/posts/1'] = function() {
              throw {status: errorCode};
            };
            return session.load('post', 1).then(null, function(post) {
              expect(post.hasErrors).to.be["true"];
              expect(post.errors.status).to.eq(errorCode);
              return expect(adapter.h).to.eql(['GET:/posts/1']);
            });
          });
        });
      });
      return context('on delete', function() {
        it('retains deleted state', function() {
          var post;
          adapter.r['DELETE:/posts/1'] = function() {
            throw {status: 0};
          };
          post = session.merge(new this.Post({
            id: 1,
            title: 'errorz'
          }));
          session.deleteModel(post);
          expect(post.isDeleted).to.be["true"];
          return session.flush().then(null, function() {
            expect(post.isDirty).to.be["true"];
            return expect(post.isDeleted).to.be["true"];
          });
        });
        return it('retains deleted state on multiple models and succeeds subsequently', function() {
          var calls,
              post1,
              post2;
          adapter.r['DELETE:/posts/1'] = function() {
            throw {status: 0};
          };
          adapter.r['DELETE:/posts/2'] = function() {
            throw {status: 0};
          };
          calls = 0;
          adapter.runLater = function(callback) {
            var delay;
            delay = calls % 2 === 1 ? 0 : 1000;
            calls++;
            return Coalesce.run.later(callback, delay);
          };
          post1 = session.merge(new this.Post({
            id: 1,
            title: 'bad post'
          }));
          post2 = session.merge(new this.Post({
            id: 2,
            title: 'another bad post'
          }));
          session.deleteModel(post1);
          session.deleteModel(post2);
          expect(post1.isDeleted).to.be["true"];
          expect(post2.isDeleted).to.be["true"];
          return session.flush().then(null, function() {
            expect(post1.isDirty).to.be["true"];
            expect(post1.isDeleted).to.be["true"];
            expect(post2.isDirty).to.be["true"];
            expect(post2.isDeleted).to.be["true"];
            adapter.r['DELETE:/posts/1'] = function() {
              return {};
            };
            adapter.r['DELETE:/posts/2'] = function() {
              return {};
            };
            return session.flush().then(function() {
              expect(post1.isDirty).to.be["false"];
              expect(post1.isDeleted).to.be["true"];
              expect(post2.isDirty).to.be["false"];
              return expect(post2.isDeleted).to.be["true"];
            });
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.meta", ['./_shared'], function($__0) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.meta";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var setup = $__0.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('returns meta data when', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Coalesce.Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {title: {type: 'string'}}
        });
        this.App.Post = this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      it('loads', function() {
        adapter.r['GET:/posts/1'] = {
          meta: {traffic: 'heavy'},
          posts: {
            id: 1,
            title: 'mvcc ftw'
          }
        };
        return session.load(this.Post, 1).then(function(post) {
          expect(post.meta.traffic).to.eq('heavy');
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          return expect(adapter.h).to.eql(['GET:/posts/1']);
        });
      });
      it('saves', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {
            meta: {traffic: 'heavy'},
            posts: {
              client_id: post.clientId,
              id: 1,
              title: 'mvcc ftw'
            }
          };
        };
        post = session.create('post');
        post.title = 'mvcc ftw';
        return session.flush().then(function(result) {
          expect(result[0].meta.traffic).to.eq('heavy');
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          return expect(adapter.h).to.eql(['POST:/posts']);
        });
      });
      it('updates', function() {
        adapter.r['PUT:/posts/1'] = function() {
          return {
            meta: {traffic: 'heavy'},
            posts: {
              id: 1,
              title: 'updated'
            }
          };
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load('post', 1).then(function(post) {
          expect(post.title).to.eq('test');
          post.title = 'updated';
          return session.flush().then(function(result) {
            expect(result[0].meta.traffic).to.eq('heavy');
            expect(post.title).to.eq('updated');
            return expect(adapter.h).to.eql(['PUT:/posts/1']);
          });
        });
      });
      it('updates multiple times', function() {
        var post;
        adapter.r['PUT:/posts/1'] = function() {
          return {
            meta: {traffic: 'heavy'},
            posts: {
              id: 1,
              title: 'updated'
            }
          };
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        expect(post.title).to.eq('test');
        post.title = 'updated';
        return session.flush().then(function(result) {
          expect(result[0].meta.traffic).to.eq('heavy');
          expect(post.title).to.eq('updated');
          expect(adapter.h).to.eql(['PUT:/posts/1']);
          adapter.r['PUT:/posts/1'] = function() {
            return {
              meta: {traffic: 'lighter'},
              posts: {
                id: 1,
                title: 'updated again'
              }
            };
          };
          post.title = 'updated again';
          return session.flush().then(function(result) {
            expect(result[0].meta.traffic).to.eq('lighter');
            expect(post.title).to.eq('updated again');
            return expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
          });
        });
      });
      it('deletes', function() {
        adapter.r['DELETE:/posts/1'] = {meta: {traffic: 'heavy'}};
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load('post', 1).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('test');
          session.deleteModel(post);
          return session.flush().then(function(result) {
            expect(result[0].meta.traffic).to.eq('heavy');
            expect(post.isDeleted).to.be["true"];
            return expect(adapter.h).to.eql(['DELETE:/posts/1']);
          });
        });
      });
      it('refreshes', function() {
        adapter.r['GET:/posts/1'] = {
          meta: {traffic: 'lighter'},
          posts: {
            id: 1,
            title: 'something new'
          }
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load(this.Post, 1).then(function(post) {
          expect(post.title).to.eq('test');
          expect(adapter.h).to.eql([]);
          return session.refresh(post).then(function(post) {
            expect(post.title).to.eq('something new');
            expect(post.meta.traffic).to.eq('lighter');
            return expect(adapter.h).to.eql(['GET:/posts/1']);
          });
        });
      });
      return it('finds', function() {
        adapter.r['GET:/posts'] = function(url, type, hash) {
          expect(hash.data).to.eql({q: "aardvarks"});
          return {
            meta: {traffic: 'heavy'},
            posts: [{
              id: 1,
              title: 'aardvarks explained'
            }, {
              id: 2,
              title: 'aardvarks in depth'
            }]
          };
        };
        return session.find('post', {q: 'aardvarks'}).then(function(models) {
          expect(models.meta.traffic).to.eq('heavy');
          expect(models.length).to.eq(2);
          return expect(adapter.h).to.eql(['GET:/posts']);
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.one_to_many", ['./_shared', 'coalesce/model/model', 'coalesce/serializers/model', '../support/schemas'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.one_to_many";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var setup = $__0.default;
  var Model = $__2.default;
  var ModelSerializer = $__4.default;
  var postWithComments = $__6.postWithComments;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('one->many', function() {
      beforeEach(function() {
        return postWithComments.apply(this);
      });
      it('loads lazily', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw',
            comments: [2]
          }};
        adapter.r['GET:/comments/2'] = {comments: {
            id: 2,
            body: 'first',
            post: 1
          }};
        return session.load('post', 1).then(function(post) {
          var comment;
          expect(adapter.h).to.eql(['GET:/posts/1']);
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          expect(post.comments.length).to.eq(1);
          comment = post.comments[0];
          expect(comment.body).to.be.undefined;
          return comment.load().then(function() {
            expect(adapter.h).to.eql(['GET:/posts/1', 'GET:/comments/2']);
            expect(comment.body).to.eq('first');
            return expect(comment.post.isEqual(post)).to.be["true"];
          });
        });
      });
      it('creates', function() {
        var comment,
            post;
        adapter.r['POST:/posts'] = function() {
          return {posts: {
              client_id: post.clientId,
              id: 1,
              title: 'topological sort',
              comments: []
            }};
        };
        adapter.r['POST:/comments'] = function(url, type, hash) {
          expect(hash.data.comment.post).to.eq(1);
          return {comments: {
              client_id: comment.clientId,
              id: 2,
              body: 'seems good',
              post: 1
            }};
        };
        post = session.create('post');
        post.title = 'topological sort';
        comment = session.create('comment');
        comment.body = 'seems good';
        comment.post = post;
        expect(post.comments[0]).to.eq(comment);
        return session.flush().then(function() {
          expect(post.id).to.not.be["null"];
          expect(post.isNew).to.be["false"];
          expect(post.title).to.eq('topological sort');
          expect(comment.id).to.not.be["null"];
          expect(comment.body).to.eq('seems good');
          expect(comment.post).to.eq(post);
          expect(comment.post.id).to.eq("1");
          expect(post.comments[0]).to.eq(comment);
          return expect(adapter.h).to.eql(['POST:/posts', 'POST:/comments']);
        });
      });
      it('creates and server can return additional children', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {
            comments: [{
              id: 2,
              post: 1,
              body: 'seems good'
            }],
            posts: {
              client_id: post.clientId,
              id: 1,
              title: 'topological sort',
              comments: [2]
            }
          };
        };
        post = session.create('post');
        post.title = 'topological sort';
        return session.flush().then(function() {
          var comment;
          comment = post.comments[0];
          expect(post.id).to.not.be["null"];
          expect(post.isNew).to.be["false"];
          expect(post.title).to.eq('topological sort');
          expect(comment.id).to.not.be["null"];
          expect(comment.body).to.eq('seems good');
          expect(comment.post).to.eq(post);
          expect(comment.post.id).to.eq("1");
          return expect(adapter.h).to.eql(['POST:/posts']);
        });
      });
      it('creates child', function() {
        var comment;
        adapter.r['POST:/comments'] = function() {
          return {comments: {
              client_id: comment.clientId,
              id: 2,
              body: 'new child',
              post: 1
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'parent',
          comments: []
        }));
        comment = null;
        return session.load(this.Post, 1).then(function(post) {
          comment = session.create('comment', {body: 'new child'});
          comment.post = post;
          expect(post.comments.toArray()).to.eql([comment]);
          return session.flush().then(function() {
            expect(post.comments.toArray()).to.eql([comment]);
            expect(comment.body).to.eq('new child');
            return expect(adapter.h).to.eql(['POST:/comments']);
          });
        });
      });
      it('creates child with lazy reference to parent', function() {
        var comment,
            post;
        adapter.r['POST:/comments'] = function() {
          return {comments: {
              client_id: comment.clientId,
              id: 2,
              body: 'new child',
              post: 1
            }};
        };
        post = this.Post.create({id: 1});
        comment = session.create('comment', {body: 'new child'});
        comment.post = post;
        return session.flush().then(function() {
          expect(comment.body).to.eq('new child');
          expect(adapter.h).to.eql(['POST:/comments']);
          return expect(post.isFieldLoaded('comments')).to.be["false"];
        });
      });
      it('create followed by delete does not hit server', function() {
        var comment;
        session.merge(this.Post.create({
          id: "1",
          title: 'parent'
        }));
        comment = null;
        return session.load(this.Post, 1).then(function(post) {
          comment = session.create('comment', {body: 'new child'});
          comment.post = post;
          session.deleteModel(comment);
          return session.flush().then(function() {
            expect(adapter.h).to.eql([]);
            return expect(comment.isDeleted).to.be["true"];
          });
        });
      });
      it('updates parent, updates child, and saves sibling', function() {
        var comment,
            post,
            sibling;
        adapter.r['PUT:/posts/1'] = function() {
          return {post: {
              id: 1,
              title: 'polychild',
              comments: [2]
            }};
        };
        adapter.r['PUT:/comments/2'] = function() {
          return {comments: {
              id: 2,
              title: 'original sibling',
              post: 1
            }};
        };
        adapter.r['POST:/comments'] = function() {
          return {comments: {
              client_id: sibling.clientId,
              id: 3,
              body: 'sibling',
              post: 1
            }};
        };
        post = this.Post.create({
          id: "1",
          title: 'parent',
          comments: []
        });
        post.comments.addObject(this.Comment.create({
          id: "2",
          body: 'child',
          post: post
        }));
        session.merge(post);
        comment = null;
        sibling = null;
        return session.load(this.Post, 1).then(function(post) {
          comment = post.comments[0];
          sibling = session.create('comment', {body: 'sibling'});
          sibling.post = post;
          comment.body = 'original sibling';
          post.title = 'polychild';
          expect(post.comments.toArray()).to.eql([comment, sibling]);
          return session.flush().then(function() {
            expect(post.comments.toArray()).to.eql([comment, sibling]);
            expect(adapter.h.length).to.eq(3);
            expect(adapter.h).to.include('PUT:/posts/1');
            expect(adapter.h).to.include('PUT:/comments/2');
            return expect(adapter.h).to.include('POST:/comments');
          });
        });
      });
      it('updates with unloaded child', function() {
        adapter.r['GET:/posts/1'] = function() {
          return {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [2]
            }};
        };
        adapter.r['PUT:/posts/1'] = function() {
          return {posts: {
              id: 1,
              title: 'updated',
              comments: [2]
            }};
        };
        return session.load('post', 1).then(function(post) {
          expect(post.title).to.eq('mvcc ftw');
          expect(adapter.h).to.eql(['GET:/posts/1']);
          post.title = 'updated';
          return session.flush().then(function() {
            expect(post.title).to.eq('updated');
            return expect(adapter.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
          });
        });
      });
      it('deletes child', function() {
        var post;
        adapter.r['PUT:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw',
            comments: [2]
          }};
        adapter.r['DELETE:/comments/2'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent',
          comments: []
        });
        post.comments.addObject(this.Comment.create({
          id: "2",
          body: 'child',
          post: post
        }));
        session.merge(post);
        return session.load('post', 1).then(function(post) {
          var comment;
          comment = post.comments[0];
          session.deleteModel(comment);
          expect(post.comments.length).to.eq(0);
          return session.flush().then(function() {
            expect(adapter.h).to.eql(['DELETE:/comments/2']);
            return expect(post.comments.length).to.eq(0);
          });
        });
      });
      it('deletes child and updates parent', function() {
        var post;
        adapter.r['PUT:/posts/1'] = {posts: {
            id: 1,
            title: 'childless',
            comments: []
          }};
        adapter.r['DELETE:/comments/2'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent',
          comments: []
        });
        post.comments.addObject(this.Comment.create({
          id: "2",
          body: 'child',
          post: post
        }));
        session.merge(post);
        return session.load('post', 1).then(function(post) {
          var comment;
          comment = post.comments[0];
          session.deleteModel(comment);
          expect(post.comments.length).to.eq(0);
          post.title = 'childless';
          return session.flush().then(function() {
            expect(post.comments.length).to.eq(0);
            expect(post.title).to.eq('childless');
            expect(adapter.h.length).to.eq(2);
            expect(adapter.h).to.include('DELETE:/comments/2');
            return expect(adapter.h).to.include('PUT:/posts/1');
          });
        });
      });
      it('deletes parent and child', function() {
        var post;
        adapter.r['DELETE:/posts/1'] = {};
        adapter.r['DELETE:/comments/2'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent',
          comments: []
        });
        post.comments.addObject(this.Comment.create({
          id: "2",
          body: 'child',
          post: post
        }));
        session.merge(post);
        return session.load('post', 1).then(function(post) {
          var comment;
          comment = post.comments[0];
          session.deleteModel(comment);
          expect(post.comments.length).to.eq(0);
          session.deleteModel(post);
          return session.flush().then(function() {
            expect(adapter.h.length).to.eq(2);
            expect(adapter.h).to.include('DELETE:/comments/2');
            expect(adapter.h).to.include('DELETE:/posts/1');
            expect(post.isDeleted).to.be["true"];
            return expect(comment.isDeleted).to.be["true"];
          });
        });
      });
      return context('embedded', function() {
        beforeEach(function() {
          var PostSerializer;
          PostSerializer = ModelSerializer.extend({properties: {comments: {embedded: 'always'}}});
          return this.container.register('serializer:post', PostSerializer);
        });
        it('loads', function() {
          adapter.r['GET:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [{
                id: 2,
                post: 1,
                body: 'first'
              }]
            }};
          return session.load(this.Post, 1).then(function(post) {
            var comment;
            expect(adapter.h).to.eql(['GET:/posts/1']);
            expect(post.id).to.eq("1");
            expect(post.title).to.eq('mvcc ftw');
            expect(post.comments.length).to.eq(1);
            comment = post.comments[0];
            expect(comment.body).to.eq('first');
            return expect(comment.post.isEqual(post)).to.be["true"];
          });
        });
        it('updates child', function() {
          adapter.r['GET:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [{
                id: 2,
                post: 1,
                body: 'first'
              }]
            }};
          adapter.r['PUT:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [{
                id: 2,
                post: 1,
                body: 'first again'
              }]
            }};
          return session.load(this.Post, 1).then(function(post) {
            var comment;
            expect(adapter.h).to.eql(['GET:/posts/1']);
            comment = post.comments[0];
            comment.body = 'first again';
            return session.flush().then(function() {
              expect(post.comments[0]).to.eq(comment);
              expect(comment.body).to.eq('first again');
              return expect(adapter.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
            });
          });
        });
        it('adds child', function() {
          var comment;
          adapter.r['GET:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: []
            }};
          adapter.r['PUT:/posts/1'] = function() {
            return {posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  client_id: comment.clientId,
                  post: 1,
                  body: 'reborn'
                }]
              }};
          };
          comment = null;
          return session.load(this.Post, 1).then(function(post) {
            expect(adapter.h).to.eql(['GET:/posts/1']);
            expect(post.comments.length).to.eq(0);
            comment = session.create('comment', {body: 'reborn'});
            comment.post = post;
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
              expect(comment.body).to.eq('reborn');
              return expect(post.comments[0]).to.eq(comment);
            });
          });
        });
        it('adds child with sibling', function() {
          var comment;
          adapter.r['GET:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [{
                id: 2,
                post: 1,
                body: 'first-born'
              }]
            }};
          adapter.r['PUT:/posts/1'] = function(url, type, hash) {
            expect(hash.data.post.comments[1].id).to.be["null"];
            expect(hash.data.post.comments[0].body).to.eq('first-born');
            return {posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  post: 1,
                  body: 'first-born'
                }, {
                  id: 3,
                  client_id: comment.clientId,
                  post: 1,
                  body: 'second-born'
                }]
              }};
          };
          comment = null;
          return session.load(this.Post, 1).then(function(post) {
            expect(adapter.h).to.eql(['GET:/posts/1']);
            expect(post.comments.length).to.eq(1);
            comment = session.create('comment', {body: 'second-born'});
            comment.post = post;
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
              expect(comment.body).to.eq('second-born');
              expect(post.comments[0].body).to.eq('first-born');
              return expect(post.comments.lastObject).to.eq(comment);
            });
          });
        });
        it('deletes child', function() {
          var post;
          adapter.r['PUT:/posts/1'] = function(url, type, hash) {
            expect(hash.data.post.comments.length).to.eq(0);
            return {posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: []
              }};
          };
          post = this.Post.create({
            id: "1",
            title: 'parent',
            comments: []
          });
          post.comments.addObject(this.Comment.create({
            id: "2",
            body: 'child',
            post: post
          }));
          session.merge(post);
          return session.load('post', 1).then(function(post) {
            var comment;
            comment = post.comments[0];
            session.deleteModel(comment);
            expect(post.comments.length).to.eq(0);
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['PUT:/posts/1']);
              return expect(post.comments.length).to.eq(0);
            });
          });
        });
        it('deletes child with sibling', function() {
          var post,
              sibling;
          adapter.r['PUT:/posts/1'] = function(url, type, hash) {
            expect(hash.data.post.comments.length).to.eq(1);
            return {posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 3,
                  client_id: sibling.clientId,
                  post: 1,
                  body: 'child2'
                }]
              }};
          };
          post = this.Post.create({
            id: "1",
            title: 'parent',
            comments: []
          });
          post.comments.addObject(this.Comment.create({
            id: "2",
            body: 'child1',
            post: post
          }));
          post.comments.addObject(this.Comment.create({
            id: "3",
            body: 'child2',
            post: post
          }));
          session.merge(post);
          sibling = null;
          return session.load('post', 1).then(function(post) {
            var comment;
            comment = post.comments[0];
            sibling = post.comments.lastObject;
            session.deleteModel(comment);
            expect(post.comments.length).to.eq(1);
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['PUT:/posts/1']);
              return expect(post.comments.length).to.eq(1);
            });
          });
        });
        it('new parent creates and deletes child before flush', function() {
          var comment,
              post;
          adapter.r['POST:/posts'] = function(url, type, hash) {
            expect(hash.data.post.comments.length).to.eq(0);
            return {posts: {
                client_id: post.clientId,
                id: 1,
                title: 'mvcc ftw',
                comments: []
              }};
          };
          post = session.create(this.Post, {
            title: 'parent',
            comments: []
          });
          comment = session.create(this.Comment, {title: 'child'});
          post.comments.pushObject(comment);
          post.comments.removeObject(comment);
          return session.flush().then(function() {
            expect(post.comments.length).to.eq(0);
            expect(post.isNew).to.be["false"];
            return expect(adapter.h).to.eql(['POST:/posts']);
          });
        });
        it('deletes multiple children in multiple flushes', function() {
          var post;
          post = this.Post.create({
            id: "1",
            title: 'parent',
            comments: []
          });
          post.comments.addObject(this.Comment.create({
            id: "2",
            body: 'thing 1',
            post: post
          }));
          post.comments.addObject(this.Comment.create({
            id: "3",
            body: 'thing 2',
            post: post
          }));
          post = session.merge(post);
          adapter.r['PUT:/posts/1'] = {posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [{
                post: "1",
                id: "3",
                body: 'thing 2'
              }]
            }};
          session.deleteModel(post.comments.objectAt(0));
          return session.flush().then(function() {
            expect(adapter.h).to.eql(['PUT:/posts/1']);
            expect(post.comments.length).to.eq(1);
            session.deleteModel(post.comments.objectAt(0));
            adapter.r['PUT:/posts/1'] = {posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: []
              }};
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
              return expect(post.comments.length).to.eq(0);
            });
          });
        });
        return it('deletes parent and child', function() {
          var post;
          adapter.r['DELETE:/posts/1'] = {};
          post = this.Post.create({
            id: "1",
            title: 'parent',
            comments: []
          });
          post.comments.addObject(this.Comment.create({
            id: "2",
            body: 'child'
          }));
          session.merge(post);
          return session.load('post', 1).then(function(post) {
            session.deleteModel(post);
            return session.flush().then(function() {
              expect(adapter.h).to.eql(['DELETE:/posts/1']);
              return expect(post.isDeleted).to.be["true"];
            });
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.one_to_one", ['./_shared', 'coalesce/model/model', 'coalesce/serializers/model', '../support/schemas'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.one_to_one";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var setup = $__0.default;
  var Model = $__2.default;
  var ModelSerializer = $__4.default;
  var userWithPost = $__6.userWithPost;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      return setup.apply(this);
    });
    context("one->one", function() {
      beforeEach(function() {
        userWithPost.apply(this);
        this.adapter.configs = {post: {user: {owner: false}}};
        adapter = this.adapter;
        return session = this.session;
      });
      it('child can be null', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw',
            user: null
          }};
        adapter.r['PUT:/posts/1'] = {posts: {
            id: 1,
            title: 'new title',
            user: null
          }};
        return session.load(this.Post, 1).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq("mvcc ftw");
          expect(post.user).to.be["null"];
          post.title = 'new title';
          return session.flush().then(function() {
            return expect(post.title).to.eq('new title');
          });
        });
      });
      it('loads lazily', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw',
            user: 2
          }};
        adapter.r['GET:/users/2'] = {users: {
            id: 2,
            name: 'brogrammer',
            post: 1
          }};
        return session.load(this.Post, 1).then(function(post) {
          var user;
          expect(adapter.h).to.eql(['GET:/posts/1']);
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          user = post.user;
          expect(user.id).to.eq("2");
          expect(user.name).to.be.undefined;
          return post.user.load().then(function() {
            expect(adapter.h).to.eql(['GET:/posts/1', 'GET:/users/2']);
            expect(user.name).to.eq('brogrammer');
            return expect(user.post.isEqual(post)).to.be["true"];
          });
        });
      });
      it('deletes one side', function() {
        var post;
        adapter.r['DELETE:/users/2'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent'
        });
        post.user = this.User.create({
          id: "2",
          name: 'wes',
          post: post
        });
        session.merge(post);
        return session.load('post', 1).then(function(post) {
          var user;
          user = post.user;
          session.deleteModel(user);
          expect(post.user).to.be["null"];
          return session.flush().then(function() {
            expect(post.user).to.be["null"];
            return expect(adapter.h).to.eql(['DELETE:/users/2']);
          });
        });
      });
      it('deletes both', function() {
        var post;
        adapter.r['DELETE:/posts/1'] = {};
        adapter.r['DELETE:/users/2'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent'
        });
        post.user = this.User.create({
          id: "2",
          name: 'wes',
          post: post
        });
        session.merge(post);
        return session.load('post', 1).then(function(post) {
          var user;
          user = post.user;
          session.deleteModel(user);
          session.deleteModel(post);
          return session.flush().then(function() {
            expect(adapter.h.length).to.eq(2);
            expect(adapter.h).to.include('DELETE:/users/2');
            return expect(adapter.h).to.include('DELETE:/posts/1');
          });
        });
      });
      it('creates on server', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {posts: {
              client_id: post.clientId,
              id: 1,
              title: 'herp',
              user: 2
            }};
        };
        adapter.r['GET:/users/2'] = {users: {
            id: 1,
            name: 'derp',
            post: 1
          }};
        post = session.create('post', {title: 'herp'});
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['POST:/posts']);
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('herp');
          return expect(post.user).to.not.be["null"];
        });
      });
      return it('creates on server and returns sideloaded', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {
            users: {
              id: 2,
              name: 'derp',
              post: 1
            },
            posts: {
              client_id: post.clientId,
              id: 1,
              title: 'herp',
              user: 2
            }
          };
        };
        post = session.create('post', {title: 'herp'});
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['POST:/posts']);
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('herp');
          expect(post.user).to.not.be["null"];
          return expect(post.user.name).to.eq('derp');
        });
      });
    });
    return context("one->one embedded", function() {
      beforeEach(function() {
        var PostSerializer;
        userWithPost.apply(this);
        PostSerializer = ModelSerializer.extend({properties: {user: {embedded: 'always'}}});
        adapter = this.adapter;
        session = this.session;
        return this.container.register('serializer:post', PostSerializer);
      });
      it('creates child', function() {
        var post;
        adapter.r['PUT:/posts/1'] = function() {
          return {posts: {
              id: 1,
              title: 'parent',
              user: {
                client_id: post.user.clientId,
                id: 2,
                name: 'child',
                post: 1
              }
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'parent'
        }));
        post.user = session.create('user', {name: 'child'});
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['PUT:/posts/1']);
          expect(post.user.isNew).to.be["false"];
          return expect(post.user.id).to.eq('2');
        });
      });
      it('creates hierarchy', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {posts: {
              client_id: post.clientId,
              id: 1,
              title: 'herp',
              user: {
                client_id: post.user.clientId,
                id: 1,
                name: 'derp',
                post: 1
              }
            }};
        };
        post = session.create('post', {title: 'herp'});
        post.user = session.create('user', {name: 'derp'});
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['POST:/posts']);
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('herp');
          return expect(post.user.name).to.eq('derp');
        });
      });
      return it('deletes parent', function() {
        var post;
        adapter.r['DELETE:/posts/1'] = {};
        post = this.Post.create({
          id: "1",
          title: 'parent'
        });
        post.user = this.User.create({
          id: "2",
          name: 'wes'
        });
        post = session.merge(post);
        session.deleteModel(post);
        return session.flush().then(function() {
          expect(adapter.h).to.eql(['DELETE:/posts/1']);
          return expect(post.isDeleted).to.be["true"];
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.performance", ['./_shared', '../support/schemas'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.performance";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var postWithComments = $__2.postWithComments;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      session = this.session;
      return Coalesce.__container__ = this.container;
    });
    afterEach(function() {
      return delete Coalesce.__container__;
    });
    return describe('performance', function() {
      beforeEach(function() {
        postWithComments.apply(this);
        this.container.register('model:post', this.Post);
        return this.container.register('model:comment', this.Comment);
      });
      it('loads model with many children to empty session fast', function() {
        var i,
            _i,
            _results;
        this.slow(500);
        adapter.r['GET:/posts'] = {
          posts: [{
            id: 1,
            title: 'is it fast?',
            rev: 1,
            comments: (function() {
              _results = [];
              for (_i = 1; _i <= 100; _i++) {
                _results.push(_i);
              }
              return _results;
            }).apply(this)
          }],
          comments: (function() {
            var _j,
                _results1;
            _results1 = [];
            for (i = _j = 1; _j <= 100; i = ++_j) {
              _results1.push({
                id: i,
                message: "message" + i,
                post: 1,
                rev: 1
              });
            }
            return _results1;
          })()
        };
        return session.query('post').then(function(posts) {
          return expect(posts[0].comments.length).to.eq(100);
        });
      });
      return it('loads model with many children repeatedly fast when rev is set', function() {
        var i,
            _i,
            _results;
        this.slow(2500);
        adapter.r['GET:/posts'] = {
          posts: [{
            id: 1,
            title: 'still fast?',
            rev: 1,
            comments: (function() {
              _results = [];
              for (_i = 1; _i <= 100; _i++) {
                _results.push(_i);
              }
              return _results;
            }).apply(this)
          }],
          comments: (function() {
            var _j,
                _results1;
            _results1 = [];
            for (i = _j = 1; _j <= 100; i = ++_j) {
              _results1.push({
                id: i,
                message: "message" + i,
                post: 1,
                rev: 1
              });
            }
            return _results1;
          })()
        };
        return session.query('post').then(function(posts) {
          return posts.refresh().then(function(posts) {
            return expect(posts[0].comments.length).to.eq(100);
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.rpc", ['./_shared', 'coalesce/model/model'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.rpc";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var Model = $__2.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('rpc with simple model', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {type: 'string'},
            submitted: {type: 'boolean'}
          }
        });
        this.App.Post = this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      it('works with loaded model as context', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit').then(function() {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('handles remote calls on the collection', function() {
        adapter.r['POST:/posts/randomize'] = function() {
          return {posts: [{
              id: 1,
              title: 'submitted',
              submitted: true
            }, {
              id: 2,
              title: 'submitted2',
              submitted: true
            }]};
        };
        return session.remoteCall('post', 'randomize').then(function(models) {
          expect(models.length).to.eq(2);
          expect(models[0].title).to.eq('submitted');
          expect(models[0].submitted).to.be["true"];
          return expect(adapter.h).to.eql(['POST:/posts/randomize']);
        });
      });
      it('serializes model params', function() {
        adapter.r['POST:/posts/1/submit'] = function(url, type, hash) {
          expect(hash.data.post.title).to.eq('test');
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', post).then(function() {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('can accept model type as context', function() {
        adapter.r['POST:/posts/import'] = function() {
          return {posts: [{
              id: 1,
              title: 'submitted',
              submitted: "true"
            }]};
        };
        return session.remoteCall('post', 'import').then(function(posts) {
          expect(adapter.h).to.eql(['POST:/posts/import']);
          return expect(posts[0].id).to.eq("1");
        });
      });
      it('can accept parameters', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}).then(function() {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('passes through metadata', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {
            meta: {traffic: 'heavy'},
            posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }
          };
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}).then(function() {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.meta.traffic).to.eq('heavy');
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('can accept a method', function() {
        adapter.r['PUT:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {type: 'PUT'}).then(function() {
            expect(adapter.h).to.eql(['PUT:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('when url option set, a custom url is used', function() {
        adapter.r['POST:/greener_pastures'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {url: '/greener_pastures'}).then(function() {
            expect(adapter.h).to.eql(['POST:/greener_pastures']);
            expect(post.title).to.eq('submitted');
            return expect(post.submitted).to.be["true"];
          });
        });
      });
      it('results in raw json when deserialize=false', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {deserialize: false}).then(function(json) {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('test');
            expect(post.submitted).to.be["false"];
            expect(json.posts.title).to.eq('submitted');
            return expect(json.isModel).to.be.undefined;
          });
        });
      });
      it('returns all models when deserializationContext is null', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {deserializationContext: null}).then(function(models) {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            expect(post.submitted).to.be["true"];
            return expect(models[0]).to.eq(post);
          });
        });
      });
      it('returns all models of a type if deserializer context is a type key', function() {
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {serializerOptions: {context: 'post'}}).then(function(models) {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            expect(post.submitted).to.be["true"];
            return expect(models[0]).to.eq(post);
          });
        });
      });
      return it('returns all models of a type if context is a type', function() {
        var Post;
        adapter.r['POST:/posts/1/submit'] = function() {
          return {posts: {
              id: 1,
              title: 'submitted',
              submitted: "true"
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test',
          submitted: false
        }));
        Post = this.Post;
        return session.load('post', 1).then(function(post) {
          return session.remoteCall(post, 'submit', {token: 'asd'}, {serializerOptions: {context: Post}}).then(function(models) {
            expect(adapter.h).to.eql(['POST:/posts/1/submit']);
            expect(post.title).to.eq('submitted');
            expect(post.submitted).to.be["true"];
            return expect(models[0]).to.eq(post);
          });
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.serialization", ['./_shared', 'coalesce/model/model', 'coalesce/serializers/model', '../support/schemas'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.serialization";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var setup = $__0.default;
  var Model = $__2.default;
  var ModelSerializer = $__4.default;
  var $__7 = $__6,
      postWithComments = $__7.postWithComments,
      postWithEmbeddedComments = $__7.postWithEmbeddedComments,
      userWithPost = $__7.userWithPost;
  describe('rest serialization', function() {
    beforeEach(function() {
      setup.apply(this);
      return this.serializer = this.adapter.serializerFor('payload');
    });
    context('simple model', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {type: 'string'},
            longTitle: {type: 'string'}
          }
        });
        this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      describe("overriding a serializer's typeKey", function() {
        return it('returns a model of that type', function() {
          var SpecialPostSerializer,
              data,
              models,
              post;
          SpecialPostSerializer = ModelSerializer.extend({typeKey: 'post'});
          this.container.register('serializer:special_post', SpecialPostSerializer);
          data = {special_posts: [{
              id: 1,
              title: 'wat',
              user: null
            }]};
          models = this.serializer.deserialize(data);
          post = models[0];
          return expect(post).to.be.an["instanceof"](this.Post);
        });
      });
      describe('deserialize', function() {
        it('reads plural hash key', function() {
          var data,
              models,
              post;
          data = {posts: {
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.longTitle).to.eq('wat omgawd');
          return expect(post.id).to.eq("1");
        });
        it('reads singular hash key', function() {
          var data,
              models,
              post;
          data = {post: {
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.longTitle).to.eq('wat omgawd');
          return expect(post.id).to.eq("1");
        });
        it('reads array value', function() {
          var data,
              models,
              post;
          data = {post: [{
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }]};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.longTitle).to.eq('wat omgawd');
          return expect(post.id).to.eq("1");
        });
        it('obeys custom keys', function() {
          var PostSerializer,
              data,
              models,
              post;
          PostSerializer = ModelSerializer.extend({properties: {title: {key: 'POST_TITLE'}}});
          this.container.register('serializer:post', PostSerializer);
          data = {post: {
              id: 1,
              POST_TITLE: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.longTitle).to.eq('wat omgawd');
          return expect(post.id).to.eq("1");
        });
        it('reifies client_id', function() {
          var data,
              models,
              post;
          data = {posts: {
              client_id: null,
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          return expect(post.clientId).to.not.be["null"];
        });
        it('reads revs', function() {
          var data,
              models,
              post;
          data = {posts: {
              rev: 123,
              client_rev: 321,
              client_id: 1,
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post.rev).to.eq(123);
          return expect(post.clientRev).to.eq(321);
        });
        return it('respects aliases', function() {
          var data,
              models,
              post;
          this.serializer.constructor.reopen({aliases: {blog_post: 'post'}});
          data = {blog_post: {
              id: 1,
              title: 'wat',
              long_title: 'wat omgawd'
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.longTitle).to.eq('wat omgawd');
          return expect(post.id).to.eq("1");
        });
      });
      return describe('serialization', function() {
        beforeEach(function() {
          return this.serializer = this.adapter.serializerFor('post');
        });
        it('serializes', function() {
          var data,
              post;
          post = this.Post.create({
            id: 1,
            clientId: "2",
            title: "wat",
            longTitle: 'wat omgawd',
            rev: 123,
            clientRev: 321
          });
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            title: 'wat',
            long_title: 'wat omgawd',
            rev: 123,
            client_rev: 321
          });
        });
        return it('obeys custom keys', function() {
          var data,
              post;
          this.serializer.constructor.reopen({properties: {title: {key: 'POST_TITLE'}}});
          post = this.Post.create();
          post.id = 1;
          post.clientId = "2";
          post.title = 'wat';
          post.longTitle = 'wat omgawd';
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            POST_TITLE: 'wat',
            long_title: 'wat omgawd'
          });
        });
      });
    });
    context('model with raw and object properties', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {
            title: {type: 'string'},
            object: {}
          }
        });
        this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      describe('deserialize', function() {
        return it('deserializes', function() {
          var data,
              models,
              post;
          data = {posts: {
              id: 1,
              title: 'wat',
              object: {prop: 'sup'}
            }};
          models = this.serializer.deserialize(data);
          post = models[0];
          expect(post).to.be.an["instanceof"](this.Post);
          expect(post.title).to.eq('wat');
          expect(post.object.prop).to.eq('sup');
          return expect(post.id).to.eq("1");
        });
      });
      return describe('serialization', function() {
        beforeEach(function() {
          return this.serializer = this.adapter.serializerFor('post');
        });
        it('serializes object', function() {
          var data,
              post;
          post = this.Post.create({
            id: 1,
            clientId: "2",
            title: "wat",
            object: {prop: 'sup'}
          });
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            title: 'wat',
            object: {prop: 'sup'}
          });
        });
        it('serializes array', function() {
          var data,
              post;
          post = this.Post.create({
            id: 1,
            clientId: "2",
            title: "wat",
            object: ['asd']
          });
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            title: 'wat',
            object: ['asd']
          });
        });
        it('serializes empty array', function() {
          var data,
              post;
          post = this.Post.create({
            id: 1,
            clientId: "2",
            title: "wat",
            object: []
          });
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            title: 'wat',
            object: []
          });
        });
        return it('serializes complex object', function() {
          var data,
              post;
          post = this.Post.create({
            id: 1,
            clientId: "2",
            title: "wat",
            object: {tags: ['ruby', 'java']}
          });
          data = this.serializer.serialize(post);
          return expect(data).to.eql({
            client_id: "2",
            id: 1,
            title: 'wat',
            object: {tags: ['ruby', 'java']}
          });
        });
      });
    });
    context('one->many', function() {
      beforeEach(function() {
        return postWithComments.apply(this);
      });
      it('deserializes null hasMany', function() {
        var data,
            models,
            post;
        data = {post: [{
            id: 1,
            title: 'wat',
            comments: null
          }]};
        models = this.serializer.deserialize(data);
        post = models[0];
        return expect(post.comments.length).to.eq(0);
      });
      return it('deserializes null belongsTo', function() {
        var comment,
            data,
            models;
        data = {comments: [{
            id: 1,
            title: 'wat',
            post: null
          }]};
        models = this.serializer.deserialize(data);
        comment = models[0];
        return expect(comment.post).to.be["null"];
      });
    });
    context('one->many embedded', function() {
      beforeEach(function() {
        return postWithEmbeddedComments.apply(this);
      });
      return it('deserializes null belongsTo', function() {
        var comment,
            data,
            models;
        data = {comments: [{
            id: 1,
            title: 'wat',
            post: null
          }]};
        models = this.serializer.deserialize(data);
        comment = models[0];
        return expect(comment.post).to.be["null"];
      });
    });
    return context('one->one embedded', function() {
      beforeEach(function() {
        var PostSerializer;
        userWithPost.apply(this);
        PostSerializer = ModelSerializer.extend({properties: {user: {embedded: 'always'}}});
        return this.container.register('serializer:post', PostSerializer);
      });
      return it('deserializes null belongsTo', function() {
        var data,
            models,
            post;
        data = {posts: [{
            id: 1,
            title: 'wat',
            user: null
          }]};
        models = this.serializer.deserialize(data);
        post = models[0];
        return expect(post.user).to.be["null"];
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.sideloading", ['./_shared', '../support/schemas'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.sideloading";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var postWithComments = $__2.postWithComments;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return describe('sideloading', function() {
      beforeEach(function() {
        return postWithComments.apply(this);
      });
      return it('sideloads', function() {
        adapter.r['GET:/posts/1'] = {
          posts: {
            id: "1",
            title: 'sideload my children',
            comments: [2, 3]
          },
          comments: [{
            id: "2",
            body: "here we",
            post: "1"
          }, {
            id: "3",
            body: "are",
            post: "1"
          }]
        };
        return session.load('post', 1).then(function(post) {
          expect(adapter.h).to.eql(['GET:/posts/1']);
          expect(post.comments[0].body).to.eq('here we');
          return expect(post.comments.lastObject.body).to.eq('are');
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest.simple", ['./_shared'], function($__0) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest.simple";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var setup = $__0.default;
  describe("rest", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      return session = this.session;
    });
    return context('simple model', function() {
      beforeEach(function() {
        var Post = function Post() {
          $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
        };
        var $Post = Post;
        ($traceurRuntime.createClass)(Post, {}, {}, Coalesce.Model);
        ;
        Post.defineSchema({
          typeKey: 'post',
          attributes: {title: {type: 'string'}}
        });
        this.App.Post = this.Post = Post;
        return this.container.register('model:post', this.Post);
      });
      it('loads', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw'
          }};
        return session.load(this.Post, 1).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          return expect(adapter.h).to.eql(['GET:/posts/1']);
        });
      });
      it('saves', function() {
        var post;
        adapter.r['POST:/posts'] = function() {
          return {posts: {
              client_id: post.clientId,
              id: 1,
              title: 'mvcc ftw'
            }};
        };
        post = session.create('post');
        post.title = 'mvcc ftw';
        return session.flush().then(function() {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          return expect(adapter.h).to.eql(['POST:/posts']);
        });
      });
      it('updates', function() {
        adapter.r['PUT:/posts/1'] = function() {
          return {posts: {
              id: 1,
              title: 'updated'
            }};
        };
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load('post', 1).then(function(post) {
          expect(post.title).to.eq('test');
          post.title = 'updated';
          return session.flush().then(function() {
            expect(post.title).to.eq('updated');
            return expect(adapter.h).to.eql(['PUT:/posts/1']);
          });
        });
      });
      it('updates multiple times', function() {
        var post;
        adapter.r['PUT:/posts/1'] = function() {
          return {posts: {
              id: 1,
              title: 'updated'
            }};
        };
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        expect(post.title).to.eq('test');
        post.title = 'updated';
        return session.flush().then(function() {
          expect(post.title).to.eq('updated');
          expect(adapter.h).to.eql(['PUT:/posts/1']);
          adapter.r['PUT:/posts/1'] = function() {
            return {posts: {
                id: 1,
                title: 'updated again'
              }};
          };
          post.title = 'updated again';
          return session.flush().then(function() {
            expect(post.title).to.eq('updated again');
            expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
            return session.flush().then(function() {
              expect(post.title).to.eq('updated again');
              return expect(adapter.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
            });
          });
        });
      });
      it('deletes', function() {
        adapter.r['DELETE:/posts/1'] = {};
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load('post', 1).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('test');
          session.deleteModel(post);
          return session.flush().then(function() {
            expect(post.isDeleted).to.be["true"];
            return expect(adapter.h).to.eql(['DELETE:/posts/1']);
          });
        });
      });
      it('deletes multiple times in multiple flushes', function() {
        var post1,
            post2;
        adapter.r['DELETE:/posts/1'] = {};
        post1 = session.merge(this.Post.create({
          id: "1",
          title: 'thing 1'
        }));
        post2 = session.merge(this.Post.create({
          id: "2",
          title: 'thing 2'
        }));
        session.deleteModel(post1);
        return session.flush().then(function() {
          expect(post1.isDeleted).to.be["true"];
          expect(post2.isDeleted).to.be["false"];
          adapter.r['DELETE:/posts/1'] = function() {
            throw "already deleted";
          };
          adapter.r['DELETE:/posts/2'] = {};
          session.deleteModel(post2);
          return session.flush().then(function() {
            expect(post1.isDeleted).to.be["true"];
            return expect(post2.isDeleted).to.be["true"];
          });
        });
      });
      it('creates, deletes, creates, deletes', function() {
        var post1;
        post1 = session.create('post');
        post1.title = 'thing 1';
        adapter.r['POST:/posts'] = function() {
          return {posts: {
              client_id: post1.clientId,
              id: 1,
              title: 'thing 1'
            }};
        };
        return session.flush().then(function() {
          expect(post1.id).to.eq('1');
          expect(post1.title).to.eq('thing 1');
          session.deleteModel(post1);
          adapter.r['DELETE:/posts/1'] = {};
          return session.flush().then(function() {
            var post2;
            expect(post1.isDeleted).to.be["true"];
            post2 = session.create('post');
            post2.title = 'thing 2';
            adapter.r['POST:/posts'] = function() {
              return {posts: {
                  client_id: post2.clientId,
                  id: 2,
                  title: 'thing 2'
                }};
            };
            return session.flush().then(function() {
              adapter.r['DELETE:/posts/1'] = function() {
                throw 'not found';
              };
              adapter.r['DELETE:/posts/2'] = {};
              expect(post2.id).to.eq('2');
              expect(post2.title).to.eq('thing 2');
              session.deleteModel(post2);
              return session.flush().then(function() {
                expect(post2.isDeleted).to.be["true"];
                return expect(adapter.h).to.eql(['POST:/posts', 'DELETE:/posts/1', 'POST:/posts', 'DELETE:/posts/2']);
              });
            });
          });
        });
      });
      it('refreshes', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'something new'
          }};
        session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        return session.load(this.Post, 1).then(function(post) {
          expect(post.title).to.eq('test');
          expect(adapter.h).to.eql([]);
          return session.refresh(post).then(function(post) {
            expect(post.title).to.eq('something new');
            return expect(adapter.h).to.eql(['GET:/posts/1']);
          });
        });
      });
      it('finds', function() {
        adapter.r['GET:/posts'] = function(url, type, hash) {
          expect(hash.data).to.eql({q: "aardvarks"});
          return {posts: [{
              id: 1,
              title: 'aardvarks explained'
            }, {
              id: 2,
              title: 'aardvarks in depth'
            }]};
        };
        return session.find('post', {q: 'aardvarks'}).then(function(models) {
          expect(models.length).to.eq(2);
          return expect(adapter.h).to.eql(['GET:/posts']);
        });
      });
      it('loads then updates', function() {
        adapter.r['GET:/posts/1'] = {posts: {
            id: 1,
            title: 'mvcc ftw'
          }};
        adapter.r['PUT:/posts/1'] = {posts: {
            id: 1,
            title: 'no more fsm'
          }};
        return session.load(this.Post, 1).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          expect(adapter.h).to.eql(['GET:/posts/1']);
          post.title = 'no more fsm';
          return session.flush().then(function() {
            expect(adapter.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
            return expect(post.title).to.eq('no more fsm');
          });
        });
      });
      return it('loads with parameter', function() {
        adapter.r['GET:/posts/1'] = function(url, type, hash) {
          expect(hash.data.invite_token).to.eq('fdsavcxz');
          return {posts: {
              id: 1,
              title: 'mvcc ftw'
            }};
        };
        return session.load(this.Post, 1, {params: {invite_token: 'fdsavcxz'}}).then(function(post) {
          expect(post.id).to.eq("1");
          expect(post.title).to.eq('mvcc ftw');
          return expect(adapter.h).to.eql(['GET:/posts/1']);
        });
      });
    });
  });
  return {};
});

define("coalesce-test/rest/rest_adapter", ['./_shared', '../support/schemas'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/rest/rest_adapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var setup = $__0.default;
  var postWithComments = $__2.postWithComments;
  describe("RestAdapter", function() {
    var adapter,
        session;
    adapter = null;
    session = null;
    beforeEach(function() {
      setup.apply(this);
      adapter = this.adapter;
      session = this.session;
      Coalesce.__container__ = this.container;
      postWithComments.apply(this);
      return this.container.register('model:comment', this.Comment);
    });
    afterEach(function() {
      return delete Coalesce.__container__;
    });
    describe('.mergePayload', function() {
      var data;
      data = {
        post: {
          id: 1,
          title: 'ma post',
          comments: [2, 3]
        },
        comments: [{
          id: 2,
          body: 'yo'
        }, {
          id: 3,
          body: 'sup'
        }]
      };
      it('should merge with typeKey as context', function() {
        var post;
        post = adapter.mergePayload(data, 'post', session)[0];
        expect(post.title).to.eq('ma post');
        return expect(post).to.eq(session.getModel(post));
      });
      return it('should merge with no context', function() {
        var models;
        models = adapter.mergePayload(data, null, session);
        return expect(models.size).to.eq(3);
      });
    });
    describe('.ajaxOptions', function() {
      beforeEach(function() {
        return adapter.headers = {'X-HEY': 'ohai'};
      });
      return it('picks up headers from .headers', function() {
        var hash,
            xhr;
        hash = adapter.ajaxOptions('/api/test', 'GET', {});
        expect(hash.beforeSend).to.not.be["null"];
        xhr = {setRequestHeader: function(key, value) {
            return this[key] = value;
          }};
        hash.beforeSend(xhr);
        return expect(xhr['X-HEY']).to.eq('ohai');
      });
    });
    return describe('.buildUrl', function() {
      return it('encodes ids', function() {
        return expect(this.adapter.buildUrl('message', 'asd@asd.com')).to.eq('/messages/asd%40asd.com');
      });
    });
  });
  return {};
});

define("coalesce-test/serializers/model", ['coalesce/model/model', 'coalesce/container'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/serializers/model";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Model = $__0.default;
  var Container = $__2.default;
  describe('ModelSerializer', function() {
    var App,
        serializer,
        session;
    App = null;
    session = null;
    serializer = null;
    beforeEach(function() {
      App = {};
      var User = function User() {
        $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
      };
      var $User = User;
      ($traceurRuntime.createClass)(User, {}, {}, Model);
      ;
      User.defineSchema({
        typeKey: 'user',
        attributes: {
          name: {type: 'string'},
          postCount: {
            type: 'number',
            transient: true
          }
        }
      });
      App.User = this.User = User;
      App.UserSerializer = Coalesce.ModelSerializer.extend({typeKey: 'user'});
      this.container = new Container();
      this.container.register('model:user', App.User);
      this.container.register('serializer:user', App.UserSerializer);
      session = this.container.lookup('session:main');
      return serializer = this.container.lookup('serializer:user');
    });
    describe('.deserialize', function() {
      return it('includes transient properties', function() {
        var data,
            user;
        data = {
          id: 1,
          name: 'Bro',
          post_count: 12
        };
        user = serializer.deserialize(data);
        return expect(user.postCount).to.eq(12);
      });
    });
    return describe('.serialize', function() {
      return it('does not include transient properties', function() {
        var data,
            user;
        user = session.build('user', {
          id: 1,
          name: 'Bro',
          postCount: 12
        });
        data = serializer.serialize(user);
        return expect(data.post_count).to.be.undefined;
      });
    });
  });
  return {};
});

define("coalesce-test/session/session.hierarchy", ['../support/schemas', 'coalesce/container'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/session/session.hierarchy";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var postWithComments = $__0.postWithComments;
  var Container = $__2.default;
  describe("Session", function() {
    beforeEach(function() {
      this.App = {};
      this.container = new Container();
      Coalesce.__container__ = this.container;
      this.container.register('adapter:main', Coalesce.RestAdapter);
      postWithComments.apply(this);
      this.adapter = this.container.lookup('adapter:main');
      this.container = this.adapter.container;
      this.adapter.load = function(model) {
        return Coalesce.Promise.resolve(model);
      };
      return this.adapter.flush = function(session) {
        var models;
        models = session.dirtyModels;
        return Coalesce.Promise.resolve(models.copy(true)).then(function(models) {
          return models.forEach(function(model) {
            return session.merge(model);
          });
        });
      };
    });
    describe('sibling sessions', function() {
      var adapter,
          sessionA,
          sessionB;
      sessionA = null;
      sessionB = null;
      adapter = null;
      beforeEach(function() {
        sessionA = this.adapter.newSession();
        sessionB = this.adapter.newSession();
        sessionA.merge(this.Post.create({
          id: "1",
          title: 'original'
        }));
        return sessionB.merge(this.Post.create({
          id: "1",
          title: 'original'
        }));
      });
      return it('updates are isolated', function() {
        var pA,
            pB,
            postA,
            postB;
        postA = null;
        postB = null;
        pA = sessionA.load('post', 1).then(function(post) {
          postA = post;
          return postA.title = "a was here";
        });
        pB = sessionB.load('post', 1).then(function(post) {
          postB = post;
          return postB.title = "b was here";
        });
        return Coalesce.Promise.all([pA, pB]).then(function() {
          expect(postA.title).to.eq("a was here");
          return expect(postB.title).to.eq("b was here");
        });
      });
    });
    return describe("child session", function() {
      var child,
          parent;
      parent = null;
      child = null;
      beforeEach(function() {
        parent = this.adapter.newSession();
        return child = parent.newSession();
      });
      it('.flushIntoParent flushes updates immediately', function() {
        parent.merge(this.Post.create({
          id: "1",
          title: 'original'
        }));
        return child.load('post', 1).then(function(childPost) {
          childPost.title = 'child version';
          return parent.load('post', 1).then(function(parentPost) {
            var f;
            expect(parentPost.title).to.eq('original');
            f = child.flushIntoParent();
            expect(parentPost.title).to.eq('child version');
            return f;
          });
        });
      });
      it('.flush waits for success before updating parent', function() {
        parent.merge(this.Post.create({
          id: "1",
          title: 'original'
        }));
        return child.load('post', 1).then(function(childPost) {
          childPost.title = 'child version';
          return parent.load('post', 1).then(function(parentPost) {
            var f;
            expect(parentPost.title).to.eq('original');
            f = child.flush();
            expect(parentPost.title).to.eq('original');
            return f.then(function() {
              return expect(parentPost.title).to.eq('child version');
            });
          });
        });
      });
      it('does not mutate parent session relationships', function() {
        var post;
        post = parent.merge(this.Post.create({
          id: "1",
          title: 'parent',
          comments: [this.Comment.create({
            id: '2',
            post: this.Post.create({id: "1"})
          })]
        }));
        expect(post.comments.length).to.eq(1);
        child.add(post);
        return expect(post.comments.length).to.eq(1);
      });
      return it('adds hasMany correctly', function() {
        var parentPost,
            post;
        parentPost = parent.merge(this.Post.create({
          id: "1",
          title: 'parent',
          comments: [this.Comment.create({
            id: '2',
            post: this.Post.create({id: "1"})
          })]
        }));
        post = child.add(parentPost);
        expect(post).to.not.eq(parentPost);
        expect(post.comments.length).to.eq(1);
        return expect(post.comments.firstObject).to.not.eq(parentPost.comments.firstObject);
      });
    });
  });
  return {};
});

define("coalesce-test/session/session", ['coalesce/model/model', 'coalesce/serializers/model', '../support/schemas', 'coalesce/container', 'coalesce/session/query'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "coalesce-test/session/session";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var Model = $__0.default;
  var ModelSerializer = $__2.default;
  var postWithComments = $__4.postWithComments;
  var Container = $__6.default;
  var Query = $__8.default;
  describe("Session", function() {
    var adapter,
        session;
    session = null;
    adapter = null;
    beforeEach(function() {
      this.App = {};
      this.container = new Container();
      Coalesce.__container__ = this.container;
      postWithComments.apply(this);
      adapter = this.container.lookup('adapter:main');
      this.container = adapter.container;
      return session = adapter.newSession();
    });
    describe('.build', function() {
      it('instantiates a model', function() {
        var post;
        post = session.build('post');
        expect(post).to.not.be["null"];
        return expect(session.getModel(post)).to.not.eq(post);
      });
      return it('instantiates a model with attributes', function() {
        var post;
        post = session.create('post', {title: 'test'});
        return expect(post.title).to.eq('test');
      });
    });
    describe('.create', function() {
      it('creates a model', function() {
        var post;
        post = session.create('post');
        expect(post).to.not.be["null"];
        return expect(session.getModel(post)).to.eq(post);
      });
      return it('creates a model with attributes', function() {
        var post;
        post = session.create('post', {title: 'test'});
        return expect(post.title).to.eq('test');
      });
    });
    describe('.deleteModel', function() {
      return it('deletes a model', function() {
        var post;
        post = session.merge(session.build('post', {id: 1}));
        session.deleteModel(post);
        return expect(post.isDeleted).to.be["true"];
      });
    });
    describe('.add', function() {
      it('works with lazy models', function() {
        var added,
            post;
        post = this.Post.create({id: "1"});
        added = session.add(post);
        return expect(added.session).to.eq(session);
      });
      it('reuses detached model', function() {
        var post;
        post = this.Post.create({title: 'test'});
        return expect(session.add(post)).to.eq(post);
      });
      return it('overwrites unloaded models', function() {
        var lazy,
            post;
        lazy = this.Post.create({id: '1'});
        session.add(lazy);
        post = session.merge(this.Post.create({
          id: '1',
          title: 'post'
        }));
        session.add(post);
        expect(session.getModel(lazy)).to.eq(post);
        session.add(lazy);
        return expect(session.getModel(lazy)).to.eq(post);
      });
    });
    describe('.invalidate', function() {
      return it('causes existing model to be reloaded', function() {
        var hit,
            post;
        post = session.merge(this.Post.create({
          id: '1',
          title: 'refresh me plz'
        }));
        hit = false;
        adapter.load = function(model) {
          expect(model).to.eq(post);
          hit = true;
          return Coalesce.Promise.resolve(model);
        };
        post.load();
        expect(hit).to.be["false"];
        session.invalidate(post);
        post.load();
        return expect(hit).to.be["true"];
      });
    });
    describe('.query', function() {
      it('returns a Query', function() {
        var res;
        adapter.query = (function(_this) {
          return function() {
            return Coalesce.Promise.resolve([_this.Post.create({id: 1})]);
          };
        })(this);
        return res = session.query(this.Post).then(function(posts) {
          return expect(posts).to.be.an.instanceOf(Query);
        });
      });
      return it('utilizes cache on subsequence calls', function() {
        var hit,
            res;
        hit = 0;
        adapter.query = (function(_this) {
          return function() {
            hit += 1;
            return Coalesce.Promise.resolve([_this.Post.create({id: 1})]);
          };
        })(this);
        return res = session.query(this.Post).then((function(_this) {
          return function(posts) {
            return session.query(_this.Post).then(function() {
              return expect(hit).to.eq(1);
            });
          };
        })(this));
      });
    });
    describe('.fetchQuery', function() {
      return it('synchronously returns a query', function() {
        var res;
        res = session.fetchQuery(this.Post);
        return expect(res).to.be.an.instanceOf(Query);
      });
    });
    describe('.refreshQuery', function() {
      return it('skips cache', function() {
        return it('utilizes cache on subsequence calls', function() {
          var hit,
              res;
          hit = 0;
          adapter.query = (function(_this) {
            return function() {
              hit += 1;
              return Coalesce.Promise.resolve([_this.Post.create({id: 1})]);
            };
          })(this);
          return res = session.query(this.Post).then(function(posts) {
            return session.refreshQuery(posts).then(function() {
              return expect(hit).to.eq(2);
            });
          });
        });
      });
    });
    describe('.invalidateQuery', function() {
      return it('clears cache', function() {
        var hit,
            res;
        hit = 0;
        adapter.query = (function(_this) {
          return function() {
            hit += 1;
            return Coalesce.Promise.resolve([_this.Post.create({id: 1})]);
          };
        })(this);
        return res = session.query(this.Post).then((function(_this) {
          return function(posts) {
            session.invalidateQuery(posts);
            return session.query(_this.Post).then(function() {
              return expect(hit).to.eq(2);
            });
          };
        })(this));
      });
    });
    describe('.invalidateQueries', function() {
      return it('clears cache for all queries', function() {
        var hit,
            res;
        hit = 0;
        adapter.query = (function(_this) {
          return function() {
            hit += 1;
            return Coalesce.Promise.resolve([_this.Post.create({id: 1})]);
          };
        })(this);
        return res = session.query(this.Post).then((function(_this) {
          return function(posts) {
            session.invalidateQueries(_this.Post);
            return session.query(_this.Post).then(function() {
              return expect(hit).to.eq(2);
            });
          };
        })(this));
      });
    });
    describe('.merge', function() {
      it('reuses detached model', function() {
        var post;
        post = this.Post.create({
          id: "1",
          title: 'test'
        });
        return expect(session.merge(post)).to.eq(post);
      });
      it('emites willMerge and didMerge', function() {
        var didMergeHit,
            post,
            willMergeHit;
        willMergeHit = false;
        didMergeHit = false;
        session.on('willMerge', function() {
          return willMergeHit = true;
        });
        session.on('didMerge', function() {
          return didMergeHit = true;
        });
        post = this.Post.create({
          id: "1",
          title: 'test'
        });
        session.merge(post);
        expect(willMergeHit).to.be["true"];
        return expect(didMergeHit).to.be["true"];
      });
      it('handles merging detached model with hasMany child already in session', function() {
        var comment,
            post;
        comment = session.merge(this.Comment.create({
          id: "1",
          body: "obscurity",
          post: this.Post.create({id: "2"})
        }));
        post = session.merge(this.Post.create({
          id: "2",
          comments: []
        }));
        post.comments.addObject(this.Comment.create({
          id: "1",
          body: "obscurity"
        }));
        return expect(post.comments[0]).to.eq(comment);
      });
      it('handles merging detached model with belongsTo child already in session', function() {
        var comment,
            post;
        post = session.merge(this.Post.create({
          id: "2",
          comments: [this.Comment.create({id: "1"})]
        }));
        comment = session.merge(this.Comment.create({
          id: "1",
          body: "obscurity",
          post: this.Post.create({
            id: "2",
            comments: [this.Comment.create({id: "1"})]
          })
        }));
        return expect(comment.post).to.eq(post);
      });
      it('handles merging detached model with lazy belongsTo reference', function() {
        var comment,
            post;
        post = session.merge(this.Post.create({
          id: "2",
          comments: []
        }));
        comment = session.merge(this.Comment.create({
          id: "1",
          body: "obscurity",
          post: this.Post.create({id: "2"})
        }));
        expect(post.comments[0]).to.eq(comment);
        return expect(post.isDirty).to.be["false"];
      });
      it('handles merging detached model with lazy hasMany reference', function() {
        var comment,
            post;
        comment = session.merge(this.Comment.create({
          id: "1",
          body: "obscurity",
          post: null
        }));
        post = session.merge(this.Post.create({
          id: "2",
          comments: [this.Comment.create({id: "1"})]
        }));
        expect(comment.post).to.eq(post);
        return expect(comment.isDirty).to.be["false"];
      });
      return it('reuses existing hasMany arrays', function() {
        var comments,
            post;
        post = session.merge(this.Post.create({
          id: "2",
          comments: []
        }));
        comments = post.comments;
        session.merge(this.Post.create({
          id: "2",
          comments: [this.Comment.create({
            id: "1",
            post: this.Post.create({id: "2"})
          })]
        }));
        return expect(comments.length).to.eq(1);
      });
    });
    describe('.markClean', function() {
      it('makes models no longer dirty', function() {
        var post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        post.title = 'dirty bastard';
        expect(post.isDirty).to.be["true"];
        session.markClean(post);
        return expect(post.isDirty).to.be["false"];
      });
      return it('works with already clean models', function() {
        var post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        expect(post.isDirty).to.be["false"];
        session.markClean(post);
        return expect(post.isDirty).to.be["false"];
      });
    });
    describe('.touch', function() {
      return it('makes the model dirty', function() {
        var post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        expect(post.isDirty).to.be["false"];
        session.touch(post);
        return expect(post.isDirty).to.be["true"];
      });
    });
    describe('flushing', function() {
      beforeEach(function() {
        return adapter.flush = function(session) {
          var models;
          models = session.dirtyModels;
          return Coalesce.Promise.resolve(models.copy(true)).then(function(models) {
            return models.forEach(function(model) {
              return session.merge(model);
            });
          });
        };
      });
      it('can update while flush is pending', function() {
        var f1,
            post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'original'
        }));
        post.title = 'update 1';
        f1 = session.flush();
        post.title = 'update 2';
        expect(post.title).to.eq('update 2');
        return f1.then(function() {
          expect(post.title).to.eq('update 2');
          post.title = 'update 3';
          return session.flush().then(function() {
            return expect(post.title).to.eq('update 3');
          });
        });
      });
      return it('emits willFlush event', function() {
        return it('can update while flush is pending', function() {
          var post,
              willFlushHit;
          willFlushHit = false;
          session.on('willFlush', function() {
            return willFlushHit = true;
          });
          post = session.merge(this.Post.create({
            id: "1",
            title: 'original'
          }));
          post.title = 'update 1';
          return session.flush().then(function() {
            return expect(willFlushHit).to.be["true"];
          });
        });
      });
    });
    describe('.isDirty', function() {
      it('is true when models are dirty', function() {
        var post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        expect(session.isDirty).to.be["false"];
        session.touch(post);
        return expect(session.isDirty).to.be["true"];
      });
      return it('becomes false after successful flush', function() {
        var post;
        post = session.merge(this.Post.create({
          id: "1",
          title: 'test'
        }));
        session.touch(post);
        expect(session.isDirty).to.be["true"];
        return session.flush().then(function() {
          return expect(session.isDirty).to.be["false"];
        });
      });
    });
    describe('.mergeData', function() {
      return it('should merge in data', function() {
        var post;
        post = session.mergeData({
          id: "1",
          title: "easy peazy"
        }, 'post');
        expect(post.title).to.eq('easy peazy');
        return expect(session.getModel(post)).to.eq(post);
      });
    });
    return context('with parent session', function() {
      var Post,
          parent;
      Post = null;
      parent = null;
      beforeEach(function() {
        parent = session;
        session = parent.newSession();
        return Post = this.Post;
      });
      describe('.query', function() {
        return it('queries', function() {
          adapter.query = function(type, query) {
            expect(query).to.eql({q: "herpin"});
            return Coalesce.Promise.resolve([Post.create({
              id: "1",
              title: 'herp'
            }), Post.create({
              id: "2",
              title: 'derp'
            })]);
          };
          return session.query('post', {q: "herpin"}).then(function(models) {
            return expect(models.length).to.eq(2);
          });
        });
      });
      describe('.load', function() {
        return it('loads from parent session', function() {
          parent.merge(Post.create({
            id: "1",
            title: "flash gordon"
          }));
          return session.load(Post, 1).then(function(post) {
            expect(post).to.not.eq(parent.getModel(post));
            return expect(post.title).to.eq('flash gordon');
          });
        });
      });
      return describe('.add', function() {
        return it('includes lazy relationships', function() {
          var comment,
              parentComment;
          parentComment = parent.merge(this.Comment.create({
            id: "1",
            post: Post.create({id: "2"})
          }));
          comment = session.add(parentComment);
          expect(comment).to.not.eq(parentComment);
          expect(comment.post).to.not.be.bull;
          return expect(comment.post.session).to.eq(session);
        });
      });
    });
  });
  return {};
});

define("coalesce-test/support/schemas", ['coalesce/model/model', 'coalesce/serializers/model'], function($__0,$__2) {
  "use strict";
  var __moduleName = "coalesce-test/support/schemas";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  var Model = $__0.default;
  var ModelSerializer = $__2.default;
  function postWithComments() {
    this.App = {};
    var Post = function Post() {
      $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
    };
    var $Post = Post;
    ($traceurRuntime.createClass)(Post, {}, {}, Coalesce.Model);
    Post.defineSchema({
      typeKey: 'post',
      attributes: {title: {type: 'string'}},
      relationships: {comments: {
          kind: 'hasMany',
          type: 'comment'
        }}
    });
    this.App.Post = this.Post = Post;
    this.container.register('model:post', Post);
    var Comment = function Comment() {
      $traceurRuntime.defaultSuperCall(this, $Comment.prototype, arguments);
    };
    var $Comment = Comment;
    ($traceurRuntime.createClass)(Comment, {}, {}, Coalesce.Model);
    Comment.defineSchema({
      typeKey: 'comment',
      attributes: {body: {type: 'string'}},
      relationships: {post: {
          kind: 'belongsTo',
          type: 'post'
        }}
    });
    this.App.Comment = this.Comment = Comment;
    this.container.register('model:comment', Comment);
  }
  function postWithEmbeddedComments() {
    postWithComments.apply(this);
    this.PostSerializer = ModelSerializer.extend({properties: {comments: {embedded: 'always'}}});
    this.container.register('serializer:post', this.PostSerializer);
  }
  function userWithPost() {
    this.App = {};
    var Post = function Post() {
      $traceurRuntime.defaultSuperCall(this, $Post.prototype, arguments);
    };
    var $Post = Post;
    ($traceurRuntime.createClass)(Post, {}, {}, Model);
    Post.defineSchema({
      typeKey: 'post',
      attributes: {title: {type: 'string'}},
      relationships: {user: {
          kind: 'belongsTo',
          type: 'user'
        }}
    });
    this.App.Post = this.Post = Post;
    var User = function User() {
      $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
    };
    var $User = User;
    ($traceurRuntime.createClass)(User, {}, {}, Model);
    ;
    User.defineSchema({
      typeKey: 'user',
      attributes: {name: {type: 'string'}},
      relationships: {post: {
          kind: 'belongsTo',
          type: 'post'
        }}
    });
    this.App.User = this.User = User;
    this.container.register('model:post', this.Post);
    this.container.register('model:user', this.User);
  }
  function groupWithMembersWithUsers() {
    var Group = function Group() {
      $traceurRuntime.defaultSuperCall(this, $Group.prototype, arguments);
    };
    var $Group = Group;
    ($traceurRuntime.createClass)(Group, {}, {}, Model);
    ;
    Group.defineSchema({
      typeKey: 'group',
      attributes: {name: {type: 'string'}},
      relationships: {
        members: {
          kind: 'hasMany',
          type: 'member'
        },
        user: {
          kind: 'belongsTo',
          type: 'user'
        }
      }
    });
    this.App.Group = this.Group = Group;
    var Member = function Member() {
      $traceurRuntime.defaultSuperCall(this, $Member.prototype, arguments);
    };
    var $Member = Member;
    ($traceurRuntime.createClass)(Member, {}, {}, Model);
    ;
    Member.defineSchema({
      typeKey: 'member',
      attributes: {role: {type: 'string'}},
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
    this.App.Member = this.Member = Member;
    var User = function User() {
      $traceurRuntime.defaultSuperCall(this, $User.prototype, arguments);
    };
    var $User = User;
    ($traceurRuntime.createClass)(User, {}, {}, Model);
    ;
    User.defineSchema({
      typeKey: 'user',
      attributes: {name: {type: 'string'}},
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
    this.App.User = this.User = User;
    this.container.register('model:group', this.Group);
    this.container.register('model:member', this.Member);
    this.container.register('model:user', this.User);
  }
  ;
  return {
    get postWithComments() {
      return postWithComments;
    },
    get postWithEmbeddedComments() {
      return postWithEmbeddedComments;
    },
    get userWithPost() {
      return userWithPost;
    },
    get groupWithMembersWithUsers() {
      return groupWithMembersWithUsers;
    },
    __esModule: true
  };
});
