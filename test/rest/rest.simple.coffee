`import Context from 'coalesce/rest/context'`
`import Model from 'coalesce/entities/model'`

describe "rest with simple model", ->

  lazy 'Post', ->
    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
    Post
  lazy 'context', ->
    new Context
      types:
        post: @Post
  lazy 'session', -> @context.newSession()

  it 'loads', ->
    @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw'}
    @session.load(@Post, 1).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['GET:/posts/1'])


  it 'saves', ->
    @server.r 'POST:/posts', -> posts: {client_id: post.clientId, id: 1, title: 'mvcc ftw'}

    post = new @session('post')
    post.title = 'mvcc ftw'

    @session.flush().then =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['POST:/posts'])


  it 'updates', ->
    @server.r 'PUT:/posts/1', -> posts: {id: 1, title: 'updated'}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load('post', 1).then (post) =>
      expect(post.title).to.eq('test')
      post.title = 'updated'
      @session.flush().then =>
        expect(post.title).to.eq('updated')
        expect(@server.h).to.eql(['PUT:/posts/1'])


  it 'updates multiple times', ->
    @server.r 'PUT:/posts/1', -> posts: {id: 1, title: 'updated'}

    post = new @session.merge @Post(id: "1", title: 'test')

    expect(post.title).to.eq('test')
    post.title = 'updated'

    @session.flush().then =>
      expect(post.title).to.eq('updated')
      expect(@server.h).to.eql(['PUT:/posts/1'])

      @server.r 'PUT:/posts/1', -> posts: {id: 1, title: 'updated again'}
      post.title = 'updated again'
      @session.flush().then =>
        expect(post.title).to.eq('updated again')
        expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])

        @session.flush().then => # NO-OP
          expect(post.title).to.eq('updated again')
          expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])


  it 'deletes', ->
    @server.r 'DELETE:/posts/1', {}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load('post', 1).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('test')
      @session.deleteModel(post)
      @session.flush().then =>
        expect(post.isDeleted).to.be.true
        expect(@server.h).to.eql(['DELETE:/posts/1'])


  it 'deletes multiple times in multiple flushes', ->
    @server.r 'DELETE:/posts/1', {}

    post1 = new @session.merge @Post(id: "1", title: 'thing 1')
    post2 = new @session.merge @Post(id: "2", title: 'thing 2')

    @session.deleteModel post1

    @session.flush().then =>

      expect(post1.isDeleted).to.be.true
      expect(post2.isDeleted).to.be.false

      @server.r 'DELETE:/posts/1', -> throw "already deleted"
      @server.r 'DELETE:/posts/2', {}

      @session.deleteModel post2

      @session.flush().then =>
        expect(post1.isDeleted).to.be.true
        expect(post2.isDeleted).to.be.true
        
  it 'creates, deletes, creates, deletes', ->
    post1 = new @session('post')
    post1.title = 'thing 1'
    
    @server.r 'POST:/posts', -> posts: {client_id: post1.clientId, id: 1, title: 'thing 1'}
    @session.flush().then =>
      expect(post1.id).to.eq('1')
      expect(post1.title).to.eq('thing 1')
      @session.deleteModel(post1)
      
      @server.r 'DELETE:/posts/1', {}
        
      @session.flush().then =>
        expect(post1.isDeleted).to.be.true
        post2 = new @session('post')
        post2.title = 'thing 2'
        
        @server.r 'POST:/posts', -> posts: {client_id: post2.clientId, id: 2, title: 'thing 2'}
        
        @session.flush().then =>
        
          @server.r 'DELETE:/posts/1', -> throw 'not found'
          @server.r 'DELETE:/posts/2', {}
        
          expect(post2.id).to.eq('2')
          expect(post2.title).to.eq('thing 2')
          @session.deleteModel(post2)
          
          @session.flush().then =>
            expect(post2.isDeleted).to.be.true
            expect(@server.h).to.eql(['POST:/posts', 'DELETE:/posts/1', 'POST:/posts', 'DELETE:/posts/2'])
      
      


  it 'refreshes', ->
    @server.r 'GET:/posts/1', posts: {id: 1, title: 'something new'}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load(@Post, 1).then (post) =>
      expect(post.title).to.eq('test')
      expect(@server.h).to.eql([])
      @session.refresh(post).then (post) =>
        expect(post.title).to.eq('something new')
        expect(@server.h).to.eql(['GET:/posts/1'])


  it 'finds', ->
    @server.r 'GET:/posts', (xhr) ->
      expect(xhr.url).to.contain('q=aardvarks')
      posts: [{id: 1, title: 'aardvarks explained'}, {id: 2, title: 'aardvarks in depth'}]

    @session.find('post', {q: 'aardvarks'}).then (models) =>
      expect(models.length).to.eq(2)
      expect(@server.h).to.eql(['GET:/posts'])


  it 'loads then updates', ->
    @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw'}
    @server.r 'PUT:/posts/1', posts: {id: 1, title: 'no more fsm'}

    @session.load(@Post, 1).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['GET:/posts/1'])

      post.title = 'no more fsm'
      @session.flush().then =>
        expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])
        expect(post.title).to.eq('no more fsm')
        
  it 'loads with parameter', ->
    @server.r 'GET:/posts/1', (xhr) =>
      expect(xhr.url).to.contain('fdsavcxz')
      posts: {id: 1, title: 'mvcc ftw'}
    @session.load(@Post, 1, params: {invite_token: 'fdsavcxz'}).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['GET:/posts/1'])
    
