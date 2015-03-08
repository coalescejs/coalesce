`import EntityArray from 'coalesce/collections/entity_array'`
`import Model from 'coalesce/entities/model'`

describe 'EntityArray', ->

  array = null

  beforeEach ->
    `class Post extends Model {}`
    Post.defineSchema
      typeKey: 'post'
      attributes:
        title: {type: 'string'}
    @Post = Post
    array = new EntityArray()

  describe 'removeObject', ->

    it 'should remove based on `isEqual` equivalence', ->
      array.addObject new @Post(clientId: '1')
      array.removeObject new @Post(clientId: '1')
      expect(array.length).to.eq(0)


  describe '.load', ->

    beforeEach ->
      @Post.reopen
        load: ->
          @loadCalled = true
          Coalesce.Promise.resolve(@)
      array.pushObject(new @Post(id: "1"))
      array.pushObject(new @Post(id: "2"))

    xit 'should load all models', ->
      array.load().then ->
        expect(array.length).to.eq(2)
        array.forEach (model) ->
          expect(model.loadCalled).to.be.true