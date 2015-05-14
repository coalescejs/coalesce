`import setup from './_shared'`
`import Model from 'coalesce/model/model'`
`import Errors from 'coalesce/model/errors'`

describe "rest", ->

  adapter = null
  session = null

  beforeEach ->
    setup.apply(this)
    adapter = @adapter
    session = @session

  context 'simple model with errors', ->

    beforeEach ->
      `class User extends Model {}`
      User.defineSchema
        typeKey: 'user'
        attributes:
          name: {type: 'string'}
        relationships:
          posts:
            kind: 'hasMany'
            type: 'post'

      @App.User = @User = User

      `class Post extends Model {}`
      Post.defineSchema
        typeKey: 'post'
        attributes:
          title: {type: 'string'}
          category: {type: 'string'}
          createdAt: {type: 'date'}
        relationships:
          comments:
            kind: 'hasMany'
            type: 'comment'
          user:
            kind: 'belongsTo'
            type: 'user'

      @App.Post = @Post = Post


      `class Comment extends Model {}`
      Comment.defineSchema
        typeKey: 'comment'
        attributes:
          body: {type: 'string'}
        relationships:
          post:
            kind: 'belongsTo'
            type: 'post'
            
      @App.Comment = @Comment = Comment

      @container.register 'model:user', @User
      @container.register 'model:post', @Post
      @container.register 'model:comment', @Comment


    context 'on update', ->
      it 'handles validation errors', ->
        adapter.r['PUT:/posts/1'] = ->
          throw status: 422, responseText: JSON.stringify(errors: {title: 'is too short', created_at: 'cannot be in the past'})

        session.merge @Post.create(id: "1", title: 'test')
        session.load('post', 1).then (post) ->
          expect(post.title).to.eq('test')
          post.title = ''
          session.flush().then null, ->
            expect(post.hasErrors).to.be.true
            expect(post.title).to.eq('')
            expect(post.errors.title).to.eq('is too short')
            expect(post.errors.createdAt).to.eq('cannot be in the past')
            expect(adapter.h).to.eql(['PUT:/posts/1'])
            
      it 'overwrites existing errors when error-only payload returned', ->
        adapter.r['PUT:/posts/1'] = ->
          throw status: 422, responseText: JSON.stringify(errors: {title: 'is too short'})

        post = session.merge @Post.create(id: "1", title: 'test')
        post.title = ''
        post.errors = new Errors(title: 'is not good')
        expect(post.errors.title).to.eq('is not good')
        session.flush().then null, ->
          expect(post.hasErrors).to.be.true
          expect(post.title).to.eq('')
          expect(post.errors.title).to.eq('is too short')
          expect(adapter.h).to.eql(['PUT:/posts/1'])

      it 'handles payload with error properties', ->
        adapter.r['PUT:/posts/1'] = ->
          throw status: 422, responseText: JSON.stringify(post: {id: 1, title: 'test', errors: {title: 'is too short'}})

        session.merge @Post.create(id: "1", title: 'test')
        session.load('post', 1).then (post) ->
          expect(post.title).to.eq('test')
          post.title = ''
          session.flush().then null, ->
            expect(post.hasErrors).to.be.true
            expect(post.title).to.eq('')
            expect(post.errors.title).to.eq('is too short')
            expect(adapter.h).to.eql(['PUT:/posts/1'])

      it 'merges payload with error properties and higher rev', ->
        adapter.r['PUT:/posts/1'] = ->
          throw status: 422, responseText: JSON.stringify(post: {id: 1, title: '', category: 'new', rev: 10, errors: {title: 'is too short'}})

        session.merge @Post.create(id: "1", title: 'test')
        session.load('post', 1).then (post) ->
          expect(post.title).to.eq('test')
          post.title = ''
          session.flush().then null, ->
            expect(post.hasErrors).to.be.true
            expect(post.title).to.eq('')
            expect(post.category).to.eq('new')
            expect(post.errors.title).to.eq('is too short')
            expect(adapter.h).to.eql(['PUT:/posts/1'])

      it 'merges payload with error and latest client changes against latest client version', ->
        adapter.r['PUT:/posts/1'] = (url, type, hash) ->
          throw status: 422, responseText: JSON.stringify(post: {id: 1, title: 'Something', client_rev: hash.data.post.client_rev, errors: {title: 'cannot be empty'}})

        session.merge @Post.create(id: "1", title: 'test')
        session.load('post', 1).then (post) ->
          expect(post.title).to.eq('test')
          post.title = ''
          session.flush().then null, ->
            expect(post.hasErrors).to.be.true
            expect(post.title).to.eq('Something')
            expect(adapter.h).to.eql(['PUT:/posts/1'])

      it 'empty errors object should deserialize without errors', ->
        adapter.r['PUT:/posts/1'] = ->
          post: {id: 1, title: '', errors: {}}

        session.merge @Post.create(id: "1", title: 'test')
        session.load('post', 1).then (post) ->
          expect(post.title).to.eq('test')
          post.title = ''
          session.flush().then null, ->
            expect(post.hasErrors).to.be.false
            expect(post.title).to.eq('')
            expect(adapter.h).to.eql(['PUT:/posts/1'])


    context 'on create', ->
      it 'handles 422', ->

        user = session.merge @User.create(id: "1", name: 'craig')

        adapter.r['POST:/posts'] = ->
          throw status: 422, responseText: JSON.stringify(errors: {title: 'is lamerz'})

        post = session.create 'post', title: 'errorz', user: user

        comment = session.create 'comment', body: 'some comments here', post: post

        session.flush().then null, (models) ->

          expect(post.errors.title).to.eq('is lamerz')

          # Checking that there are no dup posts in the models argument passed to the rejected method
          postCount = 0
          models.forEach (m) ->
            if m.clientId == post.clientId
              postCount++

          expect(1).to.eq(postCount)
          
      it 'handle arbitrary errors', ->
        adapter.r['POST:/posts'] = ->
          throw status: 500, responseText: JSON.stringify(error: "something is wrong")

        post = session.create 'post', title: 'errorz'
        session.flush().then null, ->
          expect(session.newModels.has(post)).to.be.true
          expect(post.isNew).to.be.true
          
      it 'handle errors with multiple staggered creates', ->
        calls = 0
        # interleave requests
        adapter.runLater = (callback) ->
          delay = if calls % 2 == 1
            0
          else
            1000
          calls++
          Coalesce.run.later callback, delay
          
        adapter.r['POST:/posts'] = ->
          throw status: 0

        post1 = session.create 'post', title: 'bad post'
        post2 = session.create 'post', title: 'another bad post'
        session.flush().then null, ->
          expect(session.newModels.has(post1)).to.be.true
          expect(session.newModels.has(post2)).to.be.true
          expect(post1.isNew).to.be.true
          expect(post2.isNew).to.be.true

      it 'merges payload with latest client changes against latest client version', ->
        adapter.r['POST:/posts'] = (url, type, hash) ->
          throw status: 422, responseText: JSON.stringify(post: {title: 'Something', client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev, errors: {title: 'cannot be empty'}})

        post = session.create 'post', title: ''
        session.flush().then null, ->
          expect(post.title).to.eq('Something')

      it 'succeeds after retry', ->
        adapter.r['POST:/posts'] = ->
          throw status: 422, responseText: JSON.stringify(errors: {title: 'is lamerz'})

        post = session.create 'post', title: 'errorz'
        session.flush().then null, ->
          expect(post.errors.title).to.eq('is lamerz')
          adapter.r['POST:/posts'] = (url, type, hash) ->
            post: {title: 'linkbait', id: 1, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}
          session.title = 'linkbait'
          session.flush().then ->
            expect(post.title).to.eq('linkbait')
            expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts'])

      it 'succeeds after retry when failure merged data', ->
        adapter.r['POST:/posts'] = (url, type, hash) ->
          throw status: 422, responseText: JSON.stringify(post: {title: 'Something', client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev, errors: {title: 'is lamerz'}})

        post = session.create 'post', title: 'errorz'
        session.flush().then null, ->
          expect(post.title).to.eq('Something')
          expect(post.errors.title).to.eq('is lamerz')
          adapter.r['POST:/posts'] = (url, type, hash) ->
            post: {title: 'linkbait', id: 1, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}
          session.title = 'linkbait'
          session.flush().then ->
            expect(post.title).to.eq('linkbait')
            expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts'])
            expect(post.hasErrors).to.be.false

    context 'when querying', ->
      
      it 'does not merge into session', ->
        adapter.r['GET:/posts'] = (url, type, hash) ->
          throw status: 0, responseText: ""
          
        session.query('post').then null, (err) ->
          expect(err.status).to.eq(0)
        


      context 'in child session', ->

        it 'merges payload with latest client changes against latest client version', ->
          adapter.r['POST:/posts'] = (url, type, hash) ->
            throw status: 422, responseText: JSON.stringify(post: {title: 'Something', client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev, errors: {title: 'cannot be empty'}})

          session = session.newSession()
          post = session.create 'post', title: ''
          session.flush().then null, ->
            expect(post.title).to.eq('Something')

        it 'succeeds after retry', ->
          adapter.r['POST:/posts'] = ->
            throw status: 422, responseText: JSON.stringify(errors: {title: 'is lamerz'})

          session = session.newSession()
          post = session.create 'post', title: 'errorz'
          session.flush().then null, ->
            expect(post.errors.title).to.eq('is lamerz')
            adapter.r['POST:/posts'] = (url, type, hash) ->
              post: {title: 'linkbait', id: 1, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}
            session.title = 'linkbait'
            session.flush().then ->
              expect(post.title).to.eq('linkbait')
              expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts'])

        it 'succeeds after retry when failure merged data', ->
          adapter.r['POST:/posts'] = (url, type, hash) ->
            throw status: 422, responseText: JSON.stringify(post: {title: 'Something', client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev, errors: {title: 'is lamerz'}})

          session = session.newSession()
          post = session.create 'post', title: 'errorz'
          session.flush().then null, ->
            expect(post.title).to.eq('Something')
            adapter.r['POST:/posts'] = (url, type, hash) ->
              post: {title: 'linkbait', id: 1, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}
            session.title = 'linkbait'
            session.flush().then ->
              expect(post.title).to.eq('linkbait')
              expect(adapter.h).to.eql(['POST:/posts', 'POST:/posts'])


    context 'on load', ->
      [401, 403, 404].forEach (errorCode) ->

        it "handles #{errorCode}", ->
          adapter.r['GET:/posts/1'] = ->
            throw status: errorCode

          session.load('post', 1).then null, (post) ->
            expect(post.hasErrors).to.be.true
            expect(post.errors.status).to.eq(errorCode)
            expect(adapter.h).to.eql(['GET:/posts/1'])
            
    
    context 'on delete', ->
      
      it 'retains deleted state', ->
        adapter.r['DELETE:/posts/1'] = ->
          throw status: 0
          
        post = session.merge new @Post(id: 1, title: 'errorz')
        session.deleteModel(post)
        expect(post.isDeleted).to.be.true
        session.flush().then null, ->
          expect(post.isDirty).to.be.true
          expect(post.isDeleted).to.be.true
      
      it 'retains deleted state on multiple models and succeeds subsequently', ->
        adapter.r['DELETE:/posts/1'] = ->
          throw status: 0
        adapter.r['DELETE:/posts/2'] = ->
          throw status: 0
          
        calls = 0
        # interleave requests
        adapter.runLater = (callback) ->
          delay = if calls % 2 == 1
            0
          else
            1000
          calls++
          Coalesce.run.later callback, delay
          
        post1 = session.merge new @Post(id: 1, title: 'bad post')
        post2 = session.merge new @Post(id: 2, title: 'another bad post')
        session.deleteModel(post1)
        session.deleteModel(post2)
        expect(post1.isDeleted).to.be.true
        expect(post2.isDeleted).to.be.true
        session.flush().then null, ->
          expect(post1.isDirty).to.be.true
          expect(post1.isDeleted).to.be.true
          expect(post2.isDirty).to.be.true
          expect(post2.isDeleted).to.be.true
          
          adapter.r['DELETE:/posts/1'] = -> {}
          adapter.r['DELETE:/posts/2'] = -> {}
          
          session.flush().then ->
            expect(post1.isDirty).to.be.false
            expect(post1.isDeleted).to.be.true
            expect(post2.isDirty).to.be.false
            expect(post2.isDeleted).to.be.true
          
      
        
      
