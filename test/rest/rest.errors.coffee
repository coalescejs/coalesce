`import Context from 'coalesce/rest/context'`
`import Errors from 'coalesce/errors'`

`import {post} from '../support/configs'`
`import {delay} from '../support/async'`

respond = (xhr, error, status=422) ->
  xhr.respond status, { "Content-Type": "application/json" }, JSON.stringify(error)

describe "rest with errors", ->

  lazy 'context', -> new Context(post())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'session', -> @context.newSession()

  context 'on update', ->
    it 'handles validation errors', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        respond xhr, errors: {title: 'is too short', created_at: 'cannot be in the past'}

      new @session.merge @Post(id: "1", title: 'test')
      @session.load('post', 1).then (post) =>
        expect(post.title).to.eq('test')
        post.title = ''
        @session.flush().then null, =>
          expect(post.hasErrors).to.be.true
          expect(post.title).to.eq('')
          expect(post.errors.title).to.eq('is too short')
          expect(post.errors.createdAt).to.eq('cannot be in the past')
          expect(@server.h).to.eql(['PUT:/posts/1'])
          
    it 'overwrites existing errors when error-only payload returned', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        respond xhr, errors: {title: 'is too short'}

      post = new @session.merge @Post(id: "1", title: 'test')
      post.title = ''
      post.errors = new Errors(title: 'is not good')
      expect(post.errors.title).to.eq('is not good')
      @session.flush().then null, =>
        expect(post.hasErrors).to.be.true
        expect(post.title).to.eq('')
        expect(post.errors.title).to.eq('is too short')
        expect(@server.h).to.eql(['PUT:/posts/1'])

    it 'handles payload with error properties', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        respond xhr, post: {id: 1, title: 'test', errors: {title: 'is too short'}}

      new @session.merge @Post(id: "1", title: 'test')
      @session.load('post', 1).then (post) =>
        expect(post.title).to.eq('test')
        post.title = ''
        @session.flush().then null, =>
          expect(post.hasErrors).to.be.true
          expect(post.title).to.eq('')
          expect(post.errors.title).to.eq('is too short')
          expect(@server.h).to.eql(['PUT:/posts/1'])

    it 'merges payload with error properties and higher rev', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        respond xhr, post: {id: 1, title: '', rev: 10, errors: {title: 'is too short'}}

      new @session.merge @Post(id: "1", title: 'test')
      @session.load('post', 1).then (post) =>
        expect(post.title).to.eq('test')
        post.title = ''
        @session.flush().then null, =>
          expect(post.hasErrors).to.be.true
          expect(post.title).to.eq('')
          expect(post.errors.title).to.eq('is too short')
          expect(@server.h).to.eql(['PUT:/posts/1'])

    it 'merges payload with error and latest client changes against latest client version', ->
      @server.r 'PUT:/posts/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        respond xhr, post: {id: 1, title: 'Something', client_rev: data.post.client_rev, errors: {title: 'cannot be empty'}}

      new @session.merge @Post(id: "1", title: 'test')
      @session.load('post', 1).then (post) =>
        expect(post.title).to.eq('test')
        post.title = ''
        @session.flush().then null, =>
          expect(post.hasErrors).to.be.true
          expect(post.title).to.eq('Something')
          expect(@server.h).to.eql(['PUT:/posts/1'])

    it 'empty errors object should deserialize without errors', ->
      @server.r 'PUT:/posts/1', ->
        post: {id: 1, title: '', errors: {}}

      new @session.merge @Post(id: "1", title: 'test')
      @session.load('post', 1).then (post) =>
        expect(post.title).to.eq('test')
        post.title = ''
        @session.flush().then null, =>
          expect(post.hasErrors).to.be.false
          expect(post.title).to.eq('')
          expect(@server.h).to.eql(['PUT:/posts/1'])


  context 'on create', ->
    
    it 'handles 422', ->
      @server.r 'POST:/posts', (xhr) ->
        respond xhr, errors: {title: 'is lamerz'}

      post = @session.create 'post', title: 'errorz'
      @session.flush().then null, =>
        expect(post.errors.title).to.eq('is lamerz')
        
    it 'handle arbitrary errors', ->
      @server.r 'POST:/posts', (xhr) ->
        respond xhr, {error: "something is wrong"}, 500

      post = @session.create 'post', title: 'errorz'
      @session.flush().then null, =>
        expect(@session.newModels.has(post)).to.be.true
        expect(post.isNew).to.be.true
        
    it 'handle errors with multiple staggered creates', ->
      
      calls = 0
      @server.r 'POST:/posts', (xhr) ->
        delayAmount = if calls % 2 == 1
          0
        else
          1000
        calls++
        delay delayAmount, ->
          respond xhr, {}, 0

      post1 = @session.create 'post', title: 'bad post'
      post2 = @session.create 'post', title: 'another bad post'
      @session.flush().then null, =>
        expect(@session.newModels.has(post1)).to.be.true
        expect(@session.newModels.has(post2)).to.be.true
        expect(post1.isNew).to.be.true
        expect(post2.isNew).to.be.true

    it 'merges payload with latest client changes against latest client version', ->
      @server.r 'POST:/posts', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        respond xhr, post: {title: 'Something', client_id: data.post.client_id, client_rev: data.post.client_rev, errors: {title: 'cannot be empty'}}

      post = @session.create 'post', title: ''
      @session.flush().then null, =>
        expect(post.title).to.eq('Something')

    it 'succeeds after retry', ->
      @server.r 'POST:/posts', (xhr) ->
        respond xhr, errors: {title: 'is lamerz'}

      post = @session.create 'post', title: 'errorz'
      @session.flush().then null, =>
        expect(post.errors.title).to.eq('is lamerz')
        @server.r 'POST:/posts', (xhr) ->
          data = JSON.parse(xhr.requestBody)
          post: {title: 'linkbait', id: 1, client_id: data.post.client_id, client_rev: data.post.client_rev}
        @session.title = 'linkbait'
        @session.flush().then =>
          expect(post.title).to.eq('linkbait')
          expect(@server.h).to.eql(['POST:/posts', 'POST:/posts'])

    it 'succeeds after retry when failure merged data', ->
      @server.r 'POST:/posts', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        respond xhr, post: {title: 'Something', client_id: data.post.client_id, client_rev: data.post.client_rev, errors: {title: 'is lamerz'}}

      post = @session.create 'post', title: 'errorz'
      @session.flush().then null, =>
        expect(post.title).to.eq('Something')
        expect(post.errors.title).to.eq('is lamerz')
        @server.r 'POST:/posts', (xhr) ->
          data = JSON.parse(xhr.requestBody)
          post: {title: 'linkbait', id: 1, client_id: data.post.client_id, client_rev: data.post.client_rev}
        @session.title = 'linkbait'
        @session.flush().then =>
          expect(post.title).to.eq('linkbait')
          expect(@server.h).to.eql(['POST:/posts', 'POST:/posts'])
          expect(post.hasErrors).to.be.false

  context 'when querying', ->
    
    it 'does not merge into @session', ->
      @server.r 'GET:/posts', (xhr) ->
        respond xhr, {}, 0, responseText: ""
        
      @session.query('post').then null, (err) ->
        expect(err.status).to.eq(0)
      


    context 'in child session', ->

      lazy 'session', -> @_super.session.newSession()

      it 'merges payload with latest client changes against latest client version', ->
        @server.r 'POST:/posts', (xhr) ->
          data = JSON.parse(xhr.requestBody)
          respond xhr, post: {title: 'Something', client_id: data.post.client_id, client_rev: data.post.client_rev, errors: {title: 'cannot be empty'}}

        post = @session.create 'post', title: ''
        @session.flush().then null, =>
          expect(post.title).to.eq('Something')

      it 'succeeds after retry', ->
        @server.r 'POST:/posts', (xhr) ->
          respond xhr, errors: {title: 'is lamerz'}

        post = @session.create 'post', title: 'errorz'
        @session.flush().then null, =>
          expect(post.errors.title).to.eq('is lamerz')
          @server.r 'POST:/posts', (xhr) ->
            data = JSON.parse(xhr.requestBody)
            post: {title: 'linkbait', id: 1, client_id: data.post.client_id, client_rev: data.post.client_rev}
          @session.title = 'linkbait'
          @session.flush().then =>
            expect(post.title).to.eq('linkbait')
            expect(@server.h).to.eql(['POST:/posts', 'POST:/posts'])

      it 'succeeds after retry when failure merged data', ->
        @server.r 'POST:/posts', (xhr) ->
          data = JSON.parse(xhr.requestBody)
          respond xhr, post: {title: 'Something', client_id: data.post.client_id, client_rev: data.post.client_rev, errors: {title: 'is lamerz'}}

        post = @session.create 'post', title: 'errorz'
        @session.flush().then null, =>
          expect(post.title).to.eq('Something')
          @server.r 'POST:/posts', (xhr) ->
            data = JSON.parse(xhr.requestBody)
            post: {title: 'linkbait', id: 1, client_id: data.post.client_id, client_rev: data.post.client_rev}
          @session.title = 'linkbait'
          @session.flush().then =>
            expect(post.title).to.eq('linkbait')
            expect(@server.h).to.eql(['POST:/posts', 'POST:/posts'])


  context 'on load', ->
    [401, 403, 404].forEach (errorCode) ->

      it "handles #{errorCode}", ->
        @server.r 'GET:/posts/1',(xhr) ->
          respond xhr, {}, errorCode

        @session.load('post', 1).then null, (post) =>
          expect(post.hasErrors).to.be.true
          expect(post.errors.status).to.eq(errorCode)
          expect(@server.h).to.eql(['GET:/posts/1'])
          
  
  context 'on delete', ->
    
    it 'retains deleted state', ->
      @server.r 'DELETE:/posts/1', (xhr) ->
        respond xhr, {}, 0
        
      post = @session.merge new @Post(id: 1, title: 'errorz')
      @session.deleteModel(post)
      expect(post.isDeleted).to.be.true
      @session.flush().then null, =>
        expect(post.isDirty).to.be.true
        expect(post.isDeleted).to.be.true
    
    it 'retains deleted state on multiple models and succeeds subsequently', ->
      @server.r 'DELETE:/posts/1', (xhr) ->
        delay 1000, ->
          respond xhr, {}, 0
      @server.r 'DELETE:/posts/2', (xhr) ->
        respond xhr, {}, 0
        
      post1 = @session.merge new @Post(id: 1, title: 'bad post')
      post2 = @session.merge new @Post(id: 2, title: 'another bad post')
      @session.deleteModel(post1)
      @session.deleteModel(post2)
      expect(post1.isDeleted).to.be.true
      expect(post2.isDeleted).to.be.true
      @session.flush().then null, =>
        expect(post1.isDirty).to.be.true
        expect(post1.isDeleted).to.be.true
        expect(post2.isDirty).to.be.true
        expect(post2.isDeleted).to.be.true
        
        @server.r 'DELETE:/posts/1', -> {}
        @server.r 'DELETE:/posts/2', -> {}
        
        @session.flush().then =>
          expect(post1.isDirty).to.be.false
          expect(post1.isDeleted).to.be.true
          expect(post2.isDirty).to.be.false
          expect(post2.isDeleted).to.be.true
        
    
      
    
