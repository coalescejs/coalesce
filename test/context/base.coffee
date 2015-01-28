`import Context from 'coalesce/context/base'`
`import Model from 'coalesce/entities/model'`

describe 'Context', ->
  
  subject -> new Context
  
  lazy 'Post', ->
    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
    Post
  
  lazy 'config', ->
    types:
      post: @Post
      
  beforeEach ->
    @subject.configure @config if @config
  
  describe '.constructor', ->
    
    it 'creates a context', ->
      expect(@subject.container).to.not.be.null

  describe '.configure', ->

    it 'sets up the context via json config object', ->
      expect(@subject.typeFor('post').typeKey).to.eq('post')
      
  describe '.typeFor', ->
    
    subject 'result', -> @subject.typeFor(@typeKey)
    
    context 'when type registered', ->
    
      lazy 'typeKey', -> 'post'
      
      it 'returns the type', ->
        expect(@result).to.eq(@Post)
        
    context 'when type not registered', ->
      
      lazy 'typeKey', -> 'user'
      
      it 'returns null', ->
        expect(@result).to.be.undefined
        
  describe '.configFor', ->
    
    subject 'result', -> @subject.configFor('post')
    
    it 'returns configuration', ->
      expect(@result).to.not.be.null
