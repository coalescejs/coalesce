`import Context from 'coalesce/rest/context'`
`import {post} from '../support/configs'`

describe "rest with metadata", ->
  
  lazy 'context', -> new Context(post())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'session', -> @context.newSession()
  
  it 'loads', ->
    @server.r 'GET:/posts/1', meta: {traffic: 'heavy'}, posts: {id: 1, title: 'mvcc ftw'}
    @session.load(@Post, 1).then (post) =>
      expect(post.meta.traffic).to.eq('heavy')
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['GET:/posts/1'])


  it 'saves', ->
    @server.r 'POST:/posts', -> meta: {traffic: 'heavy'}, posts: {client_id: post.clientId, id: 1, title: 'mvcc ftw'}

    post = new @session('post')
    post.title = 'mvcc ftw'

    @session.flush().then (result) =>
      expect(result[0].meta.traffic).to.eq('heavy')
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['POST:/posts'])


  it 'updates', ->
    @server.r 'PUT:/posts/1', -> meta: {traffic: 'heavy'}, posts: {id: 1, title: 'updated'}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load('post', 1).then (post) =>
      expect(post.title).to.eq('test')
      post.title = 'updated'
      @session.flush().then (result) =>
        expect(result[0].meta.traffic).to.eq('heavy')
        expect(post.title).to.eq('updated')
        expect(@server.h).to.eql(['PUT:/posts/1'])


  it 'updates multiple times', ->
    @server.r 'PUT:/posts/1', -> meta: {traffic: 'heavy'}, posts: {id: 1, title: 'updated'}

    post = new @session.merge @Post(id: "1", title: 'test')

    expect(post.title).to.eq('test')
    post.title = 'updated'

    @session.flush().then (result) =>
      expect(result[0].meta.traffic).to.eq('heavy')
      expect(post.title).to.eq('updated')
      expect(@server.h).to.eql(['PUT:/posts/1'])

      @server.r 'PUT:/posts/1', -> meta: {traffic: 'lighter'}, posts: {id: 1, title: 'updated again'}
      post.title = 'updated again'
      @session.flush().then (result) =>
        expect(result[0].meta.traffic).to.eq('lighter')
        expect(post.title).to.eq('updated again')
        expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])


  it 'deletes', ->
    @server.r 'DELETE:/posts/1', meta: {traffic: 'heavy'}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load('post', 1).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('test')
      @session.deleteModel(post)
      @session.flush().then (result) =>
        expect(result[0].meta.traffic).to.eq('heavy')
        expect(post.isDeleted).to.be.true
        expect(@server.h).to.eql(['DELETE:/posts/1'])


  it 'refreshes', ->
    @server.r 'GET:/posts/1', meta: {traffic: 'lighter'}, posts: {id: 1, title: 'something new'}

    new @session.merge @Post(id: "1", title: 'test')

    @session.load(@Post, 1).then (post) =>
      expect(post.title).to.eq('test')
      expect(@server.h).to.eql([])
      @session.refresh(post).then (post) =>
        expect(post.title).to.eq('something new')
        expect(post.meta.traffic).to.eq('lighter')
        expect(@server.h).to.eql(['GET:/posts/1'])


  it 'finds', ->
    @server.r 'GET:/posts', (xhr) ->
      expect(xhr.url).to.contain("q=aardvarks")
      meta: {traffic: 'heavy'}, posts: [{id: 1, title: 'aardvarks explained'}, {id: 2, title: 'aardvarks in depth'}]

    @session.find('post', {q: 'aardvarks'}).then (models) =>
      expect(models.meta.traffic).to.eq('heavy')
      expect(models.length).to.eq(2)
      expect(@server.h).to.eql(['GET:/posts'])


  xit 'loads then updates in a child @session', ->
    @server.r 'GET:/posts/1', meta: {traffic: 'heavy'}, posts: {id: 1, title: 'mvcc ftw'}
    @server.r 'PUT:/posts/1', meta: {traffic: 'lighter'}, posts: {id: 1, title: 'no more fsm'}

    childSession = @session.newSession()
    childSession.load(@Post, 1).then (post) =>
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(post.meta.traffic).to.eq('heavy')
      expect(@server.h).to.eql(['GET:/posts/1'])

      post.title = 'no more fsm'
      childSession.flush().then (result) =>
        expect(result[0].meta.traffic).to.eq('lighter')
        expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])
        expect(post.title).to.eq('no more fsm')
