`import EntitySet from 'coalesce/collections/entity_set'`
`import Graph from 'coalesce/collections/graph'`
`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/context/default'`

describe 'Model', ->

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
  lazy 'session', -> @context.newSession()

  describe '.id', ->
    
    xit 'triggers metaWillChange and metaDidChange', ->
      user = new @User()
      willHit = false
      didHit = false
      user.metaWillChange = ->
        willHit = true
      user.metaDidChange = ->
        didHit = true
      user.id = 1
      expect(willHit).to.be.true
      expect(didHit).to.be.true
      
  describe '.errors', ->
    
    xit 'triggers metaWillChange and metaDidChange', ->
      user = new @User()
      willHit = false
      didHit = false
      user.metaWillChange = ->
        willHit = true
      user.metaDidChange = ->
        didHit = true
      user.errors = {name: 'invalid'}
      expect(willHit).to.be.true
      expect(didHit).to.be.true

  describe '.isDirty', ->      

    it 'is false when detached', ->
      expect(new @User().isDirty).to.be.false

    it 'is true when dirty', ->
      user = @session.merge new @User(id: '1', name: 'lilg')
      user.name = 'bigg'
      expect(user.isDirty).to.be.true

    it 'is false when untouched', ->
      user = @session.merge new @User(id: '1', name: 'lilg')
      expect(user.isDirty).to.be.false


  describe '.fork', ->
  
    lazy 'graph', -> new Graph()
  
    it 'copies dates', ->
      
      date = new Date(2014, 7, 22)
      user = new @User
        createdAt: date
      copy = user.fork(@graph)
      expect(user.createdAt.getTime()).to.eq(copy.createdAt.getTime())
        

    it 'deep copies complex object attributes', ->

      user = new @User
        raw: {test: {value: 'a'}}

      copy = user.fork(@graph)

      expect(user).to.not.eq(copy)
      expect(user.raw).to.not.eq(copy.raw)
      expect(user.raw.test).to.not.eq(copy.raw.test)
      expect(user.raw).to.eql(copy.raw)

    it 'deep copies array attributes', ->

      user = new @User
        raw: ['a', 'b', 'c']

      copy = user.fork(@graph)

      expect(user).to.not.eq(copy)
      expect(user.raw).to.not.eq(copy.raw)
      expect(user.raw).to.eql(copy.raw)
      
  describe '.attributes', ->
    
    xit 'returns map of attributes', ->
      attrs = @User.attributes
      expect(attrs.size).to.eq(3)
      
  describe 'subclassing', ->
    
    beforeEach ->
      User = @User
      `class Admin extends User {}`
      Admin.defineSchema
        attributes:
          role: {type: 'string'}
      Admin.reify(@context, 'admin')
      @Admin = Admin
      `class Guest extends User {}`
      Guest.defineSchema
        attributes:
          anonymous: {type: 'boolean'}
      Guest.reify(@context, 'guest')
      @Guest = Guest
    
    it 'can add fields', ->
      expect(@Admin.schema.role).to.exist
      
    it 'inherits fields from parent', ->
      expect(@Admin.schema.name).to.exist
    
    it 'does not modify the parent fields', ->
      expect(@User.schema.role).to.not.exist
          
    it 'can share common parent class', ->
      @Admin.attributes
      expect(@Guest.schema.anonymous).to.not.be.undefined
      
          
      
