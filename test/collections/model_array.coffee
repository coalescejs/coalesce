`import ModelArray from 'coalesce/collections/model_array'`
`import Model from 'coalesce/model/model'`
`import attr from 'coalesce/model/attribute'`

describe 'ModelArray', ->

  array = null

  beforeEach ->
    `class Post extends Model {}`
    Post.defineSchema
      typeKey: 'post'
      attributes:
        title: {type: 'string'}
    @Post = Post
    array = new ModelArray()

  describe 'removeObject', ->

    it 'should remove based on `isEqual` equivalence', ->
      array.addObject @Post.create(clientId: '1')
      array.removeObject @Post.create(clientId: '1')
      expect(array.length).to.eq(0)


  describe '.load', ->

    beforeEach ->
      @Post.reopen
        load: ->
          @loadCalled = true
          Coalesce.Promise.resolve(@)
      array.pushObject(@Post.create(id: "1"))
      array.pushObject(@Post.create(id: "2"))

    it 'should load all models', ->
      array.load().then ->
        expect(array.length).to.eq(2)
        array.forEach (model) ->
          expect(model.loadCalled).to.be.true
