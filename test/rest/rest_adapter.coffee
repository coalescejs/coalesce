`import setup from './_shared'`
`import {postWithComments} from '../support/schemas'`

describe "RestAdapter", ->

  adapter = null
  session = null

  beforeEach ->
    setup.apply(this)
    adapter = @adapter
    session = @session
    Coalesce.__container__ = @container

    postWithComments.apply(this)
    
    @container.register 'model:comment', @Comment

  afterEach ->
    delete Coalesce.__container__

  describe '.mergePayload', ->

    data =
      post: {id: 1, title: 'ma post', comments: [2, 3]}
      comments: [{id: 2, body: 'yo'}, {id: 3, body: 'sup'}]

    it 'should merge with typeKey as context', ->
      post = adapter.mergePayload(data, 'post', session)[0]
      expect(post.title).to.eq('ma post')
      expect(post).to.eq(session.getModel(post))

    it 'should merge with no context', ->
      models = adapter.mergePayload(data, null, session)
      expect(models.size).to.eq(3)

  describe '.ajaxOptions', ->
    
    beforeEach ->
      adapter.headers = {'X-HEY': 'ohai'}
    
    it 'picks up headers from .headers', ->
      hash = adapter.ajaxOptions('/api/test', 'GET', {})
      expect(hash.beforeSend).to.not.be.null
      
      xhr =
        setRequestHeader: (key, value) -> @[key] = value
        
      hash.beforeSend(xhr)
      expect(xhr['X-HEY']).to.eq('ohai')
      
  describe '.buildUrl', ->
    
    it 'encodes ids', ->
      expect(@adapter.buildUrl('message', 'asd@asd.com')).to.eq('/messages/asd%40asd.com')

  context 'delta saving', (done) ->
    it 'multiple dirty models with error, persists a dirty model after resolve', ->
      adapter.r["PUT:/posts/1"] = ->
        throw status: 422, responseText: JSON.stringify(errors: {title: 'is invalid'})

      adapter.r["PUT:/posts/2"] = ->
        throw status: 422, responseText: JSON.stringify(errors: {title: 'is invalid'})

      post1 = session.merge @Post.create(id: 1, title: '')
      post2 = session.merge @Post.create(id: 2, title: '')

      post1.title = 'error title'
      post2.title = 'error title'

      session.flush().then null, ->
        expect(post1.title).to.eql('error title')
        expect(post2.title).to.eql('error title')
        expect(post1.isDirty).to.be.true
        expect(post2.isDirty).to.be.true

        expect(session.shadows.has(post1)).to.be.true
        expect(session.shadows.has(post2)).to.be.true

        post1.title = 'valid title'

        adapter.r["PUT:/posts/1"] = (url, type, hash) ->
          expect(hash.data.post.title).to.eql('valid title')
          expect(post2.title).to.eql('error title')

          # cause of the session flush preempty markClean
          expect(post1.isDirty).to.be.false
          expect(post2.isDirty).to.be.false

          post: {title: hash.data.post.title, id: 1, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}       

        session.flush().then null, ->
          expect(post1.isDirty).to.be.false
          expect(post2.isDirty).to.be.true

          expect(post1.errors).to.be.null

          expect(session.shadows.has(post2)).to.be.true

          done

          # expect(post1.title).to.eql('valid title')
          # expect(post2.title).to.eql('error title')

          # adapter.r["PUT:/posts/2"] = (url, type, hash) ->
          #   expect(hash.data.post.title).to.eql('another that post')
          #   post: {title: hash.data.post.title, id: 2, client_id: hash.data.post.client_id, client_rev: hash.data.post.client_rev}

          # session.flush().then ->
          #   done
