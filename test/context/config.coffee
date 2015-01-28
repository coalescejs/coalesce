`import Context from 'coalesce/context/base'`
`import Config from 'coalesce/context/base'`
`import Model from 'coalesce/entities/model'`
`import Adapter from 'coalesce/adapter'`

describe 'Config', ->
  
  lazy 'Post', ->
    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
    Post
  
  lazy 'pojoConfig', ->
    types:
      post: @Post
      
  lazy 'context', -> new Context(@pojoConfig)
  subject -> @context.configFor('post')
  
  describe '.type', ->
    
    subject 'result', -> @subject.type
    
    it 'returns model type', ->
      expect(@result).to.eq(@Post)
      
  
  describe '.get', ->
    
    subject 'result', -> @subject.get('adapter')
    
    context 'when default provider defined', ->
      
      lazy 'Adapter', ->
        `class DefaultAdapter extends Adapter {}`
      
      lazy 'pojoConfig', ->
        adapter: @Adapter
        types:
          post: @Post

      it 'returns instance of default provider', ->
        expect(@result).to.be.an.instanceOf(@Adapter)

      
      context 'and explicit provider defined', ->
        
        lazy 'ExplicitAdapter', ->
          `class ExplicitAdapter extends Adapter {}`
            
        lazy 'pojoConfig', ->
          res = @_super.pojoConfig
          res.types.post =
            class: @Post
            adapter: @ExplicitAdapter
          res
          
        it 'returns instance of explicit provider', ->
          expect(@result).to.be.an.instanceOf(@ExplicitAdapter)
          
        it 'returns same provider instance on subsequence calls', ->
          expect(@result).to.eq(@subject.get('adapter'))
