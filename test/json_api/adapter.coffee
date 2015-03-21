`import {postWithComments} from '../support/configs'`
`import Context from 'coalesce/rest/context'`

describe "RestAdapter", ->

  lazy 'context', -> new Context(postWithComments())
  lazy 'Post', -> @context.typeFor('post')
  lazy 'Comment', -> @context.typeFor('comment')
  lazy 'session', -> @context.newSession()
  
  subject -> @context.configFor('post').get('adapter')

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
      
      
