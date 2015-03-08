`import Model from 'coalesce/entities/model'`
`import ModelSerializer from 'coalesce/serializers/model'`
`import {postWithComments} from '../support/configs'`
`import Context from 'coalesce/context/default'`
`import Query from 'coalesce/entities/query'`
# Use rest adapter for now
`import Adapter from 'coalesce/rest/adapter'`

describe "Session", ->

  lazy 'Adapter', -> `class A extends Adapter {}`

  lazy 'context', ->
    c = new Context(postWithComments())
    c.configure
      adapter: @Adapter
    c
    
  lazy 'Post', ->
    @context.typeFor 'post'
    
  lazy 'Comment', ->
    @context.typeFor 'comment'
    
  subject ->
    @context.newSession()

  describe '.build', ->
  
    it 'instantiates a model', ->
      post = @subject.build('post')
      expect(post).to.not.be.null
      expect(@subject.fetch(post)).to.not.eq(post)
      
    it 'instantiates a model with attributes', ->
      post = @subject.build('post', title: 'test')
      expect(post.title).to.eq('test')
      

  describe '.create', ->

    it 'creates a model', ->
      post = @subject.create('post')
      expect(post).to.not.be.null
      expect(@subject.getModel(post)).to.eq(post)

    it 'creates a model with attributes', ->
      post = @subject.create('post', title: 'test')
      expect(post.title).to.eq('test')


  describe '.deleteModel', ->

    it 'deletes a model', ->
      post = @subject.merge @subject.build 'post', id: 1
      @subject.deleteModel post
      expect(post.isDeleted).to.be.true


  describe '.invalidate', ->

    it 'causes existing model to be reloaded', ->
      post = @subject.merge new @Post id: '1', title: 'refresh me plz'
      hit = false
      @Adapter.prototype.load = (model) ->
        expect(model).to.eq(post)
        hit = true
        Coalesce.Promise.resolve(model)
      post.load()
      expect(hit).to.be.false
      @subject.invalidate(post)
      post.load()
      expect(hit).to.be.true
      
    context 'with query', ->
      
      it 'it causes query to be reloaded', ->
        hit = 0
        @Adapter.prototype.load = (entity) =>
          hit += 1
          Coalesce.Promise.resolve(entity)
          
        res = @subject.query(@Post).then (posts) =>
          @subject.invalidate(posts)
          @subject.query(@Post).then ->
            expect(hit).to.eq(2)
      
  describe '.query', ->
    
    it 'returns a Query', ->
      @Adapter.prototype.load = (query) =>
        query.push(new @Post(id: 1))
        Coalesce.Promise.resolve query
        
      res = @subject.query(@Post).then (posts) ->
        expect(posts).to.be.an.instanceOf(Query)
    
    it 'utilizes cache on subsequence calls', ->
      hit = 0
      @Adapter.prototype.load = (query) =>
        hit += 1
        query.push(new @Post(id: 1))
        Coalesce.Promise.resolve query
        
      res = @subject.query(@Post).then (posts) =>
        @subject.query(@Post).then ->
          expect(hit).to.eq(1)
    
  describe '.fetchQuery', ->
    
    it 'synchronously returns a query', ->
      res = @subject.fetchQuery(@Post)
      expect(res).to.be.an.instanceOf(Query)
    
    
  describe '.invalidateQueries', ->
    
    it 'clears cache for all queries', ->
      hit = 0
      @Adapter.prototype.load = (query) =>
        hit += 1
        query.push(new @Post(id: 1))
        Coalesce.Promise.resolve query
        
      res = @subject.query(@Post).then (posts) =>
        @subject.invalidateQueries(@Post)
        @subject.query(@Post).then ->
          expect(hit).to.eq(2)

  describe '.merge', ->

    xit 'reuses detached model', ->
      post = new @Post(id: "1", title: 'test')
      expect(@subject.merge(post)).to.eq(post)
      
    
    xit 'emites willMerge and didMerge', ->
      willMergeHit = false
      didMergeHit = false
      @subject.on 'willMerge', ->
        willMergeHit = true
      @subject.on 'didMerge', ->
        didMergeHit = true
        
      post = new @Post(id: "1", title: 'test')
      @subject.merge(post)
      expect(willMergeHit).to.be.true
      expect(didMergeHit).to.be.true


    it 'handles merging detached model with hasMany child already in session', ->
      comment = @subject.merge new @Comment(id: "1", body: "obscurity", post: new @Post(id: "2"))
      post = @subject.merge new @Post(id: "2", comments: [])
      post.comments.addObject(new @Comment(id: "1", body: "obscurity"))
      expect(post.comments[0]).to.eq(comment)


    it 'handles merging detached model with belongsTo child already in session', ->
      post = @subject.merge new @Post(id: "2", comments: [new @Comment(id: "1")])
      comment = @subject.merge new @Comment(id: "1", body: "obscurity", post: new @Post(id: "2", comments: [new @Comment(id: "1")]))
      expect(comment.post).to.eq(post)
      
      
    it 'handles merging detached model with lazy belongsTo reference', ->
      post = @subject.merge new @Post id: "2", comments: []
      comment = @subject.merge new @Comment id: "1", body: "obscurity", post: new @Post(id: "2")
      expect(post.comments[0]).to.eq(comment)
      expect(post.isDirty).to.be.false


    it 'handles merging detached model with lazy hasMany reference', ->
      comment = @subject.merge new @Comment id: "1", body: "obscurity", post: null
      post = @subject.merge new @Post id: "2", comments: [new @Comment(id: "1")]
      expect(comment.post).to.eq(post)
      expect(comment.isDirty).to.be.false

    it 'reuses existing hasMany arrays', ->
      post = @subject.merge new @Post id: "2", comments: []
      comments = post.comments
      @subject.merge new @Post id: "2", comments: [new @Comment(id: "1", post: new @Post(id: "2"))]
      expect(comments.length).to.eq(1)


  describe '.markClean', ->

    it 'makes models no longer dirty', ->
      post = @subject.merge new @Post(id: "1", title: 'test')
      post.title = 'dirty bastard'
      expect(post.isDirty).to.be.true
      @subject.markClean(post)
      expect(post.isDirty).to.be.false

    it 'works with already clean models', ->
      post = @subject.merge new @Post(id: "1", title: 'test')
      expect(post.isDirty).to.be.false
      @subject.markClean(post)
      expect(post.isDirty).to.be.false

  describe '.touch', ->

    it 'makes the model dirty', ->
      post = @subject.merge new @Post(id: "1", title: 'test')
      expect(post.isDirty).to.be.false
      @subject.touch(post)
      expect(post.isDirty).to.be.true


  describe '.flush', ->

    beforeEach ->
      @Adapter.prototype._update = (model) -> Promise.resolve(model)
      @Adapter.prototype.flush = (@subject) ->
        models = @subject.dirtyModels
        Coalesce.Promise.resolve(models.copy(true)).then (models) ->
          models.forEach (model) -> @subject.merge(model)

    it 'can update while flush is pending', ->
      post = @subject.merge new @Post(id: "1", title: 'original')
      post.title = 'update 1'
      f1 = @subject.flush()
      post.title = 'update 2'
      expect(post.title).to.eq('update 2')

      f1.then =>
        expect(post.title).to.eq('update 2')
        post.title = 'update 3'
        @subject.flush().then ->
          expect(post.title).to.eq('update 3')
          
    it 'emits willFlush event', ->
      it 'can update while flush is pending', ->
        willFlushHit = false
        @subject.on 'willFlush', =>
          willFlushHit = true
        post = @subject.merge new @Post(id: "1", title: 'original')
        post.title = 'update 1'
        @subject.flush().then =>
          expect(willFlushHit).to.be.true

  describe '.isDirty', ->

    it 'is true when models are dirty', ->
      post = @subject.merge new @Post(id: "1", title: 'test')
      expect(@subject.isDirty).to.be.false
      @subject.touch(post)
      expect(@subject.isDirty).to.be.true

    it 'becomes false after successful flush', ->
      post = @subject.merge new @Post(id: "1", title: 'test')
      @subject.touch(post)
      expect(@subject.isDirty).to.be.true
      @subject.flush().then =>
        expect(@subject.isDirty).to.be.false


  describe '.mergeData', ->

    xit 'should merge in data', ->
      post = @subject.mergeData {id: "1", title: "easy peazy"}, 'post'
      expect(post.title).to.eq('easy peazy')
      expect(@subject.getModel(post)).to.eq(post)

  
  # TODO move these tests to entity tests
  describe '.update', ->
    
    # TODO: looks like update no longer includes relationships
    # we need to manually call update on the relationship... child sessions
    # will do this during flush as well
    it 'updates hasMany relationship', ->
      @post = @subject.merge new @Post id: 1, title: 'hi', comments: []
      updatedPost = new @Post id: 1, title: 'hello', comments: []
      updatedPost.comments.push new @Comment id:2, post: updatedPost 
      @subject.update updatedPost
      expect(@post.comments.length).to.eq(1)

    xit 'updates hasMany relationship from new model', ->
      @post = @subject.merge new @Post id: 1, title: 'hi', comments: []
      updatedPost = new @Post id: 1, title: 'hello', comments: []
      updatedPost.comments.push new @Comment post: updatedPost
      @subject.update updatedPost
      expect(@post.comments.length).to.eq(1)

  context 'with parent session', ->

    subject ->
      @_super.subject.newSession()
    lazy 'parent', ->
      @subject.parent

    describe '.query', ->

      it 'queries', ->
        @Adapter.prototype.load = (query) =>
          expect(query.params).to.eql({q: "herpin"})
          query.addObjects([
            new @Post(id: "1", title: 'herp', clientId: 'post1')
            new @Post(id: "2", title: 'derp', clientId: 'post2')
          ])
          Coalesce.Promise.resolve(query)
        @subject.query('post', {q: "herpin"}).then (query) =>
          expect(query.length).to.eq(2)

    describe '.load', ->

      it 'loads from parent session', ->
        @parent.merge new @Post(id: "1", title: "flash gordon")
        @subject.load(@Post, 1).then (post) =>
          expect(post).to.not.eq(@parent.getModel(post))
          expect(post.title).to.eq('flash gordon')
        
        
    describe '.fetch', ->
    
      it 'includes belongsTo lazily', ->
        parentComment = @parent.merge new @Comment(id: "1", post: new @Post(id: "2"))
        comment = @subject.fetch(parentComment)
        expect(comment).to.not.eq(parentComment)
        expect(comment.post).to.not.be.empty
        expect(comment.post.session).to.eq(@subject)
        
      it 'includes hasMany lazily', ->
        parentPost = @parent.merge new @Post(id: "1", comments: [new @Comment(id: "2")])
        post = @subject.fetch(parentPost)
        expect(post).to.not.eq(parentPost)
        expect(post.comments).to.not.be.empty
        expect(post.comments[0]).to.not.be.empty
