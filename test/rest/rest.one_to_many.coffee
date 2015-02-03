`import Context from 'coalesce/rest/context'`
`import {postWithComments, postWithEmbeddedComments} from '../support/configs'`

describe "rest with one->many relationship", ->

  lazy 'context', -> new Context(postWithComments())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'Comment', -> @context.typeFor('comment')
  lazy 'session', -> @context.newSession()

  it 'loads lazily', ->
    @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [2]}
    @server.r 'GET:/comments/2', comments: {id: 2, body: 'first', post: 1}

    @session.load('post', 1).then (post) =>
      expect(@server.h).to.eql(['GET:/posts/1'])
      expect(post.id).to.eq("1")
      expect(post.title).to.eq('mvcc ftw')
      expect(post.comments.length).to.eq(1)
      comment = post.comments[0]
      expect(comment.body).to.be.undefined

      comment.load().then =>
        expect(@server.h).to.eql(['GET:/posts/1', 'GET:/comments/2'])
        expect(comment.body).to.eq('first')
        expect(comment.post.isEqual(post)).to.be.true


  it 'creates', ->
    @server.r 'POST:/posts', -> posts: {client_id: post.clientId, id: 1, title: 'topological sort', comments: []}
    @server.r 'POST:/comments', (xhr) ->
      data = JSON.parse(xhr.requestBody)
      expect(data.comment.post).to.eq(1)
      return comments: {client_id: comment.clientId, id: 2, body: 'seems good', post: 1}

    post = new @session('post')
    post.title = 'topological sort'

    comment = new @session('comment')
    comment.body = 'seems good'
    comment.post = post

    expect(post.comments[0]).to.eq(comment)

    @session.flush().then =>
      expect(post.id).to.not.be.null
      expect(post.isNew).to.be.false
      expect(post.title).to.eq('topological sort')
      expect(comment.id).to.not.be.null
      expect(comment.body).to.eq('seems good')
      expect(comment.post).to.eq(post)
      expect(comment.post.id).to.eq("1")
      expect(post.comments[0]).to.eq(comment)
      expect(@server.h).to.eql(['POST:/posts', 'POST:/comments'])
      
  
  it 'creates and server can return additional children', ->
    @server.r 'POST:/posts', ->
      comments: [{id: 2, post: 1, body: 'seems good'}]
      posts: {client_id: post.clientId, id: 1, title: 'topological sort', comments: [2]}

    post = new @session('post')
    post.title = 'topological sort'

    @session.flush().then =>
      comment = post.comments[0]
      expect(post.id).to.not.be.null
      expect(post.isNew).to.be.false
      expect(post.title).to.eq('topological sort')
      expect(comment.id).to.not.be.null
      expect(comment.body).to.eq('seems good')
      expect(comment.post).to.eq(post)
      expect(comment.post.id).to.eq("1")
      expect(@server.h).to.eql(['POST:/posts'])
    

  it 'creates child', ->
    @server.r 'POST:/comments', -> comments: {client_id: comment.clientId, id: 2, body: 'new child', post: 1}

    new @session.merge @Post(id: "1", title: 'parent', comments: []);

    comment = null

    @session.load(@Post, 1).then (post) =>
      comment = new @session('comment', body: 'new child')
      comment.post = post
      expect(post.comments.toArray()).to.eql([comment])
      @session.flush().then =>
        expect(post.comments.toArray()).to.eql([comment])
        expect(comment.body).to.eq('new child')
        expect(@server.h).to.eql(['POST:/comments'])


  it 'creates child with lazy reference to parent', ->
    @server.r 'POST:/comments', -> comments: {client_id: comment.clientId, id: 2, body: 'new child', post: 1}

    post = new @Post(id: 1)

    comment = new @session('comment', body: 'new child')
    comment.post = post
    @session.flush().then =>
      expect(comment.body).to.eq('new child')
      expect(@server.h).to.eql(['POST:/comments'])
      expect(post.isFieldLoaded('comments')).to.be.false


  it 'create followed by delete does not hit server', ->
    new @session.merge @Post(id: "1", title: 'parent');

    comment = null

    @session.load(@Post, 1).then (post) =>
      comment = new @session('comment', body: 'new child')
      comment.post = post
      @session.deleteModel comment
      @session.flush().then =>
        expect(@server.h).to.eql([])
        expect(comment.isDeleted).to.be.true


  it 'updates parent, updates child, and saves sibling', ->
    @server.r 'PUT:/posts/1', -> post: {id: 1, title: 'polychild', comments: [2]}
    @server.r 'PUT:/comments/2', -> comments: {id: 2, title: 'original sibling', post: 1}
    @server.r 'POST:/comments', -> comments: {client_id: sibling.clientId, id: 3, body: 'sibling', post: 1}

    post = new @Post(id: "1", title: 'parent', comments: []);
    post.comments.addObject new @Comment(id: "2", body: 'child', post: post)
    @session.merge post

    comment = null
    sibling = null

    @session.load(@Post, 1).then (post) =>
      comment = post.comments[0]
      sibling = new @session('comment', body: 'sibling')
      sibling.post = post
      comment.body = 'original sibling'
      post.title = 'polychild'
      expect(post.comments.toArray()).to.eql([comment, sibling])
      @session.flush().then =>
        expect(post.comments.toArray()).to.eql([comment, sibling])
        expect(@server.h.length).to.eq(3)
        expect(@server.h).to.include('PUT:/posts/1')
        expect(@server.h).to.include('PUT:/comments/2')
        expect(@server.h).to.include('POST:/comments')


  it 'updates with unloaded child', ->
    @server.r 'GET:/posts/1', -> posts: {id: 1, title: 'mvcc ftw', comments: [2]}
    @server.r 'PUT:/posts/1', -> posts: {id: 1, title: 'updated', comments: [2]}
    @session.load('post', 1).then (post) =>
      expect(post.title).to.eq('mvcc ftw')
      expect(@server.h).to.eql(['GET:/posts/1'])
      post.title = 'updated'
      @session.flush().then =>
        expect(post.title).to.eq('updated')
        expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])


  it 'deletes child', ->
    @server.r 'PUT:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [2]}
    @server.r 'DELETE:/comments/2', {}

    post = new @Post(id: "1", title: 'parent', comments: []);
    post.comments.addObject new @Comment(id: "2", body: 'child', post: post)
    @session.merge post

    @session.load('post', 1).then (post) =>
      comment = post.comments[0]
      @session.deleteModel(comment)
      expect(post.comments.length).to.eq(0)
      @session.flush().then =>
        expect(@server.h).to.eql(['DELETE:/comments/2'])
        expect(post.comments.length).to.eq(0)


  it 'deletes child and updates parent', ->
    @server.r 'PUT:/posts/1', posts: {id: 1, title: 'childless', comments: []}
    @server.r 'DELETE:/comments/2', {}

    post = new @Post(id: "1", title: 'parent', comments: []);
    post.comments.addObject new @Comment(id: "2", body: 'child', post: post)
    @session.merge post

    @session.load('post', 1).then (post) =>
      comment = post.comments[0]
      @session.deleteModel(comment)
      expect(post.comments.length).to.eq(0)
      post.title = 'childless'
      @session.flush().then =>
        expect(post.comments.length).to.eq(0)
        expect(post.title).to.eq('childless')
        expect(@server.h.length).to.eq(2)
        expect(@server.h).to.include('DELETE:/comments/2')
        expect(@server.h).to.include('PUT:/posts/1')


  it 'deletes parent and child', ->
    @server.r 'DELETE:/posts/1', {}
    @server.r 'DELETE:/comments/2', {}

    post = new @Post(id: "1", title: 'parent', comments: [])
    post.comments.addObject new @Comment(id: "2", body: 'child', post: post)
    @session.merge post

    @session.load('post', 1).then (post) =>
      comment = post.comments[0]
      @session.deleteModel(comment)
      expect(post.comments.length).to.eq(0)
      @session.deleteModel(post)
      @session.flush().then =>
        expect(@server.h.length).to.eq(2)
        expect(@server.h).to.include('DELETE:/comments/2')
        expect(@server.h).to.include('DELETE:/posts/1')
        expect(post.isDeleted).to.be.true
        expect(comment.isDeleted).to.be.true


  context 'when embedded', ->

    lazy 'context', -> new Context(postWithEmbeddedComments())
    
    it 'loads', ->
      @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [{id: 2, post: 1, body: 'first'}]}

      @session.load(@Post, 1).then (post) =>
        expect(@server.h).to.eql(['GET:/posts/1'])
        expect(post.id).to.eq("1")
        expect(post.title).to.eq('mvcc ftw')
        expect(post.comments.length).to.eq(1)
        comment = post.comments[0]
        expect(comment.body).to.eq 'first'
        expect(comment.post.isEqual(post)).to.be.true


    it 'updates child', ->
      @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [{id: 2, post: 1, body: 'first'}]}
      @server.r 'PUT:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [{id: 2, post: 1, body: 'first again'}]}

      @session.load(@Post, 1).then (post) =>
        expect(@server.h).to.eql(['GET:/posts/1'])
        comment = post.comments[0]
        comment.body = 'first again'
        @session.flush().then =>
          expect(post.comments[0]).to.eq(comment)
          expect(comment.body).to.eq('first again')
          expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])


    it 'adds child', ->
      @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: []}
      @server.r 'PUT:/posts/1', -> posts: {id: 1, title: 'mvcc ftw', comments: [{id: 2, client_id: comment.clientId, post: 1, body: 'reborn'}]}

      comment = null
      @session.load(@Post, 1).then (post) =>
        expect(@server.h).to.eql(['GET:/posts/1'])
        expect(post.comments.length).to.eq(0)
        comment = new @session('comment', body: 'reborn')
        comment.post = post
        @session.flush().then =>
          expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])
          expect(comment.body).to.eq('reborn')
          expect(post.comments[0]).to.eq(comment)


    it 'adds child with sibling', ->
      @server.r 'GET:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [id: 2, post: 1, body: 'first-born']}
      @server.r 'PUT:/posts/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.post.comments[1].id).to.be.null
        expect(data.post.comments[0].body).to.eq('first-born')
        return posts: {id: 1, title: 'mvcc ftw', comments: [{id:2, post: 1, body: 'first-born'}, {id: 3, client_id: comment.clientId, post: 1, body: 'second-born'}]}

      comment = null
      @session.load(@Post, 1).then (post) =>
        expect(@server.h).to.eql(['GET:/posts/1'])
        expect(post.comments.length).to.eq(1)
        comment = new @session('comment', body: 'second-born')
        comment.post = post
        @session.flush().then =>
          expect(@server.h).to.eql(['GET:/posts/1', 'PUT:/posts/1'])
          expect(comment.body).to.eq('second-born')
          expect(post.comments[0].body).to.eq('first-born')
          expect(post.comments.lastObject).to.eq(comment)


    it 'deletes child', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.post.comments.length).to.eq(0)
        return posts: {id: 1, title: 'mvcc ftw', comments: []}

      post = new @Post(id: "1", title: 'parent', comments: []);
      post.comments.addObject new @Comment(id: "2", body: 'child', post: post)
      @session.merge post

      @session.load('post', 1).then (post) =>
        comment = post.comments[0]
        @session.deleteModel(comment)
        expect(post.comments.length).to.eq(0)
        @session.flush().then =>
          expect(@server.h).to.eql(['PUT:/posts/1'])
          expect(post.comments.length).to.eq(0)


    it 'deletes child with sibling', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.post.comments.length).to.eq(1)
        return posts: {id: 1, title: 'mvcc ftw', comments: [{id: 3, client_id: sibling.clientId, post: 1, body: 'child2'}]}

      post = new @Post(id: "1", title: 'parent', comments: []);
      post.comments.addObject new @Comment(id: "2", body: 'child1', post: post)
      post.comments.addObject new @Comment(id: "3", body: 'child2', post: post)
      @session.merge post

      sibling = null
      @session.load('post', 1).then (post) =>
        comment = post.comments[0]
        sibling = post.comments.lastObject
        @session.deleteModel(comment)
        expect(post.comments.length).to.eq(1)
        @session.flush().then =>
          expect(@server.h).to.eql(['PUT:/posts/1'])
          expect(post.comments.length).to.eq(1)


    it 'new parent creates and deletes child before flush', ->
      @server.r 'POST:/posts', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.post.comments.length).to.eq(0)
        return posts: {client_id: post.clientId, id: 1, title: 'mvcc ftw', comments: []}

      post = new @session(@Post, title: 'parent', comments: [])
      comment = new @session(@Comment, title: 'child')
      post.comments.pushObject comment
      post.comments.removeObject comment

      @session.flush().then =>
        expect(post.comments.length).to.eq(0)
        expect(post.isNew).to.be.false
        expect(@server.h).to.eql(['POST:/posts'])



    it 'deletes multiple children in multiple flushes', ->
      post = new @Post(id: "1", title: 'parent', comments: []);
      post.comments.addObject new @Comment(id: "2", body: 'thing 1', post: post)
      post.comments.addObject new @Comment(id: "3", body: 'thing 2', post: post)
      post = @session.merge(post)

      @server.r 'PUT:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: [{post: "1", id: "3", body: 'thing 2'}]}

      @session.deleteModel post.comments.objectAt(0)
      @session.flush().then =>
        expect(@server.h).to.eql(['PUT:/posts/1'])
        expect(post.comments.length).to.eq(1)
        @session.deleteModel post.comments.objectAt(0)
        @server.r 'PUT:/posts/1', posts: {id: 1, title: 'mvcc ftw', comments: []}
        @session.flush().then =>
          expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])
          expect(post.comments.length).to.eq(0)


    it 'deletes parent and child', ->
      @server.r 'DELETE:/posts/1', {}

      post = new @Post(id: "1", title: 'parent', comments: []);
      post.comments.addObject(new @Comment(id: "2", body: 'child'))
      @session.merge post

      # TODO: once we have support for side deletions beef up this test
      @session.load('post', 1).then (post) =>
        @session.deleteModel(post)
        @session.flush().then =>
          expect(@server.h).to.eql(['DELETE:/posts/1'])
          expect(post.isDeleted).to.be.true
