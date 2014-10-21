`import Model from 'coalesce/model/model'`
`import ModelSerializer from 'coalesce/serializers/model'`
`import {postWithComments} from '../support/schemas'`
`import Container from 'coalesce/container'`
`import Query from 'coalesce/session/query'`

describe "Session", ->

  session = null
  adapter = null
  
  reset = ->
    @App = {}
    @container = new Container()
    Coalesce.__container__ = @container

    postWithComments.apply(this)

    adapter = @container.lookup('adapter:main')
    @container = adapter.container
    session = adapter.newSession()

  beforeEach ->
    reset.apply(@)

  describe '.saveTo and loadFrom Storage', ->
    beforeEach ->
      session.clearStorage()
    
    it 'should save to storage', ->
      post = session.merge @Post.create id: '1', title: 'save me plz'
      post2 = session.merge @Post.create id: '2', title: 'save me plz to'
      post3 = session.merge @Post.create id: '3', title: 'save me plz too'
      post4 = session.create 'post', title: 'Im new'

      session.saveToStorage().then (value) =>
        expect(value.models.post.length).to.eq(4)
        expect(value.newModels.post.length).to.eq(1)

        expect(value.models.post[0].title).to.eq(post.title)
        expect(value.newModels.post[0].title).to.eq(post4.title)

        # Reset everything 
        reset.apply(@)
        
        # XXX: wtf, tests seem to sporadically fail without this sleep, despite
        # both setItem and getItem returning promises. Maybe localforage promise
        # implementation bug?
        timeout = new Coalesce.Promise (resolve, reject) ->
          Coalesce.run.later resolve

        timeout.then ->
          expect(post.session).to.not.eq(session)

          expect(session.getForId('post', 1)).to.be.undefined
          expect(session.getForId('post', 2)).to.be.undefined
          expect(session.getForId('post', 3)).to.be.undefined

          session.loadFromStorage().then (value) =>
            expect(session.getForId('post', 1)).to.not.be.undefined
            expect(session.getForId('post', 2)).to.not.be.undefined
            expect(session.getForId('post', 3)).to.not.be.undefined
        
  describe '.loading Storage', ->  
    it 'should skip loading from storage when storage is empty', ->
      session.clearStorage().then (_session) ->
        # debugger
        _session.loadFromStorage().then((value) ->
          # debugger
          expect(_session.models).to.not.be.null
          return
        , (error) ->
          # something wrong throw error
          expect(error).to.be.null
          return
        )     

  describe '.build', ->
  
    it 'instantiates a model', ->
      post = session.build('post')
      expect(post).to.not.be.null
      expect(session.getModel(post)).to.not.eq(post)
      
    it 'instantiates a model with attributes', ->
      post = session.create('post', title: 'test')
      expect(post.title).to.eq('test')
      

  describe '.create', ->

    it 'creates a model', ->
      post = session.create('post')
      expect(post).to.not.be.null
      expect(session.getModel(post)).to.eq(post)

    it 'creates a model with attributes', ->
      post = session.create('post', title: 'test')
      expect(post.title).to.eq('test')


  describe '.deleteModel', ->

    it 'deletes a model', ->
      post = session.merge session.build 'post', id: 1
      session.deleteModel post
      expect(post.isDeleted).to.be.true


  describe '.add', ->

    it 'works with lazy models', ->
      post = @Post.create id: "1"
      added = session.add(post)
      expect(added.session).to.eq(session)

    it 'reuses detached model', ->
      post = @Post.create(title: 'test')
      expect(session.add(post)).to.eq(post)


    it 'overwrites unloaded models', ->
      lazy = @Post.create id: '1'
      session.add(lazy)
      post = session.merge(@Post.create(id: '1', title: 'post'))
      session.add(post)
      expect(session.getModel(lazy)).to.eq(post)
      session.add(lazy)
      expect(session.getModel(lazy)).to.eq(post)


  describe '.invalidate', ->

    it 'causes existing model to be reloaded', ->
      post = session.merge @Post.create id: '1', title: 'refresh me plz'
      hit = false
      adapter.load = (model) ->
        expect(model).to.eq(post)
        hit = true
        Coalesce.Promise.resolve(model)
      post.load()
      expect(hit).to.be.false
      session.invalidate(post)
      post.load()
      expect(hit).to.be.true
      
  describe '.query', ->
    
    it 'returns a Query', ->
      adapter.query = =>
        Coalesce.Promise.resolve([@Post.create id: 1])
        
      res = session.query(@Post).then (posts) ->
        expect(posts).to.be.an.instanceOf(Query)
    
    it 'utilizes cache on subsequence calls', ->
      hit = 0
      adapter.query = =>
        hit += 1
        Coalesce.Promise.resolve([@Post.create id: 1])
        
      res = session.query(@Post).then (posts) =>
        session.query(@Post).then ->
          expect(hit).to.eq(1)
    
  describe '.fetchQuery', ->
    
    it 'synchronously returns a query', ->
      res = session.fetchQuery(@Post)
      expect(res).to.be.an.instanceOf(Query)
    
  describe '.refreshQuery', ->
    
    it 'skips cache', ->
      it 'utilizes cache on subsequence calls', ->
        hit = 0
        adapter.query = =>
          hit += 1
          Coalesce.Promise.resolve([@Post.create id: 1])
          
        res = session.query(@Post).then (posts) ->
          session.refreshQuery(posts).then ->
            expect(hit).to.eq(2)
    
  describe '.invalidateQuery', ->
    
    it 'clears cache', ->
      hit = 0
      adapter.query = =>
        hit += 1
        Coalesce.Promise.resolve([@Post.create id: 1])
        
      res = session.query(@Post).then (posts) =>
        session.invalidateQuery(posts)
        session.query(@Post).then ->
          expect(hit).to.eq(2)
    
  describe '.invalidateQueries', ->
    
    it 'clears cache for all queries', ->
      hit = 0
      adapter.query = =>
        hit += 1
        Coalesce.Promise.resolve([@Post.create id: 1])
        
      res = session.query(@Post).then (posts) =>
        session.invalidateQueries(@Post)
        session.query(@Post).then ->
          expect(hit).to.eq(2)

  describe '.merge', ->

    it 'reuses detached model', ->
      post = @Post.create(id: "1", title: 'test')
      expect(session.merge(post)).to.eq(post)


    it 'handles merging detached model with hasMany child already in session', ->
      comment = session.merge @Comment.create(id: "1", body: "obscurity", post: @Post.create(id: "2"))
      post = session.merge @Post.create(id: "2", comments: [])
      post.comments.addObject(@Comment.create(id: "1", body: "obscurity"))
      expect(post.comments[0]).to.eq(comment)


    it 'handles merging detached model with belongsTo child already in session', ->
      post = session.merge @Post.create(id: "2", comments: [@Comment.create(id: "1")])
      comment = session.merge @Comment.create(id: "1", body: "obscurity", post: @Post.create(id: "2", comments: [@Comment.create(id: "1")]))
      expect(comment.post).to.eq(post)
      
      
    it 'handles merging detached model with lazy belongsTo reference', ->
      post = session.merge @Post.create id: "2", comments: []
      comment = session.merge @Comment.create id: "1", body: "obscurity", post: @Post.create(id: "2")
      expect(post.comments[0]).to.eq(comment)
      expect(post.isDirty).to.be.false


    it 'handles merging detached model with lazy hasMany reference', ->
      comment = session.merge @Comment.create id: "1", body: "obscurity", post: null
      post = session.merge @Post.create id: "2", comments: [@Comment.create(id: "1")]
      expect(comment.post).to.eq(post)
      expect(comment.isDirty).to.be.false

    it 'reuses existing hasMany arrays', ->
      post = session.merge @Post.create id: "2", comments: []
      comments = post.comments
      session.merge @Post.create id: "2", comments: [@Comment.create(id: "1", post: @Post.create(id: "2"))]
      expect(comments.length).to.eq(1)


  describe '.markClean', ->

    it 'makes models no longer dirty', ->
      post = session.merge @Post.create(id: "1", title: 'test')
      post.title = 'dirty bastard'
      expect(post.isDirty).to.be.true
      session.markClean(post)
      expect(post.isDirty).to.be.false

    it 'works with already clean models', ->
      post = session.merge @Post.create(id: "1", title: 'test')
      expect(post.isDirty).to.be.false
      session.markClean(post)
      expect(post.isDirty).to.be.false

  describe '.touch', ->

    it 'makes the model dirty', ->
      post = session.merge @Post.create(id: "1", title: 'test')
      expect(post.isDirty).to.be.false
      session.touch(post)
      expect(post.isDirty).to.be.true


  describe 'flushing', ->

    beforeEach ->
      adapter.flush = (session) ->
        models = session.dirtyModels
        Coalesce.Promise.resolve(models.copy(true)).then (models) ->
          models.forEach (model) -> session.merge(model)

    it 'can update while flush is pending', ->
      post = session.merge @Post.create(id: "1", title: 'original')
      post.title = 'update 1'
      f1 = session.flush()
      post.title = 'update 2'
      expect(post.title).to.eq('update 2')

      f1.then ->
        expect(post.title).to.eq('update 2')
        post.title = 'update 3'
        session.flush().then ->
          expect(post.title).to.eq('update 3')

  describe '.isDirty', ->

    it 'is true when models are dirty', ->
      post = session.merge @Post.create(id: "1", title: 'test')
      expect(session.isDirty).to.be.false
      session.touch(post)
      expect(session.isDirty).to.be.true

    it 'becomes false after successful flush', ->
      post = session.merge @Post.create(id: "1", title: 'test')
      session.touch(post)
      expect(session.isDirty).to.be.true
      session.flush().then ->
        expect(session.isDirty).to.be.false


  describe '.mergeData', ->

    it 'should merge in data', ->
      post = session.mergeData {id: "1", title: "easy peazy"}, 'post'
      expect(post.title).to.eq('easy peazy')
      expect(session.getModel(post)).to.eq(post)


  context 'with parent session', ->

    Post = null
    parent = null

    beforeEach ->
      parent = session
      session = parent.newSession()
      Post = @Post

    describe '.query', ->

      it 'queries', ->
        adapter.query = (type, query) ->
          expect(query).to.eql({q: "herpin"})
          Coalesce.Promise.resolve([Post.create(id: "1", title: 'herp'), Post.create(id: "2", title: 'derp')])
        session.query('post', {q: "herpin"}).then (models) ->
          expect(models.length).to.eq(2)

    describe '.load', ->

      it 'loads from parent session', ->
        parent.merge Post.create(id: "1", title: "flash gordon")
        session.load(Post, 1).then (post) ->
          expect(post).to.not.eq(parent.getModel(post))
          expect(post.title).to.eq('flash gordon')
        
        
    describe '.add', ->
    
      it 'includes lazy relationships', ->
        parentComment = parent.merge @Comment.create(id: "1", post: Post.create(id: "2"))
        comment = session.add(parentComment)
        expect(comment).to.not.eq(parentComment)
        expect(comment.post).to.not.be.bull
        expect(comment.post.session).to.eq(session)
