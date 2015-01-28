`import EntitySet from 'coalesce/collections/entity_set'`
`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/context/default'`

describe 'Model', ->

  session = null

  beforeEach ->
    `class User extends Model {}`
    User.defineSchema
      attributes:
        name: {type: 'string'}
        raw: {}
        createdAt: {type: 'date'}
    User.typeKey = 'user'
    @User = User
    
    @context = new Context
      types:
        user: User
    session = @context.newSession()

  describe '.id', ->
    
    it 'triggers metaWillChange and metaDidChange', ->
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
    
    it 'triggers metaWillChange and metaDidChange', ->
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

    it 'returns false when detached', ->
      expect(new @User().isDirty).to.be.false

    it 'returns true when dirty', ->
      user = null
      Object.defineProperty session, 'dirtyModels',
        get: -> new EntitySet([user])

      user = new @User()
      user.session = session
      expect(user.isDirty).to.be.true

    it 'returns false when untouched', ->
      Object.defineProperty session, 'dirtyModels',
        get: -> new EntitySet

      user = new @User()
      user.session = session
      expect(user.isDirty).to.be.false


  describe '.diff', ->

    it 'detects differences in complex object attributes', ->
      left = new @User
        raw: {test: 'a'}
      right = new @User
        raw: {test: 'b'}

      expect(left.diff(right)).to.eql([ { type: 'attr', name: 'raw' } ])

    it 'detects no difference in complex object attributes', ->
      left = new @User
        raw: {test: 'a'}
      right = new @User
        raw: {test: 'a'}

      expect(left.diff(right)).to.eql([])


  describe '.copy', ->
  
    it 'copies dates', ->
      
      date = new Date(2014, 7, 22)
      user = new @User
        createdAt: date
      copy = user.copy()
      expect(user.createdAt.getTime()).to.eq(copy.createdAt.getTime())
        

    it 'deep copies complex object attributes', ->

      user = new @User
        raw: {test: {value: 'a'}}

      copy = user.copy()

      expect(user).to.not.eq(copy)
      expect(user.raw).to.not.eq(copy.raw)
      expect(user.raw.test).to.not.eq(copy.raw.test)
      expect(user.raw).to.eql(copy.raw)

    it 'deep copies array attributes', ->

      user = new @User
        raw: ['a', 'b', 'c']

      copy = user.copy()

      expect(user).to.not.eq(copy)
      expect(user.raw).to.not.eq(copy.raw)
      expect(user.raw).to.eql(copy.raw)
      
  describe '.attributes', ->
    
    it 'returns map of attributes', ->
      attrs = @User.attributes
      expect(attrs.size).to.eq(3)
      
  describe 'subclassing', ->
    
    beforeEach ->
      User = @User
      `class Admin extends User {}`
      Admin.defineSchema
        attributes:
          role: {type: 'string'}
      @Admin = Admin
      `class Guest extends User {}`
      Guest.defineSchema
        attributes:
          anonymous: {type: 'boolean'}
      @Guest = Guest
    
    it 'can add fields', ->
      expect(@Admin.fields.get('role')).to.exist
      
    it 'inherits fields from parent', ->
      expect(@Admin.fields.get('name')).to.exist
    
    it 'does not modify the parent fields', ->
      expect(@User.fields.get('role')).to.not.exist
          
    it 'can share common parent class', ->
      @Admin.attributes
      expect(@Guest.attributes.get('anonymous')).to.not.be.undefined
      
          
      
