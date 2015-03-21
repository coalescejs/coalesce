`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/context/default'`
`import ModelDiff from 'coalesce/diff/model'`

describe 'ModelDiff', ->
  
  lazy 'context', ->
    `class User extends Model {}`
    User.defineSchema
      attributes:
        name: {type: 'string'}
        raw: {}
        createdAt: {type: 'date'}
    User.typeKey = 'user'
    
    new Context
      types:
        user: User

  lazy 'User', -> @context.typeFor('user')
  
  lazy 'left', -> new @User()
  lazy 'right', -> new @User()
  subject -> new ModelDiff(@left, @right)
  
  context 'with no difference in complex attribute', ->
    
    lazy 'left', -> new @User
      raw: {test: 'a'}
  
    lazy 'right', -> new @User
      raw: {test: 'a'} 
    
    it 'does not detect', ->
      expect(@subject).to.be.empty
    
  
  context 'with difference in complex attribute', ->
    
    lazy 'left', -> new @User
      raw: {test: 'a'}
  
    lazy 'right', -> new @User
      raw: {test: 'b'} 
    
    it 'detects', ->
      expect(@subject).to.not.be.empty
