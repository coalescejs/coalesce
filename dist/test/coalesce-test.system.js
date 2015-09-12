System.register('coalesce-test/active_model/adapter', ['coalesce/active_model/adapter'], function (_export) {
  'use strict';

  var ActiveModelAdapter;
  return {
    setters: [function (_coalesceActive_modelAdapter) {
      ActiveModelAdapter = _coalesceActive_modelAdapter['default'];
    }],
    execute: function () {
      describe("ActiveModelAdapter", function () {
        return describe('.pathForType', function () {
          return it('underscores and pluralizes', function () {
            var adapter;
            adapter = new ActiveModelAdapter({});
            return expect(adapter.pathForType('message_thread')).to.eq('message_threads');
          });
        });
      });
    }
  };
});
System.register('coalesce-test/collections/model_array', ['coalesce/namespace', 'coalesce/collections/model_array', 'coalesce/model/model', 'coalesce/model/attribute'], function (_export) {
  'use strict';

  var Coalesce, ModelArray, Model, attr;
  return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }, function (_coalesceCollectionsModel_array) {
      ModelArray = _coalesceCollectionsModel_array['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceModelAttribute) {
      attr = _coalesceModelAttribute['default'];
    }],
    execute: function () {
      describe('ModelArray', function () {
        var array;
        array = null;
        beforeEach(function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            typeKey: 'post',
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          this.Post = Post;
          return array = new ModelArray();
        });
        describe('removeObject', function () {
          return it('should remove based on `isEqual` equivalence', function () {
            array.addObject(this.Post.create({
              clientId: '1'
            }));
            array.removeObject(this.Post.create({
              clientId: '1'
            }));
            return expect(array.length).to.eq(0);
          });
        });
        describe('.copyTo', function () {
          var dest;
          dest = null;
          beforeEach(function () {
            return dest = new ModelArray();
          });
          it('should copy objects', function () {
            array.addObjects([this.Post.create({
              clientId: '1'
            }), this.Post.create({
              clientId: '2'
            })]);
            array.copyTo(dest);
            return expect(dest.length).to.eq(2);
          });
          return it('should remove objects not present in source array', function () {
            array.addObject(this.Post.create({
              clientId: '1'
            }));
            dest.addObject(this.Post.create({
              clientId: '2'
            }));
            array.copyTo(dest);
            expect(dest.length).to.eq(1);
            return expect(dest.objectAt(0).clientId).to.eq('1');
          });
        });
        return describe('.load', function () {
          beforeEach(function () {
            this.Post.reopen({
              load: function load() {
                this.loadCalled = true;
                return Coalesce.Promise.resolve(this);
              }
            });
            array.pushObject(this.Post.create({
              id: "1"
            }));
            return array.pushObject(this.Post.create({
              id: "2"
            }));
          });
          return it('should load all models', function () {
            return array.load().then(function () {
              expect(array.length).to.eq(2);
              return array.forEach(function (model) {
                return expect(model.loadCalled).to.be["true"];
              });
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/collections/model_set', ['coalesce/model/model', 'coalesce/collections/model_set'], function (_export) {
  'use strict';

  var Model, ModelSet;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceCollectionsModel_set) {
      ModelSet = _coalesceCollectionsModel_set['default'];
    }],
    execute: function () {
      describe('ModelSet', function () {
        beforeEach(function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            typeKey: 'post',
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          this.Post = Post;
          return this.set = new ModelSet();
        });
        it('removes based on isEqual', function () {
          var postA, postB;
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
        it('adds based on isEqual and always overwrites', function () {
          var postA, postB;
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
        it('copies', function () {
          var copy, copyA, copyB, postA, postB;
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
        it('deep copies', function () {
          var copy, copyA, copyB, postA, postB;
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
        return context('with model', function () {
          beforeEach(function () {
            this.post = this.Post.create({
              title: 'test',
              id: "1",
              clientId: "post1"
            });
            return this.set.add(this.post);
          });
          it('finds via getForClientId', function () {
            return expect(this.set.getForClientId("post1")).to.eq(this.post);
          });
          it('finds via getModel', function () {
            return expect(this.set.getModel(this.post)).to.eq(this.post);
          });
          return it('finds via getModel with alternate model', function () {
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
    }
  };
});
System.register('coalesce-test/context/base', ['coalesce/context/base', 'coalesce/model/model'], function (_export) {
  'use strict';

  var Context, Model;
  return {
    setters: [function (_coalesceContextBase) {
      Context = _coalesceContextBase['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }],
    execute: function () {
      describe('Context', function () {
        subject(function () {
          return new Context();
        });
        lazy('Post', function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          return Post;
        });
        lazy('config', function () {
          return {
            types: {
              post: this.Post
            }
          };
        });
        beforeEach(function () {
          if (this.config) {
            return this.subject.configure(this.config);
          }
        });
        describe('.constructor', function () {
          return it('creates a context', function () {
            return expect(this.subject.container).to.not.be["null"];
          });
        });
        describe('.configure', function () {
          return it('sets up the context via json config object', function () {
            return expect(this.subject.typeFor('post').typeKey).to.eq('post');
          });
        });
        describe('.typeFor', function () {
          subject('result', function () {
            return this.subject.typeFor(this.typeKey);
          });
          context('when type registered', function () {
            lazy('typeKey', function () {
              return 'post';
            });
            return it('returns the type', function () {
              return expect(this.result).to.eq(this.Post);
            });
          });
          return context('when type not registered', function () {
            lazy('typeKey', function () {
              return 'user';
            });
            return it('returns null', function () {
              return expect(this.result).to.be.undefined;
            });
          });
        });
        return describe('.configFor', function () {
          subject('result', function () {
            return this.subject.configFor('post');
          });
          return it('returns configuration', function () {
            return expect(this.result).to.not.be["null"];
          });
        });
      });
    }
  };
});
System.register('coalesce-test/context/config', ['coalesce/context/base', 'coalesce/model/model', 'coalesce/adapter'], function (_export) {
  'use strict';

  var Context, Config, Model, Adapter;
  return {
    setters: [function (_coalesceContextBase) {
      Context = _coalesceContextBase['default'];
      Config = _coalesceContextBase['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceAdapter) {
      Adapter = _coalesceAdapter['default'];
    }],
    execute: function () {
      describe('Config', function () {
        lazy('Post', function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          return Post;
        });
        lazy('pojoConfig', function () {
          return {
            types: {
              post: this.Post
            }
          };
        });
        lazy('context', function () {
          return new Context(this.pojoConfig);
        });
        subject(function () {
          return this.context.configFor('post');
        });
        describe('.type', function () {
          subject('result', function () {
            return this.subject.type;
          });
          return it('returns model type', function () {
            return expect(this.result).to.eq(this.Post);
          });
        });
        return describe('.get', function () {
          subject('result', function () {
            return this.subject.get('adapter');
          });
          return context('when default provider defined', function () {
            lazy('Adapter', function () {
              return (function (_Adapter) {
                babelHelpers.inherits(DefaultAdapter, _Adapter);

                function DefaultAdapter() {
                  babelHelpers.classCallCheck(this, DefaultAdapter);
                  babelHelpers.get(Object.getPrototypeOf(DefaultAdapter.prototype), 'constructor', this).apply(this, arguments);
                }

                return DefaultAdapter;
              })(Adapter);
            });
            lazy('pojoConfig', function () {
              return {
                adapter: this.Adapter,
                types: {
                  post: this.Post
                }
              };
            });
            it('returns instance of default provider', function () {
              return expect(this.result).to.be.an.instanceOf(this.Adapter);
            });
            return context('and explicit provider defined', function () {
              lazy('ExplicitAdapter', function () {
                return (function (_Adapter2) {
                  babelHelpers.inherits(ExplicitAdapter, _Adapter2);

                  function ExplicitAdapter() {
                    babelHelpers.classCallCheck(this, ExplicitAdapter);
                    babelHelpers.get(Object.getPrototypeOf(ExplicitAdapter.prototype), 'constructor', this).apply(this, arguments);
                  }

                  return ExplicitAdapter;
                })(Adapter);
              });
              lazy('pojoConfig', function () {
                var res;
                res = this._super.pojoConfig;
                res.types.post = {
                  "class": this.Post,
                  adapter: this.ExplicitAdapter
                };
                return res;
              });
              it('returns instance of explicit provider', function () {
                return expect(this.result).to.be.an.instanceOf(this.ExplicitAdapter);
              });
              return it('returns same provider instance on subsequence calls', function () {
                return expect(this.result).to.eq(this.subject.get('adapter'));
              });
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/id_manager', ['coalesce/model/model', 'coalesce/id_manager'], function (_export) {
  'use strict';

  var Model, IdManager;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceId_manager) {
      IdManager = _coalesceId_manager['default'];
    }],
    execute: function () {
      describe('IdManager', function () {
        subject(function () {
          return new IdManager();
        });
        lazy('Post', function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            typeKey: 'post',
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          return Post;
        });
        return describe('.reifyClientId', function () {
          it('sets clientId on new record', function () {
            var post;
            post = this.Post.create({
              title: 'new post'
            });
            expect(post.clientId).to.be["null"];
            this.subject.reifyClientId(post);
            return expect(post.clientId).to.not.be["null"];
          });
          return it('should set existing clientId on detached model', function () {
            var detached, post;
            post = this.Post.create({
              title: 'new post',
              id: "1"
            });
            expect(post.clientId).to.be["null"];
            this.subject.reifyClientId(post);
            expect(post.clientId).to.not.be["null"];
            detached = this.Post.create({
              title: 'different instance',
              id: "1"
            });
            expect(detached.clientId).to.be["null"];
            this.subject.reifyClientId(detached);
            return expect(detached.clientId).to.eq(post.clientId);
          });
        });
      });
    }
  };
});
System.register('coalesce-test/merge_strategies/per_field', ['coalesce/merge/per_field', 'coalesce/model/model', 'coalesce/context/default'], function (_export) {
  'use strict';

  var PerField, Model, Context;
  return {
    setters: [function (_coalesceMergePer_field) {
      PerField = _coalesceMergePer_field['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }],
    execute: function () {
      describe('PerField', function () {
        beforeEach(function () {
          var User = (function (_Model) {
            babelHelpers.inherits(User, _Model);

            function User() {
              babelHelpers.classCallCheck(this, User);
              babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
            }

            return User;
          })(Model);

          ;
          User.defineSchema({
            attributes: {
              name: {
                type: 'string'
              }
            },
            relationships: {
              posts: {
                kind: 'hasMany',
                type: 'post'
              }
            }
          });
          this.User = User;

          var Comment = (function (_Model2) {
            babelHelpers.inherits(Comment, _Model2);

            function Comment() {
              babelHelpers.classCallCheck(this, Comment);
              babelHelpers.get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);
            }

            return Comment;
          })(Model);

          ;
          Comment.defineSchema({
            attributes: {
              body: {
                type: 'string'
              }
            },
            relationships: {
              post: {
                kind: 'belongsTo',
                type: 'post'
              }
            }
          });
          this.Comment = Comment;

          var Post = (function (_Model3) {
            babelHelpers.inherits(Post, _Model3);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              },
              body: {
                type: 'string'
              },
              createdAt: {
                type: 'date'
              }
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
          this.Post = Post;
          this.context = new Context({
            types: {
              user: User,
              comment: Comment,
              post: Post
            }
          });
          return this.session = this.context.newSession();
        });
        it('keeps modified fields from both versions', function () {
          var post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'titleA',
            body: 'bodyA',
            createdAt: new Date(1985, 7, 22)
          }));
          post.title = 'titleB';
          this.session.merge(this.Post.create({
            id: '1',
            title: 'titleA',
            body: 'bodyB',
            createdAt: null,
            comments: []
          }));
          expect(post.title).to.eq('titleB');
          expect(post.body).to.eq('bodyB');
          expect(post.createdAt).to.be["null"];
          post.comments.addObject(this.session.create('comment'));
          this.session.merge(this.Post.create({
            id: '1',
            title: 'titleB',
            body: 'bodyB',
            user: this.User.create({
              id: '2',
              posts: [this.Post.create({
                id: '1'
              })]
            })
          }));
          expect(post.comments.length).to.eq(1);
          expect(post.comments[0].id).to.be["null"];
          return expect(post.user.id).to.eq('2');
        });
        it('keeps ours if same field modified in both versions', function () {
          var post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'titleA',
            body: 'bodyA'
          }));
          post.title = 'titleB';
          post.body = 'bodyB';
          this.session.merge(this.Post.create({
            id: '1',
            title: 'titleC',
            body: 'bodyC',
            user: null,
            comments: []
          }));
          expect(post.title).to.eq('titleB');
          expect(post.body).to.eq('bodyB');
          post.comments.addObject(this.Comment.create());
          post.user = this.User.create();
          this.session.merge(this.Post.create({
            id: '1',
            title: 'titleB',
            body: 'bodyB',
            user: this.User.create({
              id: '2'
            }),
            comments: [this.Comment.create({
              id: '3'
            })]
          }));
          expect(post.comments.length).to.eq(1);
          expect(post.comments[0].id).to.be["null"];
          return expect(post.user.id).to.be["null"];
        });
        it('keeps ours if only modified in ours', function () {
          var newData, post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'titleA',
            body: 'bodyA',
            user: this.User.create({
              id: '2',
              posts: [this.Post.create({
                id: '1'
              })]
            }),
            comments: [this.Comment.create({
              id: '3',
              user: this.User.create({
                id: '2'
              }),
              post: this.Post.create({
                id: '1'
              })
            })]
          }));
          this.session.create(this.Comment, {
            post: post
          });
          expect(post.comments.length).to.eq(2);
          newData = this.Post.create({
            id: '1',
            title: 'titleA',
            body: 'bodyA',
            user: this.User.create({
              id: '2',
              posts: [this.Post.create({
                id: '1'
              })]
            }),
            comments: [this.Comment.create({
              id: '3',
              user: this.User.create({
                id: '2'
              }),
              post: this.Post.create({
                id: '1'
              })
            })]
          });
          newData.comments[0].post = newData;
          this.session.merge(newData);
          return expect(post.comments.length).to.eq(2);
        });
        it('still merges model if removed from belongsTo in ours', function () {
          var post, user;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            user: this.User.create({
              id: '2',
              posts: [this.Post.create({
                id: '1'
              })]
            })
          }));
          user = post.user;
          post.user = null;
          this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            user: this.User.create({
              id: '2',
              name: 'grodon',
              posts: [this.Post.create({
                id: '1'
              })]
            })
          }));
          expect(post.user).to.be["null"];
          return expect(user.name).to.eq('grodon');
        });
        it('still merges model if removed from hasMany in ours', function () {
          var comment, post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            comments: [this.Comment.create({
              id: '2',
              body: 'herp',
              post: this.Post.create({
                id: '1'
              })
            })]
          }));
          comment = post.comments[0];
          post.comments.clear();
          expect(post.comments.length).to.eq(0);
          this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            comments: [this.Comment.create({
              id: '2',
              body: 'derp',
              post: this.Post.create({
                id: '1'
              })
            })]
          }));
          expect(post.comments.length).to.eq(0);
          return expect(comment.body).to.eq('derp');
        });
        it('still merges model if sibling added to hasMany', function () {
          var comment, post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            comments: [this.Comment.create({
              id: '2',
              body: 'herp',
              post: this.Post.create({
                id: '1'
              })
            })]
          }));
          post.comments.addObject(this.session.create(this.Comment, {
            body: 'derp'
          }));
          comment = post.comments[0];
          this.session.merge(this.Post.create({
            id: '1',
            title: 'herp',
            comments: [this.Comment.create({
              id: '2',
              body: 'derp?',
              post: this.Post.create({
                id: '1'
              })
            })]
          }));
          expect(post.comments.length).to.eq(2);
          return expect(comment.body).to.eq('derp?');
        });
        return it('will preserve local updates after multiple merges', function () {
          var post;
          post = this.session.merge(this.Post.create({
            id: '1',
            title: 'A'
          }));
          post.title = 'B';
          this.session.merge(this.Post.create({
            id: '1',
            title: 'C'
          }));
          expect(post.title).to.eq('B');
          this.session.merge(this.Post.create({
            id: '1',
            title: 'C'
          }));
          return expect(post.title).to.eq('B');
        });
      });
    }
  };
});
System.register('coalesce-test/model/errors', ['coalesce/model/errors'], function (_export) {
  'use strict';

  var Errors;
  return {
    setters: [function (_coalesceModelErrors) {
      Errors = _coalesceModelErrors['default'];
    }],
    execute: function () {
      describe('Errors', function () {
        return describe('forEach', function () {
          it('should iterate over field errors', function () {
            var count, errors;
            errors = new Errors({
              title: ['is too short']
            });
            count = 0;
            errors.forEach(function (fieldErrors, key) {
              expect(key).to.eq('title');
              expect(fieldErrors).to.eql(['is too short']);
              return count++;
            });
            return expect(count).to.eq(1);
          });
          return it('should not error if no content specified', function () {
            var count, errors;
            errors = new Errors();
            count = 0;
            errors.forEach(function (key, errors) {
              return count++;
            });
            return expect(count).to.eq(0);
          });
        });
      });
    }
  };
});
System.register('coalesce-test/model/has_many', ['coalesce/model/model', 'coalesce/collections/has_many_array', 'coalesce/context/container'], function (_export) {
  'use strict';

  var Model, HasManyArray, Container;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceCollectionsHas_many_array) {
      HasManyArray = _coalesceCollectionsHas_many_array['default'];
    }, function (_coalesceContextContainer) {
      Container = _coalesceContextContainer['default'];
    }],
    execute: function () {
      describe('hasMany', function () {
        return it('accepts custom collectionType option', function () {
          var CustomArray = (function (_HasManyArray) {
            babelHelpers.inherits(CustomArray, _HasManyArray);

            function CustomArray() {
              babelHelpers.classCallCheck(this, CustomArray);
              babelHelpers.get(Object.getPrototypeOf(CustomArray.prototype), 'constructor', this).apply(this, arguments);
            }

            return CustomArray;
          })(HasManyArray);

          ;

          var User = (function (_Model) {
            babelHelpers.inherits(User, _Model);

            function User() {
              babelHelpers.classCallCheck(this, User);
              babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
            }

            return User;
          })(Model);

          ;
          var user;
          User.defineSchema({
            relationships: {
              tags: {
                kind: 'hasMany',
                type: 'tag',
                collectionType: CustomArray
              }
            }
          });
          User.typeKey = 'user';

          var Tag = (function (_Model2) {
            babelHelpers.inherits(Tag, _Model2);

            function Tag() {
              babelHelpers.classCallCheck(this, Tag);
              babelHelpers.get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);
            }

            return Tag;
          })(Model);

          ;
          Tag.typeKey = 'tag';
          user = new User();
          return expect(user.tags).to.be.an.instanceOf(CustomArray);
        });
      });
    }
  };
});
System.register('coalesce-test/model/model', ['coalesce/collections/model_set', 'coalesce/model/model', 'coalesce/context/default'], function (_export) {
  'use strict';

  var ModelSet, Model, Context;
  return {
    setters: [function (_coalesceCollectionsModel_set) {
      ModelSet = _coalesceCollectionsModel_set['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }],
    execute: function () {
      describe('Model', function () {
        var session;
        session = null;
        beforeEach(function () {
          var User = (function (_Model) {
            babelHelpers.inherits(User, _Model);

            function User() {
              babelHelpers.classCallCheck(this, User);
              babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
            }

            return User;
          })(Model);

          ;
          User.defineSchema({
            attributes: {
              name: {
                type: 'string'
              },
              raw: {},
              createdAt: {
                type: 'date'
              }
            }
          });
          User.typeKey = 'user';
          this.User = User;
          this.context = new Context({
            types: {
              user: User
            }
          });
          return session = this.context.newSession();
        });
        describe('.id', function () {
          return it('triggers metaWillChange and metaDidChange', function () {
            var didHit, user, willHit;
            user = new this.User();
            willHit = false;
            didHit = false;
            user.metaWillChange = function () {
              return willHit = true;
            };
            user.metaDidChange = function () {
              return didHit = true;
            };
            user.id = 1;
            expect(willHit).to.be["true"];
            return expect(didHit).to.be["true"];
          });
        });
        describe('.errors', function () {
          return it('triggers metaWillChange and metaDidChange', function () {
            var didHit, user, willHit;
            user = new this.User();
            willHit = false;
            didHit = false;
            user.metaWillChange = function () {
              return willHit = true;
            };
            user.metaDidChange = function () {
              return didHit = true;
            };
            user.errors = {
              name: 'invalid'
            };
            expect(willHit).to.be["true"];
            return expect(didHit).to.be["true"];
          });
        });
        describe('.isDirty', function () {
          it('returns false when detached', function () {
            return expect(new this.User().isDirty).to.be["false"];
          });
          it('returns true when dirty', function () {
            var user;
            user = null;
            Object.defineProperty(session, 'dirtyModels', {
              get: function get() {
                return new ModelSet([user]);
              }
            });
            user = new this.User();
            user.session = session;
            return expect(user.isDirty).to.be["true"];
          });
          return it('returns false when untouched', function () {
            var user;
            Object.defineProperty(session, 'dirtyModels', {
              get: function get() {
                return new ModelSet();
              }
            });
            user = new this.User();
            user.session = session;
            return expect(user.isDirty).to.be["false"];
          });
        });
        describe('.diff', function () {
          it('detects differences in complex object attributes', function () {
            var left, right;
            left = new this.User({
              raw: {
                test: 'a'
              }
            });
            right = new this.User({
              raw: {
                test: 'b'
              }
            });
            return expect(left.diff(right)).to.eql([{
              type: 'attr',
              name: 'raw'
            }]);
          });
          return it('detects no difference in complex object attributes', function () {
            var left, right;
            left = new this.User({
              raw: {
                test: 'a'
              }
            });
            right = new this.User({
              raw: {
                test: 'a'
              }
            });
            return expect(left.diff(right)).to.eql([]);
          });
        });
        describe('.copy', function () {
          it('copies dates', function () {
            var copy, date, user;
            date = new Date(2014, 7, 22);
            user = new this.User({
              createdAt: date
            });
            copy = user.copy();
            return expect(user.createdAt.getTime()).to.eq(copy.createdAt.getTime());
          });
          it('deep copies complex object attributes', function () {
            var copy, user;
            user = new this.User({
              raw: {
                test: {
                  value: 'a'
                }
              }
            });
            copy = user.copy();
            expect(user).to.not.eq(copy);
            expect(user.raw).to.not.eq(copy.raw);
            expect(user.raw.test).to.not.eq(copy.raw.test);
            return expect(user.raw).to.eql(copy.raw);
          });
          return it('deep copies array attributes', function () {
            var copy, user;
            user = new this.User({
              raw: ['a', 'b', 'c']
            });
            copy = user.copy();
            expect(user).to.not.eq(copy);
            expect(user.raw).to.not.eq(copy.raw);
            return expect(user.raw).to.eql(copy.raw);
          });
        });
        describe('.attributes', function () {
          return it('returns map of attributes', function () {
            var attrs;
            attrs = this.User.attributes;
            return expect(attrs.size).to.eq(3);
          });
        });
        return describe('subclassing', function () {
          beforeEach(function () {
            var User;
            User = this.User;

            var Admin = (function (_User) {
              babelHelpers.inherits(Admin, _User);

              function Admin() {
                babelHelpers.classCallCheck(this, Admin);
                babelHelpers.get(Object.getPrototypeOf(Admin.prototype), 'constructor', this).apply(this, arguments);
              }

              return Admin;
            })(User);

            ;
            Admin.defineSchema({
              attributes: {
                role: {
                  type: 'string'
                }
              }
            });
            this.Admin = Admin;

            var Guest = (function (_User2) {
              babelHelpers.inherits(Guest, _User2);

              function Guest() {
                babelHelpers.classCallCheck(this, Guest);
                babelHelpers.get(Object.getPrototypeOf(Guest.prototype), 'constructor', this).apply(this, arguments);
              }

              return Guest;
            })(User);

            ;
            Guest.defineSchema({
              attributes: {
                anonymous: {
                  type: 'boolean'
                }
              }
            });
            return this.Guest = Guest;
          });
          it('can add fields', function () {
            return expect(this.Admin.fields.get('role')).to.exist;
          });
          it('inherits fields from parent', function () {
            return expect(this.Admin.fields.get('name')).to.exist;
          });
          it('does not modify the parent fields', function () {
            return expect(this.User.fields.get('role')).to.not.exist;
          });
          return it('can share common parent class', function () {
            this.Admin.attributes;
            return expect(this.Guest.attributes.get('anonymous')).to.not.be.undefined;
          });
        });
      });
    }
  };
});
System.register('coalesce-test/model/relationships', ['../support/configs', 'coalesce/model/model', 'coalesce/context/default'], function (_export) {
  'use strict';

  var userWithProfile, groupWithMembersWithUsers, Model, Context;
  return {
    setters: [function (_supportConfigs) {
      userWithProfile = _supportConfigs.userWithProfile;
      groupWithMembersWithUsers = _supportConfigs.groupWithMembersWithUsers;
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }],
    execute: function () {
      describe("relationships", function () {
        lazy('context', function () {
          var User = (function (_Model) {
            babelHelpers.inherits(User, _Model);

            function User() {
              babelHelpers.classCallCheck(this, User);
              babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
            }

            return User;
          })(Model);

          ;
          User.defineSchema({
            attributes: {
              name: {
                type: 'string'
              }
            }
          });

          var Post = (function (_Model2) {
            babelHelpers.inherits(Post, _Model2);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              }
            },
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

          var Comment = (function (_Model3) {
            babelHelpers.inherits(Comment, _Model3);

            function Comment() {
              babelHelpers.classCallCheck(this, Comment);
              babelHelpers.get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);
            }

            return Comment;
          })(Model);

          ;
          Comment.defineSchema({
            attributes: {
              text: {
                type: 'string'
              }
            },
            relationships: {
              post: {
                kind: 'belongsTo',
                type: 'post'
              }
            }
          });
          return new Context({
            types: {
              user: User,
              post: Post,
              comment: Comment
            }
          });
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('User', function () {
          return this.context.typeFor('user');
        });
        lazy('Comment', function () {
          return this.context.typeFor('comment');
        });
        context('one->many', function () {
          it('belongsTo updates inverse', function () {
            var comment, post;
            post = this.session.create('post');
            comment = this.session.create('comment');
            comment.post = post;
            expect(post.comments.toArray()).to.eql([comment]);
            comment.post = null;
            return expect(post.comments.toArray()).to.eql([]);
          });
          it('belongsTo updates inverse on delete', function () {
            var comment, post;
            post = this.session.create('post');
            comment = this.session.create('comment');
            comment.post = post;
            expect(post.comments.toArray()).to.eql([comment]);
            this.session.deleteModel(comment);
            return expect(post.comments.toArray()).to.eql([]);
          });
          it('belongsTo updates inverse on delete when initially added unloaded', function () {
            var comment, post, unloadedComment;
            post = this.session.merge(this.session.build('post', {
              id: 1,
              comments: [this.Comment.create({
                id: 2
              })]
            }));
            unloadedComment = post.comments[0];
            comment = this.session.merge(this.session.build('comment', {
              id: 2,
              post: this.Post.create({
                id: 1
              })
            }));
            unloadedComment.post = post;
            expect(post.comments.toArray()).to.eql([unloadedComment]);
            this.session.deleteModel(unloadedComment);
            return expect(post.comments.toArray()).to.eql([]);
          });
          it('belongsTo updates inverse when set during create', function () {
            var comment, post;
            comment = this.session.create('comment', {
              post: this.session.create('post')
            });
            post = comment.post;
            expect(post.comments.toArray()).to.eql([comment]);
            comment.post = null;
            return expect(post.comments.toArray()).to.eql([]);
          });
          it('belongsTo adds object to session', function () {
            var comment, post;
            post = this.session.merge(this.Post.create({
              id: '1'
            }));
            comment = this.session.merge(this.Comment.create({
              id: '2'
            }));
            comment.post = this.Post.create({
              id: '1'
            });
            return expect(comment.post).to.eq(post);
          });
          it('hasMany updates inverse', function () {
            var comment, post;
            post = this.session.create('post');
            comment = this.session.create('comment');
            post.comments.addObject(comment);
            expect(comment.post).to.eq(post);
            post.comments.removeObject(comment);
            return expect(comment.post).to.be["null"];
          });
          it('hasMany updates inverse on delete', function () {
            var comment, post;
            post = this.session.create('post');
            comment = this.session.create('comment');
            post.comments.addObject(comment);
            expect(comment.post).to.eq(post);
            this.session.deleteModel(post);
            return expect(comment.post).to.be["null"];
          });
          it('hasMany updates inverse on create', function () {
            var comment, post;
            post = this.session.create('post', {
              comments: []
            });
            comment = this.session.create('comment');
            post.comments.addObject(comment);
            expect(comment.post).to.eq(post);
            this.session.deleteModel(post);
            return expect(comment.post).to.be["null"];
          });
          it('hasMany adds to session', function () {
            var comment, post;
            post = this.session.merge(this.Post.create({
              id: '1',
              comments: []
            }));
            comment = this.session.merge(this.Comment.create({
              id: '2',
              post: null
            }));
            post.comments.addObject(this.Comment.create({
              id: '2'
            }));
            return expect(post.comments[0]).to.eq(comment);
          });
          return it('hasMany content can be set directly', function () {
            var post;
            post = this.session.create('post', {
              comments: [this.Comment.create({
                id: '2'
              })]
            });
            expect(post.comments.length).to.eq(1);
            return expect(post.comments[0].id).to.eq('2');
          });
        });
        context('one->one', function () {
          lazy('context', function () {
            return new Context(userWithProfile());
          });
          it('updates inverse', function () {
            var profile, user;
            profile = this.session.create('profile');
            user = this.session.create('user');
            profile.user = user;
            expect(user.profile).to.eq(profile);
            profile.user = null;
            return expect(user.profile).to.be["null"];
          });
          return it('updates inverse on delete', function () {
            var profile, user;
            profile = this.session.create('profile');
            user = this.session.create('user');
            profile.user = user;
            expect(user.profile).to.eq(profile);
            this.session.deleteModel(profile);
            return expect(user.profile).to.be["null"];
          });
        });
        return context('multiple one->many', function () {
          lazy('context', function () {
            return new Context(groupWithMembersWithUsers());
          });
          return it('updates inverse on delete', function () {
            var group, member, user;
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
    }
  };
});
System.register('coalesce-test/rest/adapter', ['../support/configs', 'coalesce/rest/context'], function (_export) {
  'use strict';

  var postWithComments, Context;
  return {
    setters: [function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
    }, function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }],
    execute: function () {
      describe("RestAdapter", function () {
        lazy('context', function () {
          return new Context(postWithComments());
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('Comment', function () {
          return this.context.typeFor('comment');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        subject(function () {
          return this.context.configFor('post').get('adapter');
        });
        describe('.mergePayload', function () {
          lazy('data', function () {
            return {
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
          });
          it('should merge with typeKey as context', function () {
            var post;
            post = this.subject.mergePayload(this.data, 'post', this.session)[0];
            expect(post.title).to.eq('ma post');
            return expect(post).to.eq(this.session.getModel(post));
          });
          return it('should merge with no context', function () {
            var models;
            models = this.subject.mergePayload(this.data, null, this.session);
            return expect(models.size).to.eq(3);
          });
        });
        describe('.ajaxOptions', function () {
          beforeEach(function () {
            return this.subject.headers = {
              'X-HEY': 'ohai'
            };
          });
          return it('picks up headers from .headers', function () {
            var hash, xhr;
            hash = this.subject.ajaxOptions('/api/test', 'GET', {});
            expect(hash.beforeSend).to.not.be["null"];
            xhr = {
              setRequestHeader: function setRequestHeader(key, value) {
                return this[key] = value;
              }
            };
            hash.beforeSend(xhr);
            return expect(xhr['X-HEY']).to.eq('ohai');
          });
        });
        return describe('.buildUrl', function () {
          return it('encodes ids', function () {
            return expect(this.subject.buildUrl('message', 'asd@asd.com')).to.eq('/messages/asd%40asd.com');
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.acceptance', ['coalesce/model/model', 'coalesce/rest/context', '../support/configs', '../support/async'], function (_export) {
  'use strict';

  var Model, Context, postWithComments, groupWithMembersWithUsers, delay;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
      groupWithMembersWithUsers = _supportConfigs.groupWithMembersWithUsers;
    }, function (_supportAsync) {
      delay = _supportAsync.delay;
    }],
    execute: function () {
      describe("rest acceptance scenarios", function () {
        lazy('context', function () {
          return new Context();
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        describe("managing groups with embedded members", function () {
          lazy('context', function () {
            return new Context(groupWithMembersWithUsers());
          });
          it('creates new group and then deletes a member', function () {
            var childSession, group, member, user;
            this.server.r('POST:/users', function () {
              return {
                users: {
                  client_id: user.clientId,
                  id: 1,
                  name: "wes"
                }
              };
            });
            this.server.r('POST:/groups', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.group.members[0].role).to.eq('chief');
              return {
                groups: {
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
                }
              };
            });
            childSession = this.session.newSession();
            user = childSession.create('user', {
              name: 'wes'
            });
            group = null;
            member = null;
            return childSession.flushIntoParent().then((function (_this) {
              return function () {
                expect(user.id).to.not.be["null"];
                expect(_this.server.h).to.eql(['POST:/users']);
                childSession = _this.session.newSession();
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
                return childSession.flushIntoParent().then(function () {
                  expect(_this.server.h).to.eql(['POST:/users', 'POST:/groups']);
                  expect(user.id).to.not.be["null"];
                  expect(group.id).to.not.be["null"];
                  expect(group.members.length).to.eq(1);
                  expect(user.groups.length).to.eq(1);
                  expect(user.members.length).to.eq(1);
                  expect(member.id).to.not.be["null"];
                  childSession = _this.session.newSession();
                  member = childSession.add(member);
                  user = childSession.add(user);
                  group = childSession.add(group);
                  childSession.deleteModel(member);
                  expect(user.members.length).to.eq(0);
                  expect(group.members.length).to.eq(0);
                  expect(user.groups.length).to.eq(1);
                  _this.server.r('PUT:/groups/2', function () {
                    return {
                      groups: {
                        client_id: group.clientId,
                        id: 2,
                        name: "brogrammers",
                        members: [],
                        user: 1
                      }
                    };
                  });
                  return childSession.flushIntoParent().then(function () {
                    expect(member.isDeleted).to.be["true"];
                    expect(group.members.length).to.eq(0);
                    expect(user.members.length).to.eq(0);
                    expect(user.groups.length).to.eq(1);
                    return expect(_this.server.h).to.eql(['POST:/users', 'POST:/groups', 'PUT:/groups/2']);
                  });
                });
              };
            })(this));
          });
          it("doesn't choke when loading a group without a members key", function () {
            this.server.r('GET:/groups', {
              groups: [{
                client_id: null,
                id: "1",
                name: "brogrammers",
                user: "1"
              }]
            });
            return this.session.query("group").then((function (_this) {
              return function (result) {
                expect(_this.server.h).to.eql(['GET:/groups']);
                expect(result.length).to.eq(1);
                expect(result[0].name).to.eq("brogrammers");
                return expect(result[0].groups).to.be.undefined;
              };
            })(this));
          });
          return it('adds a member to an existing group', function () {
            this.server.r('GET:/groups/1', function () {
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
            });
            return this.session.load("group", 1).then((function (_this) {
              return function (group) {
                var childGroup, childSession, existingMember, member, promise;
                expect(_this.server.h).to.eql(['GET:/groups/1']);
                childSession = _this.session.newSession();
                childGroup = childSession.add(group);
                existingMember = childGroup.members[0];
                expect(existingMember.user).to.not.be["null"];
                expect(existingMember.user.isDetached).to.be["false"];
                member = childSession.create('member', {
                  name: "mollie"
                });
                childGroup.members.addObject(member);
                expect(childGroup.members.length).to.eq(2);
                expect(group.members.length).to.eq(1);
                _this.server.r('PUT:/groups/1', function () {
                  return {
                    groups: {
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
                    }
                  };
                });
                promise = childSession.flushIntoParent().then(function () {
                  expect(childGroup.members.length).to.eq(2);
                  expect(group.members.length).to.eq(2);
                  return expect(_this.server.h).to.eql(['GET:/groups/1', 'PUT:/groups/1']);
                });
                expect(group.members.length).to.eq(2);
                return promise;
              };
            })(this));
          });
        });
        describe("managing comments", function () {
          lazy('context', function () {
            return new Context(postWithComments());
          });
          lazy('Post', function () {
            return this.context.typeFor('post');
          });
          lazy('Comment', function () {
            return this.context.typeFor('comment');
          });
          return it('creates a new comment within a child session', function () {
            var childPost, childSession, comment, post, promise;
            this.server.r('POST:/comments', function () {
              return {
                comment: {
                  client_id: comment.clientId,
                  id: "3",
                  message: "#2",
                  post: "1"
                }
              };
            });
            post = this.session.merge(this.Post.create({
              id: "1",
              title: "brogrammer's guide to beer pong",
              comments: []
            }));
            this.session.merge(this.Comment.create({
              id: "2",
              message: "yo",
              post: post
            }));
            childSession = this.session.newSession();
            childPost = childSession.add(post);
            comment = childSession.create('comment', {
              message: '#2',
              post: childPost
            });
            expect(childPost.comments.length).to.eq(2);
            promise = childSession.flushIntoParent().then((function (_this) {
              return function () {
                expect(childPost.comments.length).to.eq(2);
                return expect(post.comments.length).to.eq(2);
              };
            })(this));
            expect(childPost.comments.length).to.eq(2);
            expect(post.comments.length).to.eq(2);
            return promise;
          });
        });
        describe("two levels of embedded", function () {
          lazy('context', function () {
            var User = (function (_Model) {
              babelHelpers.inherits(User, _Model);

              function User() {
                babelHelpers.classCallCheck(this, User);
                babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
              }

              return User;
            })(Model);

            ;
            User.defineSchema({
              attributes: {
                name: {
                  type: 'string'
                }
              },
              relationships: {
                profile: {
                  kind: 'belongsTo',
                  type: 'profile',
                  embedded: 'always'
                }
              }
            });

            var Profile = (function (_Model2) {
              babelHelpers.inherits(Profile, _Model2);

              function Profile() {
                babelHelpers.classCallCheck(this, Profile);
                babelHelpers.get(Object.getPrototypeOf(Profile.prototype), 'constructor', this).apply(this, arguments);
              }

              return Profile;
            })(Model);

            ;
            Profile.defineSchema({
              attributes: {
                bio: {
                  type: 'string'
                }
              },
              relationships: {
                user: {
                  kind: 'belongsTo',
                  type: 'user'
                },
                tags: {
                  kind: 'hasMany',
                  type: 'tag',
                  embedded: 'always'
                }
              }
            });

            var Tag = (function (_Model3) {
              babelHelpers.inherits(Tag, _Model3);

              function Tag() {
                babelHelpers.classCallCheck(this, Tag);
                babelHelpers.get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);
              }

              return Tag;
            })(Model);

            ;
            Tag.defineSchema({
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
            return new Context({
              types: {
                user: User,
                profile: Profile,
                tag: Tag
              }
            });
          });
          lazy('User', function () {
            return this.context.typeFor('user');
          });
          lazy('Profile', function () {
            return this.context.typeFor('profile');
          });
          lazy('Tag', function () {
            return this.context.typeFor('tag');
          });
          return it('deletes root', function () {
            var user;
            this.server.r('DELETE:/users/1', {});
            this.User.create({
              id: '1'
            });
            user = this.session.merge(this.User.create({
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
            this.session.deleteModel(user);
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['DELETE:/users/1']);
                return expect(user.isDeleted).to.be["true"];
              };
            })(this));
          });
        });
        describe('multiple belongsTo', function () {
          lazy('context', function () {
            var Foo = (function (_Model4) {
              babelHelpers.inherits(Foo, _Model4);

              function Foo() {
                babelHelpers.classCallCheck(this, Foo);
                babelHelpers.get(Object.getPrototypeOf(Foo.prototype), 'constructor', this).apply(this, arguments);
              }

              return Foo;
            })(Model);

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

            var Bar = (function (_Model5) {
              babelHelpers.inherits(Bar, _Model5);

              function Bar() {
                babelHelpers.classCallCheck(this, Bar);
                babelHelpers.get(Object.getPrototypeOf(Bar.prototype), 'constructor', this).apply(this, arguments);
              }

              return Bar;
            })(Model);

            ;
            Bar.defineSchema({
              typeKey: 'bar',
              relationships: {
                foos: {
                  kind: 'hasMany',
                  type: 'foo'
                }
              }
            });

            var Baz = (function (_Model6) {
              babelHelpers.inherits(Baz, _Model6);

              function Baz() {
                babelHelpers.classCallCheck(this, Baz);
                babelHelpers.get(Object.getPrototypeOf(Baz.prototype), 'constructor', this).apply(this, arguments);
              }

              return Baz;
            })(Model);

            ;
            Baz.defineSchema({
              typeKey: 'baz',
              relationships: {
                foos: {
                  kind: 'hasMany',
                  type: 'foo'
                }
              }
            });
            return new Context({
              types: {
                foo: Foo,
                bar: Bar,
                baz: Baz
              }
            });
          });
          return it('sets ids properly', function () {
            var bar, baz, childSession, foo;
            this.server.r('POST:/bars', function () {
              return {
                bar: {
                  client_id: bar.clientId,
                  id: "1"
                }
              };
            });
            this.server.r('POST:/bazs', function () {
              return {
                baz: {
                  client_id: baz.clientId,
                  id: "1"
                }
              };
            });
            this.server.r('POST:/foos', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.foo.bar).to.eq(1);
              expect(data.foo.baz).to.eq(1);
              return {
                foo: {
                  client_id: foo.clientId,
                  id: "1",
                  bar: "1",
                  baz: "1"
                }
              };
            });
            childSession = this.session.newSession();
            foo = childSession.create('foo');
            bar = childSession.create('bar');
            baz = childSession.create('baz');
            foo.bar = bar;
            foo.baz = baz;
            return childSession.flushIntoParent().then((function (_this) {
              return function () {
                expect(_this.server.h.length).to.eq(3);
                expect(_this.server.h[_this.server.h.length - 1]).to.eq('POST:/foos');
                expect(_this.server.h).to.include('POST:/bars');
                expect(_this.server.h).to.include('POST:/bazs');
                expect(foo.id).to.not.be["null"];
                expect(bar.id).to.not.be["null"];
                expect(baz.id).to.not.be["null"];
                expect(foo.bar).to.not.be["null"];
                expect(foo.baz).to.not.be["null"];
                expect(bar.foos.length).to.eq(1);
                return expect(baz.foos.length).to.eq(1);
              };
            })(this));
          });
        });
        describe('deep embedded relationship with leaf referencing a model without an inverse', function () {
          lazy('context', function () {
            var Template = (function (_Model7) {
              babelHelpers.inherits(Template, _Model7);

              function Template() {
                babelHelpers.classCallCheck(this, Template);
                babelHelpers.get(Object.getPrototypeOf(Template.prototype), 'constructor', this).apply(this, arguments);
              }

              return Template;
            })(Model);

            ;
            Template.defineSchema({
              attributes: {
                subject: {
                  type: 'string'
                }
              }
            });

            var Campaign = (function (_Model8) {
              babelHelpers.inherits(Campaign, _Model8);

              function Campaign() {
                babelHelpers.classCallCheck(this, Campaign);
                babelHelpers.get(Object.getPrototypeOf(Campaign.prototype), 'constructor', this).apply(this, arguments);
              }

              return Campaign;
            })(Model);

            ;
            Campaign.defineSchema({
              attributes: {
                name: {
                  type: 'string'
                }
              },
              relationships: {
                campaignSteps: {
                  kind: 'hasMany',
                  type: 'campaign_step',
                  embedded: 'always'
                }
              }
            });

            var CampaignStep = (function (_Model9) {
              babelHelpers.inherits(CampaignStep, _Model9);

              function CampaignStep() {
                babelHelpers.classCallCheck(this, CampaignStep);
                babelHelpers.get(Object.getPrototypeOf(CampaignStep.prototype), 'constructor', this).apply(this, arguments);
              }

              return CampaignStep;
            })(Model);

            ;
            CampaignStep.defineSchema({
              relationships: {
                campaign: {
                  kind: 'belongsTo',
                  type: 'campaign'
                },
                campaignTemplates: {
                  kind: 'hasMany',
                  type: 'campaign_template',
                  embedded: 'always'
                }
              }
            });

            var CampaignTemplate = (function (_Model10) {
              babelHelpers.inherits(CampaignTemplate, _Model10);

              function CampaignTemplate() {
                babelHelpers.classCallCheck(this, CampaignTemplate);
                babelHelpers.get(Object.getPrototypeOf(CampaignTemplate.prototype), 'constructor', this).apply(this, arguments);
              }

              return CampaignTemplate;
            })(Model);

            ;
            CampaignTemplate.defineSchema({
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
            return new Context({
              types: {
                template: Template,
                campaign: Campaign,
                campaign_template: CampaignTemplate,
                campaign_step: CampaignStep
              }
            });
          });
          it('creates new embedded children with reference to new hasMany', function () {
            var calls, campaign, campaignStep, campaignStep2, campaignTemplate, campaignTemplate2, childSession, delaySequence, template, template2;
            calls = 0;
            delaySequence = function (fn) {
              var delayAmount;
              delayAmount = calls * 100;
              calls++;
              return delay(delayAmount, fn);
            };
            this.server.r('POST:/templates', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              return delaySequence((function (_this) {
                return function () {
                  if (data.template.client_id === template.clientId) {
                    return {
                      templates: {
                        client_id: template.clientId,
                        id: 2,
                        subject: 'topological sort'
                      }
                    };
                  } else {
                    return {
                      templates: {
                        client_id: template2.clientId,
                        id: 5,
                        subject: 'do you speak it?'
                      }
                    };
                  }
                };
              })(this));
            });
            this.server.r('PUT:/campaigns/1', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.campaign.campaign_steps[0].campaign_templates[0].template).to.eq(2);
              expect(data.campaign.campaign_steps[1].campaign_templates[0].template).to.eq(5);
              return delaySequence(function () {
                return {
                  campaigns: {
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
                  }
                };
              });
            });
            campaign = this.session.merge(this.session.build('campaign', {
              id: 1,
              campaignSteps: []
            }));
            childSession = this.session.newSession();
            campaign = childSession.add(campaign);
            campaignStep = childSession.create('campaign_step', {
              campaign: campaign
            });
            campaignTemplate = childSession.create('campaign_template');
            campaignStep.campaignTemplates.pushObject(campaignTemplate);
            template = childSession.create('template');
            template.subject = 'topological sort';
            campaignTemplate.template = template;
            campaignStep2 = childSession.create('campaign_step', {
              campaign: campaign
            });
            campaignTemplate2 = childSession.create('campaign_template');
            campaignStep2.campaignTemplates.pushObject(campaignTemplate2);
            template2 = childSession.create('template');
            template2.subject = 'do you speak it?';
            campaignTemplate2.template = template2;
            return childSession.flush().then((function (_this) {
              return function () {
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
                return expect(_this.server.h).to.eql(['POST:/templates', 'POST:/templates', 'PUT:/campaigns/1']);
              };
            })(this));
          });
          return it('save changes to parent when children not loaded in child session', function () {
            var campaign, childSession, step, step2;
            this.server.r('PUT:/campaigns/1', function (xhr) {
              var data;
              return data = JSON.parse(xhr.requestBody);
            });
            campaign = this.session.merge(this.session.build('campaign', {
              name: 'old name',
              id: 1,
              campaignSteps: []
            }));
            step = this.session.merge(this.session.build('campaign_step', {
              id: 2,
              campaign: campaign,
              campaignTemplates: []
            }));
            step2 = this.session.merge(this.session.build('campaign_step', {
              id: 4,
              campaign: campaign,
              campaignTemplates: []
            }));
            this.session.merge(this.session.build('campaign_template', {
              id: 3,
              campaignStep: step
            }));
            expect(campaign.campaignSteps[0]).to.eq(step);
            childSession = this.session.newSession();
            campaign = childSession.add(campaign);
            campaign.name = 'new name';
            return childSession.flush().then((function (_this) {
              return function () {
                expect(campaign.name).to.eq('new name');
                return expect(_this.server.h).to.eql(['PUT:/campaigns/1']);
              };
            })(this));
          });
        });
        return describe('belongsTo without inverse', function () {
          lazy('context', function () {
            var Contact = (function (_Model11) {
              babelHelpers.inherits(Contact, _Model11);

              function Contact() {
                babelHelpers.classCallCheck(this, Contact);
                babelHelpers.get(Object.getPrototypeOf(Contact.prototype), 'constructor', this).apply(this, arguments);
              }

              return Contact;
            })(Model);

            ;
            Contact.defineSchema({
              attributes: {
                name: {
                  type: 'string'
                }
              },
              relationships: {
                account: {
                  kind: 'belongsTo',
                  type: 'account'
                }
              }
            });

            var Account = (function (_Model12) {
              babelHelpers.inherits(Account, _Model12);

              function Account() {
                babelHelpers.classCallCheck(this, Account);
                babelHelpers.get(Object.getPrototypeOf(Account.prototype), 'constructor', this).apply(this, arguments);
              }

              return Account;
            })(Model);

            ;
            Account.defineSchema({
              attributes: {
                name: {
                  type: 'string'
                }
              }
            });
            return new Context({
              types: {
                contact: Contact,
                account: Account
              }
            });
          });
          lazy('session', function () {
            return this.context.newSession();
          });
          return it('creates hierarchy', function () {
            var contact;
            this.server.r('POST:/contacts', function () {
              return {
                contact: {
                  id: 1,
                  client_id: contact.clientId,
                  name: "test contact",
                  account: 2
                }
              };
            });
            this.server.r('POST:/accounts', function () {
              return {
                account: {
                  id: 2,
                  client_id: contact.account.clientId,
                  name: "test account"
                }
              };
            });
            contact = this.session.create('contact', {
              name: 'test contact'
            });
            contact.account = this.session.create('account', {
              name: 'test account'
            });
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['POST:/accounts', 'POST:/contacts']);
                return expect(contact.account.id).to.eq("2");
              };
            })(this));
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.concurrent', ['coalesce/namespace', 'coalesce/rest/context', '../support/configs', '../support/async'], function (_export) {
  'use strict';

  var Coalesce, Context, post, delay, respond;
  return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }, function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      post = _supportConfigs.post;
    }, function (_supportAsync) {
      delay = _supportAsync.delay;
    }],
    execute: function () {

      respond = function (xhr, error, status) {
        if (status == null) {
          status = 422;
        }
        return xhr.respond(status, {
          "Content-Type": "application/json"
        }, JSON.stringify(error));
      };

      describe("rest concurrent flushes", function () {
        lazy('context', function () {
          return new Context(post());
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('all flushes resolve', function () {
          var f1, f2, post;
          this.server.r('PUT:/posts/1', function (xhr) {
            var data;
            data = JSON.parse(xhr.requestBody);
            return {
              posts: {
                id: 1,
                title: data.post.title,
                submitted: "true"
              }
            };
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'twerkin',
            submitted: false
          }));
          post.title = 'update1';
          f1 = this.session.flush();
          post.title = 'update2';
          f2 = this.session.flush();
          return Coalesce.Promise.all([f1, f2]).then((function (_this) {
            return function () {
              expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
              return expect(post.title).to.eq('update2');
            };
          })(this));
        });
        xit('second flush waits for first to complete', function () {
          var calls, f1, f2, post;
          calls = 0;
          adapter.runLater = function (callback) {
            var delay;
            delay = calls > 0 ? 0 : 10;
            calls++;
            return Coalesce.backburner.run.later(callback, delay);
          };
          this.server.r('PUT:/posts/1', function (xhr) {
            var data;
            data = JSON.parse(xhr.requestBody);
            return {
              posts: {
                id: 1,
                title: data.post.title,
                submitted: "true"
              }
            };
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'twerkin',
            submitted: false
          }));
          post.title = 'update1';
          f1 = this.session.flush();
          post.title = 'update2';
          f2 = this.session.flush();
          return Coalesce.Promise.all([f1, f2]).then((function (_this) {
            return function () {
              expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
              return expect(post.title).to.eq('update2');
            };
          })(this));
        });
        it('three concurrent flushes', function () {
          var calls, f1, f2, f3, post;
          calls = 0;
          this.server.r('PUT:/posts/1', function (xhr) {
            var delayAmount;
            delayAmount = calls % 2 === 1 ? 0 : 10;
            calls++;
            return delay(delayAmount, function () {
              var data;
              data = JSON.parse(xhr.requestBody);
              return {
                posts: {
                  id: 1,
                  title: data.post.title,
                  submitted: "true"
                }
              };
            });
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'twerkin',
            submitted: false
          }));
          post.title = 'update1';
          f1 = this.session.flush();
          post.title = 'update2';
          f2 = this.session.flush();
          post.title = 'update3';
          f3 = this.session.flush();
          return Coalesce.Promise.all([f1, f2, f3]).then((function (_this) {
            return function () {
              expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1', 'PUT:/posts/1']);
              return expect(post.title).to.eq('update3');
            };
          })(this));
        });
        it('cascades failures', function () {
          var calls, f1, f2, f3, post;
          calls = 0;
          this.server.r('PUT:/posts/1', function (xhr) {
            var delayAmount;
            delayAmount = calls % 2 === 1 ? 0 : 10;
            calls++;
            return delay(delayAmount, (function (_this) {
              return function () {
                var data, rev;
                data = JSON.parse(xhr.requestBody);
                if (data.post.title === 'update1') {
                  respond(xhr, {
                    error: "twerkin too hard"
                  }, 500);
                }
                rev = parseInt(data.post.title.split("update")[1]) + 1;
                return {
                  posts: {
                    id: 1,
                    title: data.post.title,
                    submitted: "true",
                    rev: rev
                  }
                };
              };
            })(this));
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'twerkin',
            submitted: false,
            rev: 1
          }));
          post.title = 'update1';
          f1 = this.session.flush();
          post.title = 'update2';
          f2 = this.session.flush();
          post.title = 'update3';
          f3 = this.session.flush();
          return f3.then(null, (function (_this) {
            return function () {
              var shadow;
              expect(_this.server.h).to.eql(['PUT:/posts/1']);
              expect(post.title).to.eq('update3');
              shadow = _this.session.getShadow(post);
              return expect(shadow.title).to.eq('twerkin');
            };
          })(this));
        });
        return it('can retry after failure', function () {
          var count, post;
          count = 0;
          this.server.r('PUT:/posts/1', function (xhr) {
            var data;
            data = JSON.parse(xhr.requestBody);
            if (count++ === 0) {
              respond(xhr, {
                error: "plz twerk again"
              }, 500);
            }
            return {
              posts: {
                id: 1,
                title: data.post.title,
                submitted: "true"
              }
            };
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'twerkin',
            submitted: false
          }));
          post.title = 'update1';
          return this.session.flush().then(null, (function (_this) {
            return function () {
              var shadow;
              expect(post.title).to.eq('update1');
              shadow = _this.session.getShadow(post);
              expect(shadow.title).to.eq('twerkin');
              return _this.session.flush().then(function () {
                expect(post.title).to.eq('update1');
                shadow = _this.session.getShadow(post);
                return expect(shadow.title).to.eq('update1');
              });
            };
          })(this));
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.errors', ['coalesce/rest/context', 'coalesce/model/errors', '../support/configs', '../support/async'], function (_export) {
  'use strict';

  var Context, Errors, post, delay, respond;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_coalesceModelErrors) {
      Errors = _coalesceModelErrors['default'];
    }, function (_supportConfigs) {
      post = _supportConfigs.post;
    }, function (_supportAsync) {
      delay = _supportAsync.delay;
    }],
    execute: function () {

      respond = function (xhr, error, status) {
        if (status == null) {
          status = 422;
        }
        return xhr.respond(status, {
          "Content-Type": "application/json"
        }, JSON.stringify(error));
      };

      describe("rest with errors", function () {
        lazy('context', function () {
          return new Context(post());
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        context('on update', function () {
          it('handles validation errors', function () {
            this.server.r('PUT:/posts/1', function (xhr) {
              return respond(xhr, {
                errors: {
                  title: 'is too short',
                  created_at: 'cannot be in the past'
                }
              });
            });
            this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                expect(post.title).to.eq('test');
                post.title = '';
                return _this.session.flush().then(null, function () {
                  expect(post.hasErrors).to.be["true"];
                  expect(post.title).to.eq('');
                  expect(post.errors.title).to.eq('is too short');
                  expect(post.errors.createdAt).to.eq('cannot be in the past');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1']);
                });
              };
            })(this));
          });
          it('overwrites existing errors when error-only payload returned', function () {
            var post;
            this.server.r('PUT:/posts/1', function (xhr) {
              return respond(xhr, {
                errors: {
                  title: 'is too short'
                }
              });
            });
            post = this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            post.title = '';
            post.errors = new Errors({
              title: 'is not good'
            });
            expect(post.errors.title).to.eq('is not good');
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(post.hasErrors).to.be["true"];
                expect(post.title).to.eq('');
                expect(post.errors.title).to.eq('is too short');
                return expect(_this.server.h).to.eql(['PUT:/posts/1']);
              };
            })(this));
          });
          it('handles payload with error properties', function () {
            this.server.r('PUT:/posts/1', function (xhr) {
              return respond(xhr, {
                post: {
                  id: 1,
                  title: 'test',
                  errors: {
                    title: 'is too short'
                  }
                }
              });
            });
            this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                expect(post.title).to.eq('test');
                post.title = '';
                return _this.session.flush().then(null, function () {
                  expect(post.hasErrors).to.be["true"];
                  expect(post.title).to.eq('');
                  expect(post.errors.title).to.eq('is too short');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1']);
                });
              };
            })(this));
          });
          it('merges payload with error properties and higher rev', function () {
            this.server.r('PUT:/posts/1', function (xhr) {
              return respond(xhr, {
                post: {
                  id: 1,
                  title: '',
                  rev: 10,
                  errors: {
                    title: 'is too short'
                  }
                }
              });
            });
            this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                expect(post.title).to.eq('test');
                post.title = '';
                return _this.session.flush().then(null, function () {
                  expect(post.hasErrors).to.be["true"];
                  expect(post.title).to.eq('');
                  expect(post.errors.title).to.eq('is too short');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1']);
                });
              };
            })(this));
          });
          it('merges payload with error and latest client changes against latest client version', function () {
            this.server.r('PUT:/posts/1', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              return respond(xhr, {
                post: {
                  id: 1,
                  title: 'Something',
                  client_rev: data.post.client_rev,
                  errors: {
                    title: 'cannot be empty'
                  }
                }
              });
            });
            this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                expect(post.title).to.eq('test');
                post.title = '';
                return _this.session.flush().then(null, function () {
                  expect(post.hasErrors).to.be["true"];
                  expect(post.title).to.eq('Something');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1']);
                });
              };
            })(this));
          });
          return it('empty errors object should deserialize without errors', function () {
            this.server.r('PUT:/posts/1', function () {
              return {
                post: {
                  id: 1,
                  title: '',
                  errors: {}
                }
              };
            });
            this.session.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                expect(post.title).to.eq('test');
                post.title = '';
                return _this.session.flush().then(null, function () {
                  expect(post.hasErrors).to.be["false"];
                  expect(post.title).to.eq('');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1']);
                });
              };
            })(this));
          });
        });
        context('on create', function () {
          it('handles 422', function () {
            var post;
            this.server.r('POST:/posts', function (xhr) {
              return respond(xhr, {
                errors: {
                  title: 'is lamerz'
                }
              });
            });
            post = this.session.create('post', {
              title: 'errorz'
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                return expect(post.errors.title).to.eq('is lamerz');
              };
            })(this));
          });
          it('handle arbitrary errors', function () {
            var post;
            this.server.r('POST:/posts', function (xhr) {
              return respond(xhr, {
                error: "something is wrong"
              }, 500);
            });
            post = this.session.create('post', {
              title: 'errorz'
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(_this.session.newModels.has(post)).to.be["true"];
                return expect(post.isNew).to.be["true"];
              };
            })(this));
          });
          it('handle errors with multiple staggered creates', function () {
            var calls, post1, post2;
            calls = 0;
            this.server.r('POST:/posts', function (xhr) {
              var delayAmount;
              delayAmount = calls % 2 === 1 ? 0 : 1000;
              calls++;
              return delay(delayAmount, function () {
                return respond(xhr, {}, 0);
              });
            });
            post1 = this.session.create('post', {
              title: 'bad post'
            });
            post2 = this.session.create('post', {
              title: 'another bad post'
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(_this.session.newModels.has(post1)).to.be["true"];
                expect(_this.session.newModels.has(post2)).to.be["true"];
                expect(post1.isNew).to.be["true"];
                return expect(post2.isNew).to.be["true"];
              };
            })(this));
          });
          it('merges payload with latest client changes against latest client version', function () {
            var post;
            this.server.r('POST:/posts', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              return respond(xhr, {
                post: {
                  title: 'Something',
                  client_id: data.post.client_id,
                  client_rev: data.post.client_rev,
                  errors: {
                    title: 'cannot be empty'
                  }
                }
              });
            });
            post = this.session.create('post', {
              title: ''
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                return expect(post.title).to.eq('Something');
              };
            })(this));
          });
          it('succeeds after retry', function () {
            var post;
            this.server.r('POST:/posts', function (xhr) {
              return respond(xhr, {
                errors: {
                  title: 'is lamerz'
                }
              });
            });
            post = this.session.create('post', {
              title: 'errorz'
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(post.errors.title).to.eq('is lamerz');
                _this.server.r('POST:/posts', function (xhr) {
                  var data;
                  data = JSON.parse(xhr.requestBody);
                  return {
                    post: {
                      title: 'linkbait',
                      id: 1,
                      client_id: data.post.client_id,
                      client_rev: data.post.client_rev
                    }
                  };
                });
                _this.session.title = 'linkbait';
                return _this.session.flush().then(function () {
                  expect(post.title).to.eq('linkbait');
                  return expect(_this.server.h).to.eql(['POST:/posts', 'POST:/posts']);
                });
              };
            })(this));
          });
          return it('succeeds after retry when failure merged data', function () {
            var post;
            this.server.r('POST:/posts', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              return respond(xhr, {
                post: {
                  title: 'Something',
                  client_id: data.post.client_id,
                  client_rev: data.post.client_rev,
                  errors: {
                    title: 'is lamerz'
                  }
                }
              });
            });
            post = this.session.create('post', {
              title: 'errorz'
            });
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(post.title).to.eq('Something');
                expect(post.errors.title).to.eq('is lamerz');
                _this.server.r('POST:/posts', function (xhr) {
                  var data;
                  data = JSON.parse(xhr.requestBody);
                  return {
                    post: {
                      title: 'linkbait',
                      id: 1,
                      client_id: data.post.client_id,
                      client_rev: data.post.client_rev
                    }
                  };
                });
                _this.session.title = 'linkbait';
                return _this.session.flush().then(function () {
                  expect(post.title).to.eq('linkbait');
                  expect(_this.server.h).to.eql(['POST:/posts', 'POST:/posts']);
                  return expect(post.hasErrors).to.be["false"];
                });
              };
            })(this));
          });
        });
        context('when querying', function () {
          it('does not merge into @session', function () {
            this.server.r('GET:/posts', function (xhr) {
              return respond(xhr, {}, 0, {
                responseText: ""
              });
            });
            return this.session.query('post').then(null, function (err) {
              return expect(err.status).to.eq(0);
            });
          });
          return context('in child session', function () {
            lazy('session', function () {
              return this._super.session.newSession();
            });
            it('merges payload with latest client changes against latest client version', function () {
              var post;
              this.server.r('POST:/posts', function (xhr) {
                var data;
                data = JSON.parse(xhr.requestBody);
                return respond(xhr, {
                  post: {
                    title: 'Something',
                    client_id: data.post.client_id,
                    client_rev: data.post.client_rev,
                    errors: {
                      title: 'cannot be empty'
                    }
                  }
                });
              });
              post = this.session.create('post', {
                title: ''
              });
              return this.session.flush().then(null, (function (_this) {
                return function () {
                  return expect(post.title).to.eq('Something');
                };
              })(this));
            });
            it('succeeds after retry', function () {
              var post;
              this.server.r('POST:/posts', function (xhr) {
                return respond(xhr, {
                  errors: {
                    title: 'is lamerz'
                  }
                });
              });
              post = this.session.create('post', {
                title: 'errorz'
              });
              return this.session.flush().then(null, (function (_this) {
                return function () {
                  expect(post.errors.title).to.eq('is lamerz');
                  _this.server.r('POST:/posts', function (xhr) {
                    var data;
                    data = JSON.parse(xhr.requestBody);
                    return {
                      post: {
                        title: 'linkbait',
                        id: 1,
                        client_id: data.post.client_id,
                        client_rev: data.post.client_rev
                      }
                    };
                  });
                  _this.session.title = 'linkbait';
                  return _this.session.flush().then(function () {
                    expect(post.title).to.eq('linkbait');
                    return expect(_this.server.h).to.eql(['POST:/posts', 'POST:/posts']);
                  });
                };
              })(this));
            });
            return it('succeeds after retry when failure merged data', function () {
              var post;
              this.server.r('POST:/posts', function (xhr) {
                var data;
                data = JSON.parse(xhr.requestBody);
                return respond(xhr, {
                  post: {
                    title: 'Something',
                    client_id: data.post.client_id,
                    client_rev: data.post.client_rev,
                    errors: {
                      title: 'is lamerz'
                    }
                  }
                });
              });
              post = this.session.create('post', {
                title: 'errorz'
              });
              return this.session.flush().then(null, (function (_this) {
                return function () {
                  expect(post.title).to.eq('Something');
                  _this.server.r('POST:/posts', function (xhr) {
                    var data;
                    data = JSON.parse(xhr.requestBody);
                    return {
                      post: {
                        title: 'linkbait',
                        id: 1,
                        client_id: data.post.client_id,
                        client_rev: data.post.client_rev
                      }
                    };
                  });
                  _this.session.title = 'linkbait';
                  return _this.session.flush().then(function () {
                    expect(post.title).to.eq('linkbait');
                    return expect(_this.server.h).to.eql(['POST:/posts', 'POST:/posts']);
                  });
                };
              })(this));
            });
          });
        });
        context('on load', function () {
          return [401, 403, 404].forEach(function (errorCode) {
            return it("handles " + errorCode, function () {
              this.server.r('GET:/posts/1', function (xhr) {
                return respond(xhr, {}, errorCode);
              });
              return this.session.load('post', 1).then(null, (function (_this) {
                return function (post) {
                  expect(post.hasErrors).to.be["true"];
                  expect(post.errors.status).to.eq(errorCode);
                  return expect(_this.server.h).to.eql(['GET:/posts/1']);
                };
              })(this));
            });
          });
        });
        return context('on delete', function () {
          it('retains deleted state', function () {
            var post;
            this.server.r('DELETE:/posts/1', function (xhr) {
              return respond(xhr, {}, 0);
            });
            post = this.session.merge(new this.Post({
              id: 1,
              title: 'errorz'
            }));
            this.session.deleteModel(post);
            expect(post.isDeleted).to.be["true"];
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(post.isDirty).to.be["true"];
                return expect(post.isDeleted).to.be["true"];
              };
            })(this));
          });
          return it('retains deleted state on multiple models and succeeds subsequently', function () {
            var post1, post2;
            this.server.r('DELETE:/posts/1', function (xhr) {
              return delay(1000, function () {
                return respond(xhr, {}, 0);
              });
            });
            this.server.r('DELETE:/posts/2', function (xhr) {
              return respond(xhr, {}, 0);
            });
            post1 = this.session.merge(new this.Post({
              id: 1,
              title: 'bad post'
            }));
            post2 = this.session.merge(new this.Post({
              id: 2,
              title: 'another bad post'
            }));
            this.session.deleteModel(post1);
            this.session.deleteModel(post2);
            expect(post1.isDeleted).to.be["true"];
            expect(post2.isDeleted).to.be["true"];
            return this.session.flush().then(null, (function (_this) {
              return function () {
                expect(post1.isDirty).to.be["true"];
                expect(post1.isDeleted).to.be["true"];
                expect(post2.isDirty).to.be["true"];
                expect(post2.isDeleted).to.be["true"];
                _this.server.r('DELETE:/posts/1', function () {
                  return {};
                });
                _this.server.r('DELETE:/posts/2', function () {
                  return {};
                });
                return _this.session.flush().then(function () {
                  expect(post1.isDirty).to.be["false"];
                  expect(post1.isDeleted).to.be["true"];
                  expect(post2.isDirty).to.be["false"];
                  return expect(post2.isDeleted).to.be["true"];
                });
              };
            })(this));
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.meta', ['coalesce/rest/context', '../support/configs'], function (_export) {
  'use strict';

  var Context, post;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      post = _supportConfigs.post;
    }],
    execute: function () {
      describe("rest with metadata", function () {
        lazy('context', function () {
          return new Context(post());
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('loads', function () {
          this.server.r('GET:/posts/1', {
            meta: {
              traffic: 'heavy'
            },
            posts: {
              id: 1,
              title: 'mvcc ftw'
            }
          });
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.meta.traffic).to.eq('heavy');
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              return expect(_this.server.h).to.eql(['GET:/posts/1']);
            };
          })(this));
        });
        it('saves', function () {
          var post;
          this.server.r('POST:/posts', function () {
            return {
              meta: {
                traffic: 'heavy'
              },
              posts: {
                client_id: post.clientId,
                id: 1,
                title: 'mvcc ftw'
              }
            };
          });
          post = this.session.create('post');
          post.title = 'mvcc ftw';
          return this.session.flush().then((function (_this) {
            return function (result) {
              expect(result[0].meta.traffic).to.eq('heavy');
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              return expect(_this.server.h).to.eql(['POST:/posts']);
            };
          })(this));
        });
        it('updates', function () {
          this.server.r('PUT:/posts/1', function () {
            return {
              meta: {
                traffic: 'heavy'
              },
              posts: {
                id: 1,
                title: 'updated'
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(post.title).to.eq('test');
              post.title = 'updated';
              return _this.session.flush().then(function (result) {
                expect(result[0].meta.traffic).to.eq('heavy');
                expect(post.title).to.eq('updated');
                return expect(_this.server.h).to.eql(['PUT:/posts/1']);
              });
            };
          })(this));
        });
        it('updates multiple times', function () {
          var post;
          this.server.r('PUT:/posts/1', function () {
            return {
              meta: {
                traffic: 'heavy'
              },
              posts: {
                id: 1,
                title: 'updated'
              }
            };
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          expect(post.title).to.eq('test');
          post.title = 'updated';
          return this.session.flush().then((function (_this) {
            return function (result) {
              expect(result[0].meta.traffic).to.eq('heavy');
              expect(post.title).to.eq('updated');
              expect(_this.server.h).to.eql(['PUT:/posts/1']);
              _this.server.r('PUT:/posts/1', function () {
                return {
                  meta: {
                    traffic: 'lighter'
                  },
                  posts: {
                    id: 1,
                    title: 'updated again'
                  }
                };
              });
              post.title = 'updated again';
              return _this.session.flush().then(function (result) {
                expect(result[0].meta.traffic).to.eq('lighter');
                expect(post.title).to.eq('updated again');
                return expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
              });
            };
          })(this));
        });
        it('deletes', function () {
          this.server.r('DELETE:/posts/1', {
            meta: {
              traffic: 'heavy'
            }
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('test');
              _this.session.deleteModel(post);
              return _this.session.flush().then(function (result) {
                expect(result[0].meta.traffic).to.eq('heavy');
                expect(post.isDeleted).to.be["true"];
                return expect(_this.server.h).to.eql(['DELETE:/posts/1']);
              });
            };
          })(this));
        });
        it('refreshes', function () {
          this.server.r('GET:/posts/1', {
            meta: {
              traffic: 'lighter'
            },
            posts: {
              id: 1,
              title: 'something new'
            }
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.title).to.eq('test');
              expect(_this.server.h).to.eql([]);
              return _this.session.refresh(post).then(function (post) {
                expect(post.title).to.eq('something new');
                expect(post.meta.traffic).to.eq('lighter');
                return expect(_this.server.h).to.eql(['GET:/posts/1']);
              });
            };
          })(this));
        });
        it('finds', function () {
          this.server.r('GET:/posts', function (xhr) {
            expect(xhr.url).to.contain("q=aardvarks");
            return {
              meta: {
                traffic: 'heavy'
              },
              posts: [{
                id: 1,
                title: 'aardvarks explained'
              }, {
                id: 2,
                title: 'aardvarks in depth'
              }]
            };
          });
          return this.session.find('post', {
            q: 'aardvarks'
          }).then((function (_this) {
            return function (models) {
              expect(models.meta.traffic).to.eq('heavy');
              expect(models.length).to.eq(2);
              return expect(_this.server.h).to.eql(['GET:/posts']);
            };
          })(this));
        });
        return xit('loads then updates in a child @session', function () {
          var childSession;
          this.server.r('GET:/posts/1', {
            meta: {
              traffic: 'heavy'
            },
            posts: {
              id: 1,
              title: 'mvcc ftw'
            }
          });
          this.server.r('PUT:/posts/1', {
            meta: {
              traffic: 'lighter'
            },
            posts: {
              id: 1,
              title: 'no more fsm'
            }
          });
          childSession = this.session.newSession();
          return childSession.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              expect(post.meta.traffic).to.eq('heavy');
              expect(_this.server.h).to.eql(['GET:/posts/1']);
              post.title = 'no more fsm';
              return childSession.flush().then(function (result) {
                expect(result[0].meta.traffic).to.eq('lighter');
                expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
                return expect(post.title).to.eq('no more fsm');
              });
            };
          })(this));
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.one_to_many', ['coalesce/rest/context', '../support/configs'], function (_export) {
  'use strict';

  var Context, postWithComments, postWithEmbeddedComments;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
      postWithEmbeddedComments = _supportConfigs.postWithEmbeddedComments;
    }],
    execute: function () {
      describe("rest with one->many relationship", function () {
        lazy('context', function () {
          return new Context(postWithComments());
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('Comment', function () {
          return this.context.typeFor('comment');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('loads lazily', function () {
          this.server.r('GET:/posts/1', {
            posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [2]
            }
          });
          this.server.r('GET:/comments/2', {
            comments: {
              id: 2,
              body: 'first',
              post: 1
            }
          });
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              var comment;
              expect(_this.server.h).to.eql(['GET:/posts/1']);
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              expect(post.comments.length).to.eq(1);
              comment = post.comments[0];
              expect(comment.body).to.be.undefined;
              return comment.load().then(function () {
                expect(_this.server.h).to.eql(['GET:/posts/1', 'GET:/comments/2']);
                expect(comment.body).to.eq('first');
                return expect(comment.post.isEqual(post)).to.be["true"];
              });
            };
          })(this));
        });
        it('creates', function () {
          var comment, post;
          this.server.r('POST:/posts', function () {
            return {
              posts: {
                client_id: post.clientId,
                id: 1,
                title: 'topological sort',
                comments: []
              }
            };
          });
          this.server.r('POST:/comments', function (xhr) {
            var data;
            data = JSON.parse(xhr.requestBody);
            expect(data.comment.post).to.eq(1);
            return {
              comments: {
                client_id: comment.clientId,
                id: 2,
                body: 'seems good',
                post: 1
              }
            };
          });
          post = this.session.create('post');
          post.title = 'topological sort';
          comment = this.session.create('comment');
          comment.body = 'seems good';
          comment.post = post;
          expect(post.comments[0]).to.eq(comment);
          return this.session.flush().then((function (_this) {
            return function () {
              expect(post.id).to.not.be["null"];
              expect(post.isNew).to.be["false"];
              expect(post.title).to.eq('topological sort');
              expect(comment.id).to.not.be["null"];
              expect(comment.body).to.eq('seems good');
              expect(comment.post).to.eq(post);
              expect(comment.post.id).to.eq("1");
              expect(post.comments[0]).to.eq(comment);
              return expect(_this.server.h).to.eql(['POST:/posts', 'POST:/comments']);
            };
          })(this));
        });
        it('creates and server can return additional children', function () {
          var post;
          this.server.r('POST:/posts', function () {
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
          });
          post = this.session.create('post');
          post.title = 'topological sort';
          return this.session.flush().then((function (_this) {
            return function () {
              var comment;
              comment = post.comments[0];
              expect(post.id).to.not.be["null"];
              expect(post.isNew).to.be["false"];
              expect(post.title).to.eq('topological sort');
              expect(comment.id).to.not.be["null"];
              expect(comment.body).to.eq('seems good');
              expect(comment.post).to.eq(post);
              expect(comment.post.id).to.eq("1");
              return expect(_this.server.h).to.eql(['POST:/posts']);
            };
          })(this));
        });
        it('creates child', function () {
          var comment;
          this.server.r('POST:/comments', function () {
            return {
              comments: {
                client_id: comment.clientId,
                id: 2,
                body: 'new child',
                post: 1
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'parent',
            comments: []
          }));
          comment = null;
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              comment = _this.session.create('comment', {
                body: 'new child'
              });
              comment.post = post;
              expect(post.comments.toArray()).to.eql([comment]);
              return _this.session.flush().then(function () {
                expect(post.comments.toArray()).to.eql([comment]);
                expect(comment.body).to.eq('new child');
                return expect(_this.server.h).to.eql(['POST:/comments']);
              });
            };
          })(this));
        });
        it('creates child with lazy reference to parent', function () {
          var comment, post;
          this.server.r('POST:/comments', function () {
            return {
              comments: {
                client_id: comment.clientId,
                id: 2,
                body: 'new child',
                post: 1
              }
            };
          });
          post = this.Post.create({
            id: 1
          });
          comment = this.session.create('comment', {
            body: 'new child'
          });
          comment.post = post;
          return this.session.flush().then((function (_this) {
            return function () {
              expect(comment.body).to.eq('new child');
              expect(_this.server.h).to.eql(['POST:/comments']);
              return expect(post.isFieldLoaded('comments')).to.be["false"];
            };
          })(this));
        });
        it('create followed by delete does not hit server', function () {
          var comment;
          this.session.merge(this.Post.create({
            id: "1",
            title: 'parent'
          }));
          comment = null;
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              comment = _this.session.create('comment', {
                body: 'new child'
              });
              comment.post = post;
              _this.session.deleteModel(comment);
              return _this.session.flush().then(function () {
                expect(_this.server.h).to.eql([]);
                return expect(comment.isDeleted).to.be["true"];
              });
            };
          })(this));
        });
        it('updates parent, updates child, and saves sibling', function () {
          var comment, post, sibling;
          this.server.r('PUT:/posts/1', function () {
            return {
              post: {
                id: 1,
                title: 'polychild',
                comments: [2]
              }
            };
          });
          this.server.r('PUT:/comments/2', function () {
            return {
              comments: {
                id: 2,
                title: 'original sibling',
                post: 1
              }
            };
          });
          this.server.r('POST:/comments', function () {
            return {
              comments: {
                client_id: sibling.clientId,
                id: 3,
                body: 'sibling',
                post: 1
              }
            };
          });
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
          this.session.merge(post);
          comment = null;
          sibling = null;
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              comment = post.comments[0];
              sibling = _this.session.create('comment', {
                body: 'sibling'
              });
              sibling.post = post;
              comment.body = 'original sibling';
              post.title = 'polychild';
              expect(post.comments.toArray()).to.eql([comment, sibling]);
              return _this.session.flush().then(function () {
                expect(post.comments.toArray()).to.eql([comment, sibling]);
                expect(_this.server.h.length).to.eq(3);
                expect(_this.server.h).to.include('PUT:/posts/1');
                expect(_this.server.h).to.include('PUT:/comments/2');
                return expect(_this.server.h).to.include('POST:/comments');
              });
            };
          })(this));
        });
        it('updates with unloaded child', function () {
          this.server.r('GET:/posts/1', function () {
            return {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [2]
              }
            };
          });
          this.server.r('PUT:/posts/1', function () {
            return {
              posts: {
                id: 1,
                title: 'updated',
                comments: [2]
              }
            };
          });
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(post.title).to.eq('mvcc ftw');
              expect(_this.server.h).to.eql(['GET:/posts/1']);
              post.title = 'updated';
              return _this.session.flush().then(function () {
                expect(post.title).to.eq('updated');
                return expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
              });
            };
          })(this));
        });
        it('deletes child', function () {
          var post;
          this.server.r('PUT:/posts/1', {
            posts: {
              id: 1,
              title: 'mvcc ftw',
              comments: [2]
            }
          });
          this.server.r('DELETE:/comments/2', {});
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
          this.session.merge(post);
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              var comment;
              comment = post.comments[0];
              _this.session.deleteModel(comment);
              expect(post.comments.length).to.eq(0);
              return _this.session.flush().then(function () {
                expect(_this.server.h).to.eql(['DELETE:/comments/2']);
                return expect(post.comments.length).to.eq(0);
              });
            };
          })(this));
        });
        it('deletes child and updates parent', function () {
          var post;
          this.server.r('PUT:/posts/1', {
            posts: {
              id: 1,
              title: 'childless',
              comments: []
            }
          });
          this.server.r('DELETE:/comments/2', {});
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
          this.session.merge(post);
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              var comment;
              comment = post.comments[0];
              _this.session.deleteModel(comment);
              expect(post.comments.length).to.eq(0);
              post.title = 'childless';
              return _this.session.flush().then(function () {
                expect(post.comments.length).to.eq(0);
                expect(post.title).to.eq('childless');
                expect(_this.server.h.length).to.eq(2);
                expect(_this.server.h).to.include('DELETE:/comments/2');
                return expect(_this.server.h).to.include('PUT:/posts/1');
              });
            };
          })(this));
        });
        it('deletes parent and child', function () {
          var post;
          this.server.r('DELETE:/posts/1', {});
          this.server.r('DELETE:/comments/2', {});
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
          this.session.merge(post);
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              var comment;
              comment = post.comments[0];
              _this.session.deleteModel(comment);
              expect(post.comments.length).to.eq(0);
              _this.session.deleteModel(post);
              return _this.session.flush().then(function () {
                expect(_this.server.h.length).to.eq(2);
                expect(_this.server.h).to.include('DELETE:/comments/2');
                expect(_this.server.h).to.include('DELETE:/posts/1');
                expect(post.isDeleted).to.be["true"];
                return expect(comment.isDeleted).to.be["true"];
              });
            };
          })(this));
        });
        return context('when embedded', function () {
          lazy('context', function () {
            return new Context(postWithEmbeddedComments());
          });
          it('loads', function () {
            this.server.r('GET:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  post: 1,
                  body: 'first'
                }]
              }
            });
            return this.session.load(this.Post, 1).then((function (_this) {
              return function (post) {
                var comment;
                expect(_this.server.h).to.eql(['GET:/posts/1']);
                expect(post.id).to.eq("1");
                expect(post.title).to.eq('mvcc ftw');
                expect(post.comments.length).to.eq(1);
                comment = post.comments[0];
                expect(comment.body).to.eq('first');
                return expect(comment.post.isEqual(post)).to.be["true"];
              };
            })(this));
          });
          it('updates child', function () {
            this.server.r('GET:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  post: 1,
                  body: 'first'
                }]
              }
            });
            this.server.r('PUT:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  post: 1,
                  body: 'first again'
                }]
              }
            });
            return this.session.load(this.Post, 1).then((function (_this) {
              return function (post) {
                var comment;
                expect(_this.server.h).to.eql(['GET:/posts/1']);
                comment = post.comments[0];
                comment.body = 'first again';
                return _this.session.flush().then(function () {
                  expect(post.comments[0]).to.eq(comment);
                  expect(comment.body).to.eq('first again');
                  return expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
                });
              };
            })(this));
          });
          it('adds child', function () {
            var comment;
            this.server.r('GET:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: []
              }
            });
            this.server.r('PUT:/posts/1', function () {
              return {
                posts: {
                  id: 1,
                  title: 'mvcc ftw',
                  comments: [{
                    id: 2,
                    client_id: comment.clientId,
                    post: 1,
                    body: 'reborn'
                  }]
                }
              };
            });
            comment = null;
            return this.session.load(this.Post, 1).then((function (_this) {
              return function (post) {
                expect(_this.server.h).to.eql(['GET:/posts/1']);
                expect(post.comments.length).to.eq(0);
                comment = _this.session.create('comment', {
                  body: 'reborn'
                });
                comment.post = post;
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
                  expect(comment.body).to.eq('reborn');
                  return expect(post.comments[0]).to.eq(comment);
                });
              };
            })(this));
          });
          it('adds child with sibling', function () {
            var comment;
            this.server.r('GET:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  id: 2,
                  post: 1,
                  body: 'first-born'
                }]
              }
            });
            this.server.r('PUT:/posts/1', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.post.comments[1].id).to.be["null"];
              expect(data.post.comments[0].body).to.eq('first-born');
              return {
                posts: {
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
                }
              };
            });
            comment = null;
            return this.session.load(this.Post, 1).then((function (_this) {
              return function (post) {
                expect(_this.server.h).to.eql(['GET:/posts/1']);
                expect(post.comments.length).to.eq(1);
                comment = _this.session.create('comment', {
                  body: 'second-born'
                });
                comment.post = post;
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
                  expect(comment.body).to.eq('second-born');
                  expect(post.comments[0].body).to.eq('first-born');
                  return expect(post.comments.lastObject).to.eq(comment);
                });
              };
            })(this));
          });
          it('deletes child', function () {
            var post;
            this.server.r('PUT:/posts/1', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.post.comments.length).to.eq(0);
              return {
                posts: {
                  id: 1,
                  title: 'mvcc ftw',
                  comments: []
                }
              };
            });
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
            this.session.merge(post);
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                var comment;
                comment = post.comments[0];
                _this.session.deleteModel(comment);
                expect(post.comments.length).to.eq(0);
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['PUT:/posts/1']);
                  return expect(post.comments.length).to.eq(0);
                });
              };
            })(this));
          });
          it('deletes child with sibling', function () {
            var post, sibling;
            this.server.r('PUT:/posts/1', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.post.comments.length).to.eq(1);
              return {
                posts: {
                  id: 1,
                  title: 'mvcc ftw',
                  comments: [{
                    id: 3,
                    client_id: sibling.clientId,
                    post: 1,
                    body: 'child2'
                  }]
                }
              };
            });
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
            this.session.merge(post);
            sibling = null;
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                var comment;
                comment = post.comments[0];
                sibling = post.comments.lastObject;
                _this.session.deleteModel(comment);
                expect(post.comments.length).to.eq(1);
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['PUT:/posts/1']);
                  return expect(post.comments.length).to.eq(1);
                });
              };
            })(this));
          });
          it('new parent creates and deletes child before flush', function () {
            var comment, post;
            this.server.r('POST:/posts', function (xhr) {
              var data;
              data = JSON.parse(xhr.requestBody);
              expect(data.post.comments.length).to.eq(0);
              return {
                posts: {
                  client_id: post.clientId,
                  id: 1,
                  title: 'mvcc ftw',
                  comments: []
                }
              };
            });
            post = this.session.create(this.Post, {
              title: 'parent',
              comments: []
            });
            comment = this.session.create(this.Comment, {
              title: 'child'
            });
            post.comments.pushObject(comment);
            post.comments.removeObject(comment);
            return this.session.flush().then((function (_this) {
              return function () {
                expect(post.comments.length).to.eq(0);
                expect(post.isNew).to.be["false"];
                return expect(_this.server.h).to.eql(['POST:/posts']);
              };
            })(this));
          });
          it('deletes multiple children in multiple flushes', function () {
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
            post = this.session.merge(post);
            this.server.r('PUT:/posts/1', {
              posts: {
                id: 1,
                title: 'mvcc ftw',
                comments: [{
                  post: "1",
                  id: "3",
                  body: 'thing 2'
                }]
              }
            });
            this.session.deleteModel(post.comments.objectAt(0));
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['PUT:/posts/1']);
                expect(post.comments.length).to.eq(1);
                _this.session.deleteModel(post.comments.objectAt(0));
                _this.server.r('PUT:/posts/1', {
                  posts: {
                    id: 1,
                    title: 'mvcc ftw',
                    comments: []
                  }
                });
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
                  return expect(post.comments.length).to.eq(0);
                });
              };
            })(this));
          });
          return it('deletes parent and child', function () {
            var post;
            this.server.r('DELETE:/posts/1', {});
            post = this.Post.create({
              id: "1",
              title: 'parent',
              comments: []
            });
            post.comments.addObject(this.Comment.create({
              id: "2",
              body: 'child'
            }));
            this.session.merge(post);
            return this.session.load('post', 1).then((function (_this) {
              return function (post) {
                _this.session.deleteModel(post);
                return _this.session.flush().then(function () {
                  expect(_this.server.h).to.eql(['DELETE:/posts/1']);
                  return expect(post.isDeleted).to.be["true"];
                });
              };
            })(this));
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.one_to_one', ['coalesce/rest/context', '../support/configs'], function (_export) {
  'use strict';

  var Context, userWithProfile, userWithEmbeddedProfile;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      userWithProfile = _supportConfigs.userWithProfile;
      userWithEmbeddedProfile = _supportConfigs.userWithEmbeddedProfile;
    }],
    execute: function () {
      describe("rest with one->one relationship", function () {
        lazy('context', function () {
          return new Context(userWithProfile());
        });
        lazy('User', function () {
          return this.context.typeFor('user');
        });
        lazy('Profile', function () {
          return this.context.typeFor('profile');
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('child can be null', function () {
          this.server.r('GET:/profiles/1', {
            profiles: {
              id: 1,
              title: 'mvcc ftw',
              user: null
            }
          });
          this.server.r('PUT:/profiles/1', {
            profiles: {
              id: 1,
              title: 'new title',
              user: null
            }
          });
          return this.session.load(this.Profile, 1).then((function (_this) {
            return function (profile) {
              expect(profile.id).to.eq("1");
              expect(profile.title).to.eq("mvcc ftw");
              expect(profile.user).to.be["null"];
              profile.title = 'new title';
              return _this.session.flush().then(function () {
                return expect(profile.title).to.eq('new title');
              });
            };
          })(this));
        });
        it('loads lazily', function () {
          this.server.r('GET:/profiles/1', {
            profiles: {
              id: 1,
              title: 'mvcc ftw',
              user: 2
            }
          });
          this.server.r('GET:/users/2', {
            users: {
              id: 2,
              name: 'brogrammer',
              profile: 1
            }
          });
          return this.session.load(this.Profile, 1).then((function (_this) {
            return function (profile) {
              var user;
              expect(_this.server.h).to.eql(['GET:/profiles/1']);
              expect(profile.id).to.eq("1");
              expect(profile.title).to.eq('mvcc ftw');
              user = profile.user;
              expect(user.id).to.eq("2");
              expect(user.name).to.be.undefined;
              return profile.user.load().then(function () {
                expect(_this.server.h).to.eql(['GET:/profiles/1', 'GET:/users/2']);
                expect(user.name).to.eq('brogrammer');
                return expect(user.profile.isEqual(profile)).to.be["true"];
              });
            };
          })(this));
        });
        it('deletes one side', function () {
          var profile;
          this.server.r('DELETE:/users/2', {});
          profile = this.Profile.create({
            id: "1",
            title: 'parent'
          });
          profile.user = this.User.create({
            id: "2",
            name: 'wes',
            profile: profile
          });
          this.session.merge(profile);
          return this.session.load('profile', 1).then((function (_this) {
            return function (profile) {
              var user;
              user = profile.user;
              _this.session.deleteModel(user);
              expect(profile.user).to.be["null"];
              return _this.session.flush().then(function () {
                expect(profile.user).to.be["null"];
                return expect(_this.server.h).to.eql(['DELETE:/users/2']);
              });
            };
          })(this));
        });
        it('deletes both', function () {
          var profile;
          this.server.r('DELETE:/profiles/1', {});
          this.server.r('DELETE:/users/2', {});
          profile = this.Profile.create({
            id: "1",
            title: 'parent'
          });
          profile.user = this.User.create({
            id: "2",
            name: 'wes',
            profile: profile
          });
          this.session.merge(profile);
          return this.session.load('profile', 1).then((function (_this) {
            return function (profile) {
              var user;
              user = profile.user;
              _this.session.deleteModel(user);
              _this.session.deleteModel(profile);
              return _this.session.flush().then(function () {
                expect(_this.server.h.length).to.eq(2);
                expect(_this.server.h).to.include('DELETE:/users/2');
                return expect(_this.server.h).to.include('DELETE:/profiles/1');
              });
            };
          })(this));
        });
        it('creates on server', function () {
          var profile;
          this.server.r('POST:/profiles', function () {
            return {
              profiles: {
                client_id: profile.clientId,
                id: 1,
                title: 'herp',
                user: 2
              }
            };
          });
          this.server.r('GET:/users/2', {
            users: {
              id: 1,
              name: 'derp',
              profile: 1
            }
          });
          profile = this.session.create('profile', {
            title: 'herp'
          });
          return this.session.flush().then((function (_this) {
            return function () {
              expect(_this.server.h).to.eql(['POST:/profiles']);
              expect(profile.id).to.eq("1");
              expect(profile.title).to.eq('herp');
              return expect(profile.user).to.not.be["null"];
            };
          })(this));
        });
        it('creates on server and returns sideloaded', function () {
          var profile;
          this.server.r('POST:/profiles', function () {
            return {
              users: {
                id: 2,
                name: 'derp',
                profile: 1
              },
              profiles: {
                client_id: profile.clientId,
                id: 1,
                title: 'herp',
                user: 2
              }
            };
          });
          profile = this.session.create('profile', {
            title: 'herp'
          });
          return this.session.flush().then((function (_this) {
            return function () {
              expect(_this.server.h).to.eql(['POST:/profiles']);
              expect(profile.id).to.eq("1");
              expect(profile.title).to.eq('herp');
              expect(profile.user).to.not.be["null"];
              return expect(profile.user.name).to.eq('derp');
            };
          })(this));
        });
        return context("when embedded", function () {
          lazy('context', function () {
            return new Context(userWithEmbeddedProfile());
          });
          it('creates child', function () {
            var profile;
            this.server.r('PUT:/profiles/1', function () {
              return {
                profiles: {
                  id: 1,
                  title: 'parent',
                  user: {
                    client_id: profile.user.clientId,
                    id: 2,
                    name: 'child',
                    profile: 1
                  }
                }
              };
            });
            profile = this.session.merge(this.Profile.create({
              id: "1",
              title: 'parent'
            }));
            profile.user = this.session.create('user', {
              name: 'child'
            });
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['PUT:/profiles/1']);
                expect(profile.user.isNew).to.be["false"];
                return expect(profile.user.id).to.eq('2');
              };
            })(this));
          });
          it('creates hierarchy', function () {
            var profile;
            this.server.r('POST:/profiles', function () {
              return {
                profiles: {
                  client_id: profile.clientId,
                  id: 1,
                  title: 'herp',
                  user: {
                    client_id: profile.user.clientId,
                    id: 1,
                    name: 'derp',
                    profile: 1
                  }
                }
              };
            });
            profile = this.session.create('profile', {
              title: 'herp'
            });
            profile.user = this.session.create('user', {
              name: 'derp'
            });
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['POST:/profiles']);
                expect(profile.id).to.eq("1");
                expect(profile.title).to.eq('herp');
                return expect(profile.user.name).to.eq('derp');
              };
            })(this));
          });
          return it('deletes parent', function () {
            var profile;
            this.server.r('DELETE:/profiles/1', {});
            profile = this.Profile.create({
              id: "1",
              title: 'parent'
            });
            profile.user = this.User.create({
              id: "2",
              name: 'wes'
            });
            profile = this.session.merge(profile);
            this.session.deleteModel(profile);
            return this.session.flush().then((function (_this) {
              return function () {
                expect(_this.server.h).to.eql(['DELETE:/profiles/1']);
                return expect(profile.isDeleted).to.be["true"];
              };
            })(this));
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.performance', ['coalesce/rest/context', '../support/configs'], function (_export) {
  'use strict';

  var Context, postWithComments;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
    }],
    execute: function () {
      describe("rest performance", function () {
        lazy('context', function () {
          return new Context(postWithComments());
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('loads model with many children to empty session fast', function () {
          var i, j, results;
          this.slow(500);
          this.server.r('GET:/posts', {
            posts: [{
              id: 1,
              title: 'is it fast?',
              rev: 1,
              comments: (function () {
                results = [];
                for (j = 1; j <= 100; j++) {
                  results.push(j);
                }
                return results;
              }).apply(this)
            }],
            comments: (function () {
              var k, results1;
              results1 = [];
              for (i = k = 1; k <= 100; i = ++k) {
                results1.push({
                  id: i,
                  message: "message" + i,
                  post: 1,
                  rev: 1
                });
              }
              return results1;
            })()
          });
          return this.session.query('post').then(function (posts) {
            return expect(posts[0].comments.length).to.eq(100);
          });
        });
        return it('loads model with many children repeatedly fast when rev is set', function () {
          var i, j, results;
          this.slow(2500);
          this.server.r('GET:/posts', {
            posts: [{
              id: 1,
              title: 'still fast?',
              rev: 1,
              comments: (function () {
                results = [];
                for (j = 1; j <= 100; j++) {
                  results.push(j);
                }
                return results;
              }).apply(this)
            }],
            comments: (function () {
              var k, results1;
              results1 = [];
              for (i = k = 1; k <= 100; i = ++k) {
                results1.push({
                  id: i,
                  message: "message" + i,
                  post: 1,
                  rev: 1
                });
              }
              return results1;
            })()
          });
          return this.session.query('post').then(function (posts) {
            return posts.refresh().then(function (posts) {
              return expect(posts[0].comments.length).to.eq(100);
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.rpc', ['coalesce/model/model', 'coalesce/rest/context'], function (_export) {
  'use strict';

  var Model, Context;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }],
    execute: function () {
      describe("rest with rpc", function () {
        lazy('Post', function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              },
              submitted: {
                type: 'boolean'
              }
            }
          });
          return Post;
        });
        lazy('context', function () {
          return new Context({
            types: {
              post: this.Post
            }
          });
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('works with loaded model as context', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit').then(function () {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('handles remote calls on the collection', function () {
          this.server.r('POST:/posts/randomize', function () {
            return {
              posts: [{
                id: 1,
                title: 'submitted',
                submitted: true
              }, {
                id: 2,
                title: 'submitted2',
                submitted: true
              }]
            };
          });
          return this.session.remoteCall('post', 'randomize').then((function (_this) {
            return function (models) {
              expect(models.length).to.eq(2);
              expect(models[0].title).to.eq('submitted');
              expect(models[0].submitted).to.be["true"];
              return expect(_this.server.h).to.eql(['POST:/posts/randomize']);
            };
          })(this));
        });
        it('serializes model params', function () {
          this.server.r('POST:/posts/1/submit', function (xhr) {
            var data;
            data = JSON.parse(xhr.requestBody);
            expect(data.post.title).to.eq('test');
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', post).then(function () {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('can accept model type as context', function () {
          this.server.r('POST:/posts/import', function () {
            return {
              posts: [{
                id: 1,
                title: 'submitted',
                submitted: "true"
              }]
            };
          });
          return this.session.remoteCall('post', 'import').then((function (_this) {
            return function (posts) {
              expect(_this.server.h).to.eql(['POST:/posts/import']);
              return expect(posts[0].id).to.eq("1");
            };
          })(this));
        });
        it('can accept parameters', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }).then(function () {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('passes through metadata', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              meta: {
                traffic: 'heavy'
              },
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }).then(function () {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.meta.traffic).to.eq('heavy');
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('can accept a method', function () {
          this.server.r('PUT:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                type: 'PUT'
              }).then(function () {
                expect(_this.server.h).to.eql(['PUT:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('when url option set, a custom url is used', function () {
          this.server.r('POST:/greener_pastures', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                url: '/greener_pastures'
              }).then(function () {
                expect(_this.server.h).to.eql(['POST:/greener_pastures']);
                expect(post.title).to.eq('submitted');
                return expect(post.submitted).to.be["true"];
              });
            };
          })(this));
        });
        it('results in raw json when deserialize=false', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                deserialize: false
              }).then(function (json) {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('test');
                expect(post.submitted).to.be["false"];
                expect(json.posts.title).to.eq('submitted');
                return expect(json.isModel).to.be.undefined;
              });
            };
          })(this));
        });
        it('returns all models when deserializationContext is null', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                deserializationContext: null
              }).then(function (models) {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                expect(post.submitted).to.be["true"];
                return expect(models[0]).to.eq(post);
              });
            };
          })(this));
        });
        it('returns all models of a type if deserializer context is a type key', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                serializerOptions: {
                  context: 'post'
                }
              }).then(function (models) {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                expect(post.submitted).to.be["true"];
                return expect(models[0]).to.eq(post);
              });
            };
          })(this));
        });
        return it('returns all models of a type if context is a type', function () {
          this.server.r('POST:/posts/1/submit', function () {
            return {
              posts: {
                id: 1,
                title: 'submitted',
                submitted: "true"
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test',
            submitted: false
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              return _this.session.remoteCall(post, 'submit', {
                token: 'asd'
              }, {
                serializerOptions: {
                  context: _this.Post
                }
              }).then(function (models) {
                expect(_this.server.h).to.eql(['POST:/posts/1/submit']);
                expect(post.title).to.eq('submitted');
                expect(post.submitted).to.be["true"];
                return expect(models[0]).to.eq(post);
              });
            };
          })(this));
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.sideloading', ['coalesce/rest/context', '../support/configs'], function (_export) {
  'use strict';

  var Context, postWithComments;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
    }],
    execute: function () {
      describe("rest with sideloading", function () {
        lazy('context', function () {
          return new Context(postWithComments());
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        return it('is supported', function () {
          this.server.r('GET:/posts/1', {
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
          });
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(_this.server.h).to.eql(['GET:/posts/1']);
              expect(post.comments[0].body).to.eq('here we');
              return expect(post.comments.lastObject.body).to.eq('are');
            };
          })(this));
        });
      });
    }
  };
});
System.register('coalesce-test/rest/rest.simple', ['coalesce/rest/context', 'coalesce/model/model'], function (_export) {
  'use strict';

  var Context, Model;
  return {
    setters: [function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }],
    execute: function () {
      describe("rest with simple model", function () {
        lazy('Post', function () {
          var Post = (function (_Model) {
            babelHelpers.inherits(Post, _Model);

            function Post() {
              babelHelpers.classCallCheck(this, Post);
              babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
            }

            return Post;
          })(Model);

          ;
          Post.defineSchema({
            attributes: {
              title: {
                type: 'string'
              }
            }
          });
          return Post;
        });
        lazy('context', function () {
          return new Context({
            types: {
              post: this.Post
            }
          });
        });
        lazy('session', function () {
          return this.context.newSession();
        });
        it('loads', function () {
          this.server.r('GET:/posts/1', {
            posts: {
              id: 1,
              title: 'mvcc ftw'
            }
          });
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              return expect(_this.server.h).to.eql(['GET:/posts/1']);
            };
          })(this));
        });
        it('saves', function () {
          var post;
          this.server.r('POST:/posts', function () {
            return {
              posts: {
                client_id: post.clientId,
                id: 1,
                title: 'mvcc ftw'
              }
            };
          });
          post = this.session.create('post');
          post.title = 'mvcc ftw';
          return this.session.flush().then((function (_this) {
            return function () {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              return expect(_this.server.h).to.eql(['POST:/posts']);
            };
          })(this));
        });
        it('updates', function () {
          this.server.r('PUT:/posts/1', function () {
            return {
              posts: {
                id: 1,
                title: 'updated'
              }
            };
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(post.title).to.eq('test');
              post.title = 'updated';
              return _this.session.flush().then(function () {
                expect(post.title).to.eq('updated');
                return expect(_this.server.h).to.eql(['PUT:/posts/1']);
              });
            };
          })(this));
        });
        it('updates multiple times', function () {
          var post;
          this.server.r('PUT:/posts/1', function () {
            return {
              posts: {
                id: 1,
                title: 'updated'
              }
            };
          });
          post = this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          expect(post.title).to.eq('test');
          post.title = 'updated';
          return this.session.flush().then((function (_this) {
            return function () {
              expect(post.title).to.eq('updated');
              expect(_this.server.h).to.eql(['PUT:/posts/1']);
              _this.server.r('PUT:/posts/1', function () {
                return {
                  posts: {
                    id: 1,
                    title: 'updated again'
                  }
                };
              });
              post.title = 'updated again';
              return _this.session.flush().then(function () {
                expect(post.title).to.eq('updated again');
                expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
                return _this.session.flush().then(function () {
                  expect(post.title).to.eq('updated again');
                  return expect(_this.server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1']);
                });
              });
            };
          })(this));
        });
        it('deletes', function () {
          this.server.r('DELETE:/posts/1', {});
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load('post', 1).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('test');
              _this.session.deleteModel(post);
              return _this.session.flush().then(function () {
                expect(post.isDeleted).to.be["true"];
                return expect(_this.server.h).to.eql(['DELETE:/posts/1']);
              });
            };
          })(this));
        });
        it('deletes multiple times in multiple flushes', function () {
          var post1, post2;
          this.server.r('DELETE:/posts/1', {});
          post1 = this.session.merge(this.Post.create({
            id: "1",
            title: 'thing 1'
          }));
          post2 = this.session.merge(this.Post.create({
            id: "2",
            title: 'thing 2'
          }));
          this.session.deleteModel(post1);
          return this.session.flush().then((function (_this) {
            return function () {
              expect(post1.isDeleted).to.be["true"];
              expect(post2.isDeleted).to.be["false"];
              _this.server.r('DELETE:/posts/1', function () {
                throw "already deleted";
              });
              _this.server.r('DELETE:/posts/2', {});
              _this.session.deleteModel(post2);
              return _this.session.flush().then(function () {
                expect(post1.isDeleted).to.be["true"];
                return expect(post2.isDeleted).to.be["true"];
              });
            };
          })(this));
        });
        it('creates, deletes, creates, deletes', function () {
          var post1;
          post1 = this.session.create('post');
          post1.title = 'thing 1';
          this.server.r('POST:/posts', function () {
            return {
              posts: {
                client_id: post1.clientId,
                id: 1,
                title: 'thing 1'
              }
            };
          });
          return this.session.flush().then((function (_this) {
            return function () {
              expect(post1.id).to.eq('1');
              expect(post1.title).to.eq('thing 1');
              _this.session.deleteModel(post1);
              _this.server.r('DELETE:/posts/1', {});
              return _this.session.flush().then(function () {
                var post2;
                expect(post1.isDeleted).to.be["true"];
                post2 = _this.session.create('post');
                post2.title = 'thing 2';
                _this.server.r('POST:/posts', function () {
                  return {
                    posts: {
                      client_id: post2.clientId,
                      id: 2,
                      title: 'thing 2'
                    }
                  };
                });
                return _this.session.flush().then(function () {
                  _this.server.r('DELETE:/posts/1', function () {
                    throw 'not found';
                  });
                  _this.server.r('DELETE:/posts/2', {});
                  expect(post2.id).to.eq('2');
                  expect(post2.title).to.eq('thing 2');
                  _this.session.deleteModel(post2);
                  return _this.session.flush().then(function () {
                    expect(post2.isDeleted).to.be["true"];
                    return expect(_this.server.h).to.eql(['POST:/posts', 'DELETE:/posts/1', 'POST:/posts', 'DELETE:/posts/2']);
                  });
                });
              });
            };
          })(this));
        });
        it('refreshes', function () {
          this.server.r('GET:/posts/1', {
            posts: {
              id: 1,
              title: 'something new'
            }
          });
          this.session.merge(this.Post.create({
            id: "1",
            title: 'test'
          }));
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.title).to.eq('test');
              expect(_this.server.h).to.eql([]);
              return _this.session.refresh(post).then(function (post) {
                expect(post.title).to.eq('something new');
                return expect(_this.server.h).to.eql(['GET:/posts/1']);
              });
            };
          })(this));
        });
        it('finds', function () {
          this.server.r('GET:/posts', function (xhr) {
            expect(xhr.url).to.contain('q=aardvarks');
            return {
              posts: [{
                id: 1,
                title: 'aardvarks explained'
              }, {
                id: 2,
                title: 'aardvarks in depth'
              }]
            };
          });
          return this.session.find('post', {
            q: 'aardvarks'
          }).then((function (_this) {
            return function (models) {
              expect(models.length).to.eq(2);
              return expect(_this.server.h).to.eql(['GET:/posts']);
            };
          })(this));
        });
        it('loads then updates', function () {
          this.server.r('GET:/posts/1', {
            posts: {
              id: 1,
              title: 'mvcc ftw'
            }
          });
          this.server.r('PUT:/posts/1', {
            posts: {
              id: 1,
              title: 'no more fsm'
            }
          });
          return this.session.load(this.Post, 1).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              expect(_this.server.h).to.eql(['GET:/posts/1']);
              post.title = 'no more fsm';
              return _this.session.flush().then(function () {
                expect(_this.server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1']);
                return expect(post.title).to.eq('no more fsm');
              });
            };
          })(this));
        });
        return it('loads with parameter', function () {
          this.server.r('GET:/posts/1', (function (_this) {
            return function (xhr) {
              expect(xhr.url).to.contain('fdsavcxz');
              return {
                posts: {
                  id: 1,
                  title: 'mvcc ftw'
                }
              };
            };
          })(this));
          return this.session.load(this.Post, 1, {
            params: {
              invite_token: 'fdsavcxz'
            }
          }).then((function (_this) {
            return function (post) {
              expect(post.id).to.eq("1");
              expect(post.title).to.eq('mvcc ftw');
              return expect(_this.server.h).to.eql(['GET:/posts/1']);
            };
          })(this));
        });
      });
    }
  };
});
System.register('coalesce-test/rest/serializers/payload', ['coalesce/model/model', 'coalesce/serializers/model', 'coalesce/rest/context'], function (_export) {
  'use strict';

  var Model, ModelSerializer, Context;
  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceSerializersModel) {
      ModelSerializer = _coalesceSerializersModel['default'];
    }, function (_coalesceRestContext) {
      Context = _coalesceRestContext['default'];
    }],
    execute: function () {
      describe('PayloadSerializer', function () {
        lazy('context', function () {
          return new Context();
        });
        lazy('Payload', function () {
          return this.context.typeFor('payload');
        });
        subject(function () {
          return this.context.configFor('payload').get('serializer');
        });
        return context('with a simple model', function () {
          lazy('Post', function () {
            var Post = (function (_Model) {
              babelHelpers.inherits(Post, _Model);

              function Post() {
                babelHelpers.classCallCheck(this, Post);
                babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
              }

              return Post;
            })(Model);

            ;
            Post.defineSchema({
              attributes: {
                title: {
                  type: 'string'
                },
                longTitle: {
                  type: 'string'
                }
              }
            });
            return Post;
          });
          lazy('context', function () {
            return new Context({
              types: {
                post: this.Post
              }
            });
          });
          describe('.deserialize', function () {
            it('reads plural hash key', function () {
              var data, models, post;
              data = {
                posts: {
                  id: 1,
                  title: 'wat',
                  long_title: 'wat omgawd'
                }
              };
              models = this.subject.deserialize(data);
              post = models[0];
              expect(post).to.be.an["instanceof"](this.Post);
              expect(post.title).to.eq('wat');
              expect(post.longTitle).to.eq('wat omgawd');
              return expect(post.id).to.eq("1");
            });
            it('reads singular hash key', function () {
              var data, models, post;
              data = {
                post: {
                  id: 1,
                  title: 'wat',
                  long_title: 'wat omgawd'
                }
              };
              models = this.subject.deserialize(data);
              post = models[0];
              expect(post).to.be.an["instanceof"](this.Post);
              expect(post.title).to.eq('wat');
              expect(post.longTitle).to.eq('wat omgawd');
              return expect(post.id).to.eq("1");
            });
            it('reads array value', function () {
              var data, models, post;
              data = {
                post: [{
                  id: 1,
                  title: 'wat',
                  long_title: 'wat omgawd'
                }]
              };
              models = this.subject.deserialize(data);
              post = models[0];
              expect(post).to.be.an["instanceof"](this.Post);
              expect(post.title).to.eq('wat');
              expect(post.longTitle).to.eq('wat omgawd');
              return expect(post.id).to.eq("1");
            });
            return it('respects aliases', function () {
              var data, models, post;
              this.subject.constructor.reopen({
                aliases: {
                  blog_post: 'post'
                }
              });
              data = {
                blog_post: {
                  id: 1,
                  title: 'wat',
                  long_title: 'wat omgawd'
                }
              };
              models = this.subject.deserialize(data);
              post = models[0];
              expect(post).to.be.an["instanceof"](this.Post);
              expect(post.title).to.eq('wat');
              expect(post.longTitle).to.eq('wat omgawd');
              return expect(post.id).to.eq("1");
            });
          });
          return describe('.serialize', function () {
            return it('is not supported', function () {
              var fn;
              fn = (function (_this) {
                return function () {
                  return _this.subject.serialize(new _this.Payload());
                };
              })(this);
              return expect(fn).to["throw"];
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/serializers/model', ['coalesce/serializers/model', 'coalesce/model/model', 'coalesce/context/default', 'coalesce/serializers/base', '../support/configs'], function (_export) {
  'use strict';

  var ModelSerializer, Model, Context, Serializer, postWithComments, postWithEmbeddedComments;
  return {
    setters: [function (_coalesceSerializersModel) {
      ModelSerializer = _coalesceSerializersModel['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }, function (_coalesceSerializersBase) {
      Serializer = _coalesceSerializersBase['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
      postWithEmbeddedComments = _supportConfigs.postWithEmbeddedComments;
    }],
    execute: function () {
      describe('ModelSerializer', function () {
        lazy('ModelClass', function () {
          var User = (function (_Model) {
            babelHelpers.inherits(User, _Model);

            function User() {
              babelHelpers.classCallCheck(this, User);
              babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
            }

            return User;
          })(Model);

          ;
          User.defineSchema(this.schema);
          return User;
        });
        lazy('schema', function () {
          return {
            attributes: {
              name: {
                type: 'string'
              }
            }
          };
        });
        lazy('context', function () {
          return new Context({
            types: {
              user: this.ModelClass
            }
          });
        });
        subject(function () {
          return this.context.configFor('user').get('serializer');
        });
        lazy('data', function () {
          return {
            id: 1,
            name: 'Bro',
            rev: 123,
            client_rev: 321,
            client_id: 1
          };
        });
        lazy('deserialized', function () {
          return this.subject.deserialize(this.data);
        });
        lazy('model', function () {
          return new this.ModelClass({
            id: 1,
            name: 'Bro'
          });
        });
        lazy('serialized', function () {
          return this.subject.serialize(this.model);
        });
        describe('.deserialize', function () {
          it('deserializes to a model instance', function () {
            return expect(this.deserialized.name).to.eq('Bro');
          });
          it('reifies client_id', function () {
            return expect(this.deserialized.clientId).to.not.be["null"];
          });
          return it('includes meta properties', function () {
            expect(this.deserialized.rev).to.not.be["null"];
            expect(this.deserialized.clientRev).to.not.be["null"];
            expect(this.deserialized.id).to.not.be["null"];
            return expect(this.deserialized.clientId).to.not.be["null"];
          });
        });
        describe('.serialize', function () {
          return it('serializes to pojo', function () {
            return expect(this.serialized.name).to.eq('Bro');
          });
        });
        context('when attribute has `transient` option set to true', function () {
          lazy('schema', function () {
            return {
              attributes: {
                postCount: {
                  type: 'number',
                  transient: true
                }
              }
            };
          });
          describe('.deserialize', function () {
            lazy('data', function () {
              return {
                id: 1,
                post_count: 12
              };
            });
            return it('includes attribute', function () {
              return expect(this.deserialized.postCount).to.eq(12);
            });
          });
          return describe('.serialize', function () {
            lazy('model', function () {
              return new this.ModelClass({
                id: 1,
                postCount: 12
              });
            });
            return it('does not include attribute', function () {
              return expect(this.serialized.post_count).to.be.undefined;
            });
          });
        });
        context('when attribute has `key` option set', function () {
          lazy('schema', function () {
            return {
              attributes: {
                name: {
                  type: 'string',
                  key: 'FULL_NAME'
                }
              }
            };
          });
          describe('.deserialize', function () {
            lazy('data', function () {
              return {
                id: 1,
                FULL_NAME: 'Gordon Michael Hempton'
              };
            });
            return it('deserializes attribute from that key', function () {
              return expect(this.deserialized.name).to.eq('Gordon Michael Hempton');
            });
          });
          return describe('.serialize', function () {
            lazy('model', function () {
              return new this.ModelClass({
                id: 1,
                name: 'Gordon Michael Hempton'
              });
            });
            return it('serializes attribute to that key', function () {
              return expect(this.serialized.FULL_NAME).to.eq('Gordon Michael Hempton');
            });
          });
        });
        context('when attribute does not have a type', function () {
          lazy('schema', function () {
            return {
              attributes: {
                name: {}
              }
            };
          });
          context('and attribute value is a pojo', function () {
            describe('.deserialize', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  name: {
                    middle_name: 'Michael'
                  }
                };
              });
              return it('keeps nested properties', function () {
                return expect(this.deserialized.name.middle_name).to.eq('Michael');
              });
            });
            return describe('.serialize', function () {
              lazy('model', function () {
                return new this.ModelClass({
                  id: 1,
                  name: {
                    middle_name: 'Michael'
                  }
                });
              });
              return it('keeps nested properties', function () {
                return expect(this.serialized.name.middle_name).to.eq('Michael');
              });
            });
          });
          context('and attribute value is a populated array', function () {
            describe('.deserialize', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  name: ['Gordon', 'Michael', 'Hempton']
                };
              });
              return it('keeps array contents', function () {
                return expect(this.deserialized.name).to.eql(['Gordon', 'Michael', 'Hempton']);
              });
            });
            return describe('.serialize', function () {
              lazy('model', function () {
                return new this.ModelClass({
                  id: 1,
                  name: ['Gordon', 'Michael', 'Hempton']
                });
              });
              return it('keeps array contents', function () {
                return expect(this.serialized.name).to.eql(['Gordon', 'Michael', 'Hempton']);
              });
            });
          });
          return context('and attribute value is an empty array', function () {
            describe('.deserialize', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  name: []
                };
              });
              return it('keeps array contents', function () {
                return expect(this.deserialized.name).to.eql([]);
              });
            });
            return describe('.serialize', function () {
              lazy('model', function () {
                return new this.ModelClass({
                  id: 1,
                  name: []
                });
              });
              return it('keeps array contents', function () {
                return expect(this.serialized.name).to.eql([]);
              });
            });
          });
        });
        context('when attribute type is associated with a custom serializer', function () {
          lazy('CustomSerializer', function () {
            var CustomSerializer = (function (_Serializer) {
              babelHelpers.inherits(CustomSerializer, _Serializer);

              function CustomSerializer() {
                babelHelpers.classCallCheck(this, CustomSerializer);
                babelHelpers.get(Object.getPrototypeOf(CustomSerializer.prototype), 'constructor', this).apply(this, arguments);
              }

              return CustomSerializer;
            })(Serializer);

            ;
            CustomSerializer.prototype.serialize = function () {
              return 's';
            };
            CustomSerializer.prototype.deserialize = function () {
              return 'd';
            };
            return CustomSerializer;
          });
          lazy('context', function () {
            return new Context({
              types: {
                user: this.ModelClass,
                thing: {
                  serializer: this.CustomSerializer
                }
              }
            });
          });
          lazy('schema', function () {
            return {
              attributes: {
                thing: {
                  type: 'thing'
                }
              }
            };
          });
          describe('.deserialize', function () {
            lazy('data', function () {
              return {
                id: 1,
                thing: '1'
              };
            });
            return it('uses serializer', function () {
              return expect(this.deserialized.thing).to.eq('d');
            });
          });
          describe('.serialize', function () {
            lazy('model', function () {
              return new this.ModelClass({
                id: 1,
                thing: '1'
              });
            });
            return it('uses serializer', function () {
              return expect(this.serialized.thing).to.eq('s');
            });
          });
          context('and its value is undefined', function () {
            describe('.deserialize', function () {
              return it('does not include attribute', function () {
                return expect(this.deserialized.thing).to.be.undefined;
              });
            });
            return describe('.serialize', function () {
              return it('does not include attribute', function () {
                return expect(this.serialized.thing).to.be.undefined;
              });
            });
          });
          return context('and its value is null', function () {
            describe('.deserialize', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  thing: null
                };
              });
              return it('uses serializer', function () {
                return expect(this.deserialized.thing).to.eq('d');
              });
            });
            return describe('.serialize', function () {
              lazy('model', function () {
                return new this.ModelClass({
                  id: 1,
                  thing: null
                });
              });
              return it('uses serializer', function () {
                return expect(this.serialized.thing).to.eq('s');
              });
            });
          });
        });
        context('with belongsTo relationship', function () {
          lazy('context', function () {
            return new Context(postWithComments());
          });
          lazy('ModelClass', function () {
            return this.context.typeFor('comment');
          });
          subject(function () {
            return this.context.configFor('comment').get('serializer');
          });
          return describe('.deserialize', function () {
            lazy('data', function () {
              return {
                id: 1,
                post: 2
              };
            });
            it('deserializes relationship', function () {
              return expect(this.deserialized.post).to.not.be["null"];
            });
            context('with null', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  post: null
                };
              });
              return it('deserializes as empty relationship', function () {
                return expect(this.deserialized.post).to.be["null"];
              });
            });
            return context('when embedded', function () {
              lazy('context', function () {
                return new Context(postWithEmbeddedComments());
              });
              lazy('data', function () {
                return {
                  id: 1,
                  post: {
                    id: 2
                  }
                };
              });
              it('deserializes relationship', function () {
                return expect(this.deserialized.post).to.not.be["null"];
              });
              return context('with null', function () {
                lazy('data', function () {
                  return {
                    id: 1,
                    post: null
                  };
                });
                return it('deserializes as empty relationship', function () {
                  return expect(this.deserialized.post).to.be["null"];
                });
              });
            });
          });
        });
        return context('with hasMany relationship', function () {
          lazy('context', function () {
            return new Context(postWithComments());
          });
          lazy('ModelClass', function () {
            return this.context.typeFor('post');
          });
          subject(function () {
            return this.context.configFor('post').get('serializer');
          });
          return describe('.deserialize', function () {
            lazy('data', function () {
              return {
                id: 1,
                comments: [2]
              };
            });
            it('deserializes relationship', function () {
              return expect(this.deserialized.comments.length).to.eq(1);
            });
            context('with null', function () {
              lazy('data', function () {
                return {
                  id: 1,
                  comments: null
                };
              });
              return it('deserializes as empty relationship', function () {
                return expect(this.deserialized.comments.length).to.eq(0);
              });
            });
            return context('when embedded', function () {
              lazy('context', function () {
                return new Context(postWithEmbeddedComments());
              });
              lazy('data', function () {
                return {
                  id: 1,
                  comments: [{
                    id: 2
                  }]
                };
              });
              it('deserializes relationship', function () {
                return expect(this.deserialized.comments.length).to.eq(1);
              });
              return context('with null', function () {
                lazy('data', function () {
                  return {
                    id: 1,
                    post: null
                  };
                });
                return xit('deserializes as empty relationship', function () {
                  return expect(this.deserialized.comments.length).to.eq(0);
                });
              });
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/session/session.hierarchy', ['coalesce/namespace', 'coalesce/rest/adapter', '../support/configs', 'coalesce/context/default'], function (_export) {
  'use strict';

  var Coalesce, Adapter, postWithComments, Context;
  return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }, function (_coalesceRestAdapter) {
      Adapter = _coalesceRestAdapter['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }],
    execute: function () {
      describe("Session", function () {
        lazy('Adapter', function () {
          var A = (function (_Adapter) {
            babelHelpers.inherits(A, _Adapter);

            function A() {
              babelHelpers.classCallCheck(this, A);
              babelHelpers.get(Object.getPrototypeOf(A.prototype), 'constructor', this).apply(this, arguments);
            }

            return A;
          })(Adapter);

          ;
          A.prototype.load = function (model) {
            return Coalesce.Promise.resolve(model);
          };
          A.prototype._update = function (model) {
            return Promise.resolve(model);
          };
          A.prototype.flush = function (session) {
            var models;
            models = session.dirtyModels;
            return Coalesce.Promise.resolve(models.copy(true)).then(function (models) {
              return models.forEach(function (model) {
                return session.merge(model);
              });
            });
          };
          return A;
        });
        lazy('context', function () {
          var c;
          c = new Context(postWithComments());
          c.configure({
            adapter: this.Adapter
          });
          return c;
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('Comment', function () {
          return this.context.typeFor('comment');
        });
        describe('sibling sessions', function () {
          lazy('sessionA', function () {
            return this.context.newSession();
          });
          lazy('sessionB', function () {
            return this.context.newSession();
          });
          beforeEach(function () {
            this.sessionA.merge(this.Post.create({
              id: "1",
              title: 'original'
            }));
            return this.sessionB.merge(this.Post.create({
              id: "1",
              title: 'original'
            }));
          });
          return it('updates are isolated', function () {
            var pA, pB, postA, postB;
            postA = null;
            postB = null;
            pA = this.sessionA.load('post', 1).then(function (post) {
              postA = post;
              return postA.title = "a was here";
            });
            pB = this.sessionB.load('post', 1).then(function (post) {
              postB = post;
              return postB.title = "b was here";
            });
            return Coalesce.Promise.all([pA, pB]).then(function () {
              expect(postA.title).to.eq("a was here");
              return expect(postB.title).to.eq("b was here");
            });
          });
        });
        return describe("child session", function () {
          lazy('parent', function () {
            return this.context.newSession();
          });
          lazy('child', function () {
            return this.parent.newSession();
          });
          it('.flushIntoParent flushes updates immediately', function () {
            this.parent.merge(this.Post.create({
              id: "1",
              title: 'original'
            }));
            return this.child.load('post', 1).then((function (_this) {
              return function (childPost) {
                childPost.title = 'child version';
                return _this.parent.load('post', 1).then(function (parentPost) {
                  var f;
                  expect(parentPost.title).to.eq('original');
                  f = _this.child.flushIntoParent();
                  expect(parentPost.title).to.eq('child version');
                  return f;
                });
              };
            })(this));
          });
          it('.flush waits for success before updating parent', function () {
            this.parent.merge(this.Post.create({
              id: "1",
              title: 'original'
            }));
            return this.child.load('post', 1).then((function (_this) {
              return function (childPost) {
                childPost.title = 'child version';
                return _this.parent.load('post', 1).then(function (parentPost) {
                  var f;
                  expect(parentPost.title).to.eq('original');
                  f = _this.child.flush();
                  expect(parentPost.title).to.eq('original');
                  return f.then(function () {
                    return expect(parentPost.title).to.eq('child version');
                  });
                });
              };
            })(this));
          });
          it('does not mutate parent session relationships', function () {
            var post;
            post = this.parent.merge(this.Post.create({
              id: "1",
              title: 'parent',
              comments: [this.Comment.create({
                id: '2',
                post: this.Post.create({
                  id: "1"
                })
              })]
            }));
            expect(post.comments.length).to.eq(1);
            this.child.add(post);
            return expect(post.comments.length).to.eq(1);
          });
          return it('adds hasMany correctly', function () {
            var parentPost, post;
            parentPost = this.parent.merge(this.Post.create({
              id: "1",
              title: 'parent',
              comments: [this.Comment.create({
                id: '2',
                post: this.Post.create({
                  id: "1"
                })
              })]
            }));
            post = this.child.add(parentPost);
            expect(post).to.not.eq(parentPost);
            expect(post.comments.length).to.eq(1);
            expect(post.comments[0]).to.not.eq(parentPost.comments[0]);
            expect(post.comments[0].session).to.eq(this.child);
            return expect(post.comments[0].post).to.eq(post);
          });
        });
      });
    }
  };
});
System.register('coalesce-test/session/session', ['coalesce/namespace', 'coalesce/model/model', 'coalesce/serializers/model', '../support/configs', 'coalesce/context/default', 'coalesce/session/query', 'coalesce/rest/adapter'], function (_export) {
  'use strict';

  var Coalesce, Model, ModelSerializer, postWithComments, Context, Query, Adapter;
  return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }, function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }, function (_coalesceSerializersModel) {
      ModelSerializer = _coalesceSerializersModel['default'];
    }, function (_supportConfigs) {
      postWithComments = _supportConfigs.postWithComments;
    }, function (_coalesceContextDefault) {
      Context = _coalesceContextDefault['default'];
    }, function (_coalesceSessionQuery) {
      Query = _coalesceSessionQuery['default'];
    }, function (_coalesceRestAdapter) {
      Adapter = _coalesceRestAdapter['default'];
    }],
    execute: function () {
      describe("Session", function () {
        lazy('Adapter', function () {
          return (function (_Adapter) {
            babelHelpers.inherits(A, _Adapter);

            function A() {
              babelHelpers.classCallCheck(this, A);
              babelHelpers.get(Object.getPrototypeOf(A.prototype), 'constructor', this).apply(this, arguments);
            }

            return A;
          })(Adapter);
        });
        lazy('context', function () {
          var c;
          c = new Context(postWithComments());
          c.configure({
            adapter: this.Adapter
          });
          return c;
        });
        lazy('Post', function () {
          return this.context.typeFor('post');
        });
        lazy('Comment', function () {
          return this.context.typeFor('comment');
        });
        subject(function () {
          return this.context.newSession();
        });
        describe('.build', function () {
          it('instantiates a model', function () {
            var post;
            post = this.subject.build('post');
            expect(post).to.not.be["null"];
            return expect(this.subject.getModel(post)).to.not.eq(post);
          });
          return it('instantiates a model with attributes', function () {
            var post;
            post = this.subject.create('post', {
              title: 'test'
            });
            return expect(post.title).to.eq('test');
          });
        });
        describe('.create', function () {
          it('creates a model', function () {
            var post;
            post = this.subject.create('post');
            expect(post).to.not.be["null"];
            return expect(this.subject.getModel(post)).to.eq(post);
          });
          return it('creates a model with attributes', function () {
            var post;
            post = this.subject.create('post', {
              title: 'test'
            });
            return expect(post.title).to.eq('test');
          });
        });
        describe('.deleteModel', function () {
          return it('deletes a model', function () {
            var post;
            post = this.subject.merge(this.subject.build('post', {
              id: 1
            }));
            this.subject.deleteModel(post);
            return expect(post.isDeleted).to.be["true"];
          });
        });
        describe('.add', function () {
          it('works with lazy models', function () {
            var added, post;
            post = this.Post.create({
              id: "1"
            });
            added = this.subject.add(post);
            return expect(added.session).to.eq(this.subject);
          });
          it('reuses detached model', function () {
            var post;
            post = this.Post.create({
              title: 'test'
            });
            return expect(this.subject.add(post)).to.eq(post);
          });
          return it('overwrites unloaded models', function () {
            var lazy, post;
            lazy = this.Post.create({
              id: '1'
            });
            this.subject.add(lazy);
            post = this.subject.merge(this.Post.create({
              id: '1',
              title: 'post'
            }));
            this.subject.add(post);
            expect(this.subject.getModel(lazy)).to.eq(post);
            this.subject.add(lazy);
            return expect(this.subject.getModel(lazy)).to.eq(post);
          });
        });
        describe('.invalidate', function () {
          return it('causes existing model to be reloaded', function () {
            var hit, post;
            post = this.subject.merge(this.Post.create({
              id: '1',
              title: 'refresh me plz'
            }));
            hit = false;
            this.Adapter.prototype.load = function (model) {
              expect(model).to.eq(post);
              hit = true;
              return Coalesce.Promise.resolve(model);
            };
            post.load();
            expect(hit).to.be["false"];
            this.subject.invalidate(post);
            post.load();
            return expect(hit).to.be["true"];
          });
        });
        describe('.query', function () {
          it('returns a Query', function () {
            var res;
            this.Adapter.prototype.query = (function (_this) {
              return function () {
                return Coalesce.Promise.resolve([_this.Post.create({
                  id: 1
                })]);
              };
            })(this);
            return res = this.subject.query(this.Post).then(function (posts) {
              return expect(posts).to.be.an.instanceOf(Query);
            });
          });
          return it('utilizes cache on subsequence calls', function () {
            var hit, res;
            hit = 0;
            this.Adapter.prototype.query = (function (_this) {
              return function () {
                hit += 1;
                return Coalesce.Promise.resolve([_this.Post.create({
                  id: 1
                })]);
              };
            })(this);
            return res = this.subject.query(this.Post).then((function (_this) {
              return function (posts) {
                return _this.subject.query(_this.Post).then(function () {
                  return expect(hit).to.eq(1);
                });
              };
            })(this));
          });
        });
        describe('.fetchQuery', function () {
          return it('synchronously returns a query', function () {
            var res;
            res = this.subject.fetchQuery(this.Post);
            return expect(res).to.be.an.instanceOf(Query);
          });
        });
        describe('.refreshQuery', function () {
          return it('skips cache', function () {
            return it('utilizes cache on subsequence calls', function () {
              var hit, res;
              hit = 0;
              this.Adapter.prototype.query = (function (_this) {
                return function () {
                  hit += 1;
                  return Coalesce.Promise.resolve([_this.Post.create({
                    id: 1
                  })]);
                };
              })(this);
              return res = this.subject.query(this.Post).then(function (posts) {
                return this.subject.refreshQuery(posts).then(function () {
                  return expect(hit).to.eq(2);
                });
              });
            });
          });
        });
        describe('.invalidateQuery', function () {
          return it('clears cache', function () {
            var hit, res;
            hit = 0;
            this.Adapter.prototype.query = (function (_this) {
              return function () {
                hit += 1;
                return Coalesce.Promise.resolve([_this.Post.create({
                  id: 1
                })]);
              };
            })(this);
            return res = this.subject.query(this.Post).then((function (_this) {
              return function (posts) {
                _this.subject.invalidateQuery(posts);
                return _this.subject.query(_this.Post).then(function () {
                  return expect(hit).to.eq(2);
                });
              };
            })(this));
          });
        });
        describe('.invalidateQueries', function () {
          return it('clears cache for all queries', function () {
            var hit, res;
            hit = 0;
            this.Adapter.prototype.query = (function (_this) {
              return function () {
                hit += 1;
                return Coalesce.Promise.resolve([_this.Post.create({
                  id: 1
                })]);
              };
            })(this);
            return res = this.subject.query(this.Post).then((function (_this) {
              return function (posts) {
                _this.subject.invalidateQueries(_this.Post);
                return _this.subject.query(_this.Post).then(function () {
                  return expect(hit).to.eq(2);
                });
              };
            })(this));
          });
        });
        describe('.merge', function () {
          it('reuses detached model', function () {
            var post;
            post = this.Post.create({
              id: "1",
              title: 'test'
            });
            return expect(this.subject.merge(post)).to.eq(post);
          });
          it('emites willMerge and didMerge', function () {
            var didMergeHit, post, willMergeHit;
            willMergeHit = false;
            didMergeHit = false;
            this.subject.on('willMerge', function () {
              return willMergeHit = true;
            });
            this.subject.on('didMerge', function () {
              return didMergeHit = true;
            });
            post = this.Post.create({
              id: "1",
              title: 'test'
            });
            this.subject.merge(post);
            expect(willMergeHit).to.be["true"];
            return expect(didMergeHit).to.be["true"];
          });
          it('handles merging detached model with hasMany child already in session', function () {
            var comment, post;
            comment = this.subject.merge(this.Comment.create({
              id: "1",
              body: "obscurity",
              post: this.Post.create({
                id: "2"
              })
            }));
            post = this.subject.merge(this.Post.create({
              id: "2",
              comments: []
            }));
            post.comments.addObject(this.Comment.create({
              id: "1",
              body: "obscurity"
            }));
            return expect(post.comments[0]).to.eq(comment);
          });
          it('handles merging detached model with belongsTo child already in session', function () {
            var comment, post;
            post = this.subject.merge(this.Post.create({
              id: "2",
              comments: [this.Comment.create({
                id: "1"
              })]
            }));
            comment = this.subject.merge(this.Comment.create({
              id: "1",
              body: "obscurity",
              post: this.Post.create({
                id: "2",
                comments: [this.Comment.create({
                  id: "1"
                })]
              })
            }));
            return expect(comment.post).to.eq(post);
          });
          it('handles merging detached model with lazy belongsTo reference', function () {
            var comment, post;
            post = this.subject.merge(this.Post.create({
              id: "2",
              comments: []
            }));
            comment = this.subject.merge(this.Comment.create({
              id: "1",
              body: "obscurity",
              post: this.Post.create({
                id: "2"
              })
            }));
            expect(post.comments[0]).to.eq(comment);
            return expect(post.isDirty).to.be["false"];
          });
          it('handles merging detached model with lazy hasMany reference', function () {
            var comment, post;
            comment = this.subject.merge(this.Comment.create({
              id: "1",
              body: "obscurity",
              post: null
            }));
            post = this.subject.merge(this.Post.create({
              id: "2",
              comments: [this.Comment.create({
                id: "1"
              })]
            }));
            expect(comment.post).to.eq(post);
            return expect(comment.isDirty).to.be["false"];
          });
          return it('reuses existing hasMany arrays', function () {
            var comments, post;
            post = this.subject.merge(this.Post.create({
              id: "2",
              comments: []
            }));
            comments = post.comments;
            this.subject.merge(this.Post.create({
              id: "2",
              comments: [this.Comment.create({
                id: "1",
                post: this.Post.create({
                  id: "2"
                })
              })]
            }));
            return expect(comments.length).to.eq(1);
          });
        });
        describe('.markClean', function () {
          it('makes models no longer dirty', function () {
            var post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            post.title = 'dirty bastard';
            expect(post.isDirty).to.be["true"];
            this.subject.markClean(post);
            return expect(post.isDirty).to.be["false"];
          });
          return it('works with already clean models', function () {
            var post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            expect(post.isDirty).to.be["false"];
            this.subject.markClean(post);
            return expect(post.isDirty).to.be["false"];
          });
        });
        describe('.touch', function () {
          return it('makes the model dirty', function () {
            var post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            expect(post.isDirty).to.be["false"];
            this.subject.touch(post);
            return expect(post.isDirty).to.be["true"];
          });
        });
        describe('.flush', function () {
          beforeEach(function () {
            this.Adapter.prototype._update = function (model) {
              return Promise.resolve(model);
            };
            return this.Adapter.prototype.flush = function (subject1) {
              var models;
              this.subject = subject1;
              models = this.subject.dirtyModels;
              return Coalesce.Promise.resolve(models.copy(true)).then(function (models) {
                return models.forEach(function (model) {
                  return this.subject.merge(model);
                });
              });
            };
          });
          it('can update while flush is pending', function () {
            var f1, post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'original'
            }));
            post.title = 'update 1';
            f1 = this.subject.flush();
            post.title = 'update 2';
            expect(post.title).to.eq('update 2');
            return f1.then((function (_this) {
              return function () {
                expect(post.title).to.eq('update 2');
                post.title = 'update 3';
                return _this.subject.flush().then(function () {
                  return expect(post.title).to.eq('update 3');
                });
              };
            })(this));
          });
          return it('emits willFlush event', function () {
            return it('can update while flush is pending', function () {
              var post, willFlushHit;
              willFlushHit = false;
              this.subject.on('willFlush', (function (_this) {
                return function () {
                  return willFlushHit = true;
                };
              })(this));
              post = this.subject.merge(this.Post.create({
                id: "1",
                title: 'original'
              }));
              post.title = 'update 1';
              return this.subject.flush().then((function (_this) {
                return function () {
                  return expect(willFlushHit).to.be["true"];
                };
              })(this));
            });
          });
        });
        describe('.isDirty', function () {
          it('is true when models are dirty', function () {
            var post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            expect(this.subject.isDirty).to.be["false"];
            this.subject.touch(post);
            return expect(this.subject.isDirty).to.be["true"];
          });
          return it('becomes false after successful flush', function () {
            var post;
            post = this.subject.merge(this.Post.create({
              id: "1",
              title: 'test'
            }));
            this.subject.touch(post);
            expect(this.subject.isDirty).to.be["true"];
            return this.subject.flush().then((function (_this) {
              return function () {
                return expect(_this.subject.isDirty).to.be["false"];
              };
            })(this));
          });
        });
        describe('.mergeData', function () {
          return it('should merge in data', function () {
            var post;
            post = this.subject.mergeData({
              id: "1",
              title: "easy peazy"
            }, 'post');
            expect(post.title).to.eq('easy peazy');
            return expect(this.subject.getModel(post)).to.eq(post);
          });
        });
        return context('with parent session', function () {
          subject(function () {
            return this._super.subject.newSession();
          });
          lazy('parent', function () {
            return this.subject.parent;
          });
          describe('.query', function () {
            return it('queries', function () {
              this.Adapter.prototype.query = (function (_this) {
                return function (type, query) {
                  expect(query).to.eql({
                    q: "herpin"
                  });
                  return Coalesce.Promise.resolve([_this.Post.create({
                    id: "1",
                    title: 'herp'
                  }), _this.Post.create({
                    id: "2",
                    title: 'derp'
                  })]);
                };
              })(this);
              return this.subject.query('post', {
                q: "herpin"
              }).then((function (_this) {
                return function (models) {
                  return expect(models.length).to.eq(2);
                };
              })(this));
            });
          });
          describe('.load', function () {
            return it('loads from parent session', function () {
              this.parent.merge(this.Post.create({
                id: "1",
                title: "flash gordon"
              }));
              return this.subject.load(this.Post, 1).then((function (_this) {
                return function (post) {
                  expect(post).to.not.eq(_this.parent.getModel(post));
                  return expect(post.title).to.eq('flash gordon');
                };
              })(this));
            });
          });
          return describe('.add', function () {
            return it('includes lazy relationships', function () {
              var comment, parentComment;
              parentComment = this.parent.merge(this.Comment.create({
                id: "1",
                post: this.Post.create({
                  id: "2"
                })
              }));
              comment = this.subject.add(parentComment);
              expect(comment).to.not.eq(parentComment);
              expect(comment.post).to.not.be["null"];
              return expect(comment.post.session).to.eq(this.subject);
            });
          });
        });
      });
    }
  };
});
System.register('coalesce-test/support/async', ['coalesce/namespace'], function (_export) {

  // simple promise wrapper for set timeout

  'use strict';

  var Coalesce;
  function delay(delay, fn) {
    return new Coalesce.Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve(fn());
      }, delay);
    });
  }return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }],
    execute: function () {
      ;

      _export('delay', delay);
    }
  };
});
System.register('coalesce-test/support/configs', ['coalesce/model/model'], function (_export) {
  'use strict';

  var Model;

  function post() {
    var Post = (function (_Model) {
      babelHelpers.inherits(Post, _Model);

      function Post() {
        babelHelpers.classCallCheck(this, Post);
        babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
      }

      return Post;
    })(Model);

    ;
    Post.defineSchema({
      attributes: {
        title: { type: 'string' },
        submitted: { type: 'boolean' }
      }
    });

    return {
      types: {
        post: Post
      }
    };
  }

  //
  // Common context configurations for tests

  function postWithComments() {
    var Post = (function (_Model2) {
      babelHelpers.inherits(Post, _Model2);

      function Post() {
        babelHelpers.classCallCheck(this, Post);
        babelHelpers.get(Object.getPrototypeOf(Post.prototype), 'constructor', this).apply(this, arguments);
      }

      return Post;
    })(Model);

    Post.defineSchema({
      attributes: {
        title: { type: 'string' }
      },
      relationships: {
        comments: { kind: 'hasMany', type: 'comment' }
      }
    });

    var Comment = (function (_Model3) {
      babelHelpers.inherits(Comment, _Model3);

      function Comment() {
        babelHelpers.classCallCheck(this, Comment);
        babelHelpers.get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);
      }

      return Comment;
    })(Model);

    Comment.defineSchema({
      attributes: {
        body: { type: 'string' }
      },
      relationships: {
        post: { kind: 'belongsTo', type: 'post' }
      }
    });

    return {
      types: {
        post: Post,
        comment: Comment
      }
    };
  }

  function postWithEmbeddedComments() {
    var c = postWithComments();
    c.types.post.defineSchema({
      relationships: {
        comments: { kind: 'hasMany', type: 'comment', embedded: 'always' }
      }
    });
    return c;
  }

  function userWithProfile() {
    var Profile = (function (_Model4) {
      babelHelpers.inherits(Profile, _Model4);

      function Profile() {
        babelHelpers.classCallCheck(this, Profile);
        babelHelpers.get(Object.getPrototypeOf(Profile.prototype), 'constructor', this).apply(this, arguments);
      }

      return Profile;
    })(Model);

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

    var User = (function (_Model5) {
      babelHelpers.inherits(User, _Model5);

      function User() {
        babelHelpers.classCallCheck(this, User);
        babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
      }

      return User;
    })(Model);

    ;
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

  function userWithEmbeddedProfile() {
    var c = userWithProfile();
    c.types.profile.defineSchema({
      relationships: {
        user: { kind: 'belongsTo', type: 'user', embedded: 'always' }
      }
    });
    return c;
  }

  function groupWithMembersWithUsers() {
    var Group = (function (_Model6) {
      babelHelpers.inherits(Group, _Model6);

      function Group() {
        babelHelpers.classCallCheck(this, Group);
        babelHelpers.get(Object.getPrototypeOf(Group.prototype), 'constructor', this).apply(this, arguments);
      }

      return Group;
    })(Model);

    ;
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

    var Member = (function (_Model7) {
      babelHelpers.inherits(Member, _Model7);

      function Member() {
        babelHelpers.classCallCheck(this, Member);
        babelHelpers.get(Object.getPrototypeOf(Member.prototype), 'constructor', this).apply(this, arguments);
      }

      return Member;
    })(Model);

    ;
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

    var User = (function (_Model8) {
      babelHelpers.inherits(User, _Model8);

      function User() {
        babelHelpers.classCallCheck(this, User);
        babelHelpers.get(Object.getPrototypeOf(User.prototype), 'constructor', this).apply(this, arguments);
      }

      return User;
    })(Model);

    ;
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
    };
  }

  return {
    setters: [function (_coalesceModelModel) {
      Model = _coalesceModelModel['default'];
    }],
    execute: function () {
      _export('post', post);

      _export('postWithComments', postWithComments);

      _export('postWithEmbeddedComments', postWithEmbeddedComments);

      _export('userWithProfile', userWithProfile);

      _export('userWithEmbeddedProfile', userWithEmbeddedProfile);

      _export('groupWithMembersWithUsers', groupWithMembersWithUsers);
    }
  };
});
System.register('coalesce-test/support/server', ['coalesce/namespace'], function (_export) {

  //
  // Wrapper around sinon fake server
  //

  'use strict';

  var Coalesce, Server;
  return {
    setters: [function (_coalesceNamespace) {
      Coalesce = _coalesceNamespace['default'];
    }],
    execute: function () {
      Server = (function () {
        function Server(sinon) {
          var _this = this;

          babelHelpers.classCallCheck(this, Server);

          this.sinon = sinon;
          this.xhr = sinon.useFakeXMLHttpRequest();
          this.xhr.onCreate = function (xhr) {
            _this.handleRequest(xhr);
          };
          this.handlers = {};
          // history
          this.h = [];
        }

        // setup automatically for all tests
        babelHelpers.createClass(Server, [{
          key: 'restore',
          value: function restore() {
            this.xhr.restore();
          }
        }, {
          key: 'r',
          value: function r(str, fn) {
            if (typeof fn !== 'function') {
              var orig = fn;
              fn = function () {
                return orig;
              };
            }

            this.handlers[str] = fn;
          }
        }, {
          key: 'handleRequest',
          value: function handleRequest(xhr) {
            var _this2 = this;

            setTimeout(function () {
              var path = xhr.url.split('?')[0],
                  str = xhr.method + ':' + path,
                  fn = _this2.handlers[str],
                  h = _this2.h;

              console.assert(fn, 'No handler defined for ' + str);

              var result = Coalesce.Promise.resolve(fn(xhr));
              result.then(function (res) {
                h.push(str);
                if (xhr.readyState === 4) return;
                xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(res));
              }, function (res) {
                h.push(str);
                if (xhr.readyState === 4) return;
                xhr.respond(500, { "Content-Type": "application/json" }, JSON.stringify(res));
              });
            }, 10);
          }
        }]);
        return Server;
      })();

      _export('Server', Server);

      beforeEach(function () {
        this.server = new Server(sinon);
      });

      afterEach(function () {
        this.server.restore();
      });
    }
  };
});