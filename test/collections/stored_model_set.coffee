`import Model from 'coalesce/model/model'`
`import StoredModelSet from 'coalesce/collections/stored_model_set'`
`import Container from 'coalesce/container'`

describe 'StoredModelSet', ->

  beforeEach (done) ->
    @container = new Container()
    Coalesce.__container__ = @container

    `class Post extends Model {}`
    Post.defineSchema
      typeKey: 'post'
      attributes:
        title: {type: 'string'}
    @Post = Post

    PostSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'post'

    @container.register 'model:post', @Post
    @container.register 'serializer:post', PostSerializer

    @set = new StoredModelSet 'models', @container

    @set._clearStore().then ->  
      done()
      return

    return

  it 'adds to storage with correct key', ->
    Post = @Post
    postA = @Post.create(id: "1", title: "one", clientId: "post1")

    set = @set

    @set.addModelToStore(postA).then ->
      storeKey = StoredModelSet.getStoreKeyForModel(postA)

      expect(storeKey).to.eq('post:post1')

      set.store.getItem storeKey, (errors, model)->
        expect(errors).to.be.null 
        expect(model.client_id).to.eq('post1')