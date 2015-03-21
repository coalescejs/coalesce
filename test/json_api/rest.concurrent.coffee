`import Context from 'coalesce/rest/context'`

`import {post} from '../support/configs'`
`import {delay} from '../support/async'`

respond = (xhr, error, status=422) ->
  xhr.respond status, { "Content-Type": "application/json" }, JSON.stringify(error)

describe "rest concurrent flushes", ->
  
  lazy 'context', -> new Context(post())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'session', -> @context.newSession()

  it 'all flushes resolve', ->
    @server.r 'PUT:/posts/1', (xhr) ->
      data = JSON.parse(xhr.requestBody)
      posts: {id: 1, title: data.post.title, submitted: "true"}
    post = new @session.merge @Post(id: "1", title: 'twerkin', submitted: false)
    post.title = 'update1'
    f1 = @session.flush()
    post.title = 'update2'
    f2 = @session.flush()
    Coalesce.Promise.all([f1, f2]).then =>
      expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])
      expect(post.title).to.eq('update2')


  xit 'second flush waits for first to complete', ->
    calls = 0
    # make first request take longer than the second
    adapter.runLater = (callback) ->
      delay = if calls > 0
        0
      else
        10
      calls++
      Coalesce.backburner.defer callback, delay

    @server.r 'PUT:/posts/1', (xhr) ->
      data = JSON.parse(xhr.requestBody)
      posts: {id: 1, title: data.post.title, submitted: "true"}
    post = new @session.merge @Post(id: "1", title: 'twerkin', submitted: false)
    post.title = 'update1'
    f1 = @session.flush()
    post.title = 'update2'
    f2 = @session.flush()
    Coalesce.Promise.all([f1, f2]).then =>
      expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1'])
      expect(post.title).to.eq('update2')


  it 'three concurrent flushes', ->
    calls = 0
    @server.r 'PUT:/posts/1', (xhr) ->
      delayAmount = if calls % 2 == 1
        0
      else
        10
      calls++
      delay delayAmount, ->
        data = JSON.parse(xhr.requestBody)
        posts: {id: 1, title: data.post.title, submitted: "true"}
    post = new @session.merge @Post(id: "1", title: 'twerkin', submitted: false)
    post.title = 'update1'
    f1 = @session.flush()
    post.title = 'update2'
    f2 = @session.flush()
    post.title = 'update3'
    f3 = @session.flush()
    Coalesce.Promise.all([f1, f2, f3]).then =>
      expect(@server.h).to.eql(['PUT:/posts/1', 'PUT:/posts/1', 'PUT:/posts/1'])
      expect(post.title).to.eq('update3')


  it 'cascades failures', ->
    calls=0
    @server.r 'PUT:/posts/1', (xhr) ->
      delayAmount = if calls % 2 == 1
        0
      else
        10
      calls++
      delay delayAmount, =>
        data = JSON.parse(xhr.requestBody)
        if data.post.title == 'update1'
          respond xhr, {error: "twerkin too hard"}, 500
        rev = parseInt(data.post.title.split("update")[1])+1
        posts: {id: 1, title: data.post.title, submitted: "true", rev: rev}
    post = new @session.merge @Post(id: "1", title: 'twerkin', submitted: false, rev: 1)
    post.title = 'update1'
    f1 = @session.flush()
    post.title = 'update2'
    f2 = @session.flush()
    post.title = 'update3'
    f3 = @session.flush()
    f3.then null, =>
      expect(@server.h).to.eql(['PUT:/posts/1'])
      expect(post.title).to.eq('update3')
      shadow = @session.getShadow(post)
      expect(shadow.title).to.eq('twerkin')


  it 'can retry after failure', ->
    count = 0
    @server.r 'PUT:/posts/1', (xhr) ->
      data = JSON.parse(xhr.requestBody)
      if count++ == 0
        respond xhr, {error: "plz twerk again"}, 500
      posts: {id: 1, title: data.post.title, submitted: "true"}
    post = new @session.merge @Post(id: "1", title: 'twerkin', submitted: false)
    post.title = 'update1'
    @session.flush().then null, =>
      expect(post.title).to.eq('update1')
      shadow = @session.getShadow(post)
      expect(shadow.title).to.eq('twerkin')

      @session.flush().then =>
        expect(post.title).to.eq('update1')
        shadow = @session.getShadow(post)
        expect(shadow.title).to.eq('update1')
