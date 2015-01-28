`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/rest/context'`

describe "rest with rpc", ->

  lazy 'Post', ->
    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
        submitted: {type: 'boolean'}
    Post
  
  lazy 'context', ->
    new Context
      types:
        post: @Post
  
  lazy 'session', -> @context.newSession()

  it 'works with loaded model as context', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit').then =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true

  it 'handles remote calls on the collection', ->
    @server.r 'POST:/posts/randomize', ->
      posts: [{id: 1, title: 'submitted', submitted: true}, {id: 2, title: 'submitted2', submitted: true}]

    @session.remoteCall('post', 'randomize').then (models) =>
      expect(models.length).to.eq(2)
      expect(models[0].title).to.eq('submitted')
      expect(models[0].submitted).to.be.true
      expect(@server.h).to.eql(['POST:/posts/randomize'])


  it 'serializes model params', ->
    @server.r 'POST:/posts/1/submit', (xhr) ->
      data = JSON.parse(xhr.requestBody)
      expect(data.post.title).to.eq('test')
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', post).then =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true


  it 'can accept model type as context', ->
    @server.r 'POST:/posts/import', ->
      posts: [{id: 1, title: 'submitted', submitted: "true"}]

    @session.remoteCall('post', 'import').then (posts) =>
      expect(@server.h).to.eql(['POST:/posts/import'])
      expect(posts[0].id).to.eq("1")


  it 'can accept parameters', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', token: 'asd').then =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true

  it 'passes through metadata', ->
    @server.r 'POST:/posts/1/submit', ->
      meta: {traffic: 'heavy'}, posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', token: 'asd').then =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.meta.traffic).to.eq('heavy')
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true

  it 'can accept a method', ->
    @server.r 'PUT:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {type: 'PUT'}).then =>
        expect(@server.h).to.eql(['PUT:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true
        
  it 'when url option set, a custom url is used', ->
    @server.r 'POST:/greener_pastures', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {url: '/greener_pastures'}).then =>
        expect(@server.h).to.eql(['POST:/greener_pastures'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true

  it 'results in raw json when deserialize=false', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {deserialize: false}).then (json) =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('test')
        expect(post.submitted).to.be.false
        expect(json.posts.title).to.eq('submitted')
        expect(json.isModel).to.be.undefined

  it 'returns all models when deserializationContext is null', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {deserializationContext: null}).then (models) =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true
        expect(models[0]).to.eq(post)

  it 'returns all models of a type if deserializer context is a type key', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)

    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {serializerOptions: {context: 'post'}}).then (models) =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true
        expect(models[0]).to.eq(post)


  it 'returns all models of a type if context is a type', ->
    @server.r 'POST:/posts/1/submit', ->
      posts: {id: 1, title: 'submitted', submitted: "true"}

    @session.merge @Post.create(id: "1", title: 'test', submitted: false)
    @session.load('post', 1).then (post) =>
      @session.remoteCall(post, 'submit', {token: 'asd'}, {serializerOptions: {context: @Post}}).then (models) =>
        expect(@server.h).to.eql(['POST:/posts/1/submit'])
        expect(post.title).to.eq('submitted')
        expect(post.submitted).to.be.true
        expect(models[0]).to.eq(post)
