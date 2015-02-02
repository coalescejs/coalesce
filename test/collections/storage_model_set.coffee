`import Model from 'coalesce/model/model'`
`import StorageModelSet from 'coalesce/collections/storage_model_set'`
`import Container from 'coalesce/container'`
`import {userWithPosts} from '../support/schemas'`

describe 'StorageModelSet', ->

  # beforeEach  ->
  #   @container = new Container()
  #   Coalesce.__container__ = @container

  #   userWithPosts.apply(this)

  #   @session = @container.lookup('session:main')
  #   @storageModelSerializer = @container.lookup('serializer:storage-model')

  #   @session.models = new StorageModelSet('models', @container);
  #   @set = @session.models


  # afterEach (done) ->
  #   @set._clearStore().then ->  
  #     done()

  # it 'adds to storage with correct key and proper serialization', (done) ->
  #   user = @User.create(id: "1", name: "Jerry", clientId: "user1", posts:[])
  #   post = @Post.create(id: "1", title: "Parties Hard", clientId: "post1", user:user)

  #   user.posts.push post

  #   @session.merge post
  #   @session.merge user

  #   serializedPost = @storageModelSerializer.serialize(post)
  #   serializedUser = @storageModelSerializer.serialize(user)

  #   set = @set

  #   @set.afterStoreIsSettled ->
  #     #check child first
  #     storeKey = StorageModelSet.getStoreKeyForModel(post)

  #     expect(storeKey).to.eq('post:post1')

  #     set.store.getItem storeKey, (errors, model)->
  #       expect(errors).to.be.null 
  #       expect(model.client_id).to.eq('post1')
  #       expect(model.title).to.eq("Parties Hard")
  #       expect(model).to.eql(serializedPost)
  #       expect(model.user.client_id).to.eq(user.clientId)

  #       #check parent user
  #       storeKey = StorageModelSet.getStoreKeyForModel(user)

  #       expect(storeKey).to.eq('user:user1')

  #       set.store.getItem storeKey, (errors, model)->
  #         expect(errors).to.be.null 
  #         expect(model.client_id).to.eq('user1')
  #         expect(model.name).to.eq("Jerry")
  #         expect(model).to.eql(serializedUser)
  #         expect(model.posts[0].client_id).to.eq(post.clientId)
          
  #         done()
  #   , @