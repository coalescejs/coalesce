`import {postWithComments} from '../support/configs'`
`import Context from 'coalesce/rest/context'`

describe "RestAdapter", ->

  lazy 'context', -> new Context(postWithComments())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'Comment', -> @context.typeFor('comment')
  lazy 'session', -> @context.newSession()
  
  subject -> @context.configFor('post').get('adapter')

  describe '.mergePayload', ->

    lazy 'data', ->
      post: {id: 1, title: 'ma post', comments: [2, 3]}
      comments: [{id: 2, body: 'yo'}, {id: 3, body: 'sup'}]

    it 'should merge with typeKey as context', ->
      post = @subject.mergePayload(@data, 'post', @session)[0]
      expect(post.title).to.eq('ma post')
      expect(post).to.eq(@session.getModel(post))

    it 'should merge with no context', ->
      models = @subject.mergePayload(@data, null, @session)
      expect(models.size).to.eq(3)

  describe '.ajaxOptions', ->
    
    beforeEach ->
      @subject.headers = {'X-HEY': 'ohai'}
    
    it 'picks up headers from .headers', ->
      hash = @subject.ajaxOptions('/api/test', 'GET', {})
      expect(hash.beforeSend).to.not.be.null
      
      xhr =
        setRequestHeader: (key, value) -> @[key] = value
        
      hash.beforeSend(xhr)
      expect(xhr['X-HEY']).to.eq('ohai')
      
  describe '.buildUrl', ->
    
    it 'encodes ids', ->
      expect(@subject.buildUrl('message', 'asd@asd.com')).to.eq('/messages/asd%40asd.com')
      
      
