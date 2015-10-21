`import Model from 'coalesce/model/model'`
`import Container from 'coalesce/container'`
`import ModelSetSerializer from 'coalesce/serializers/model_set'`
`import {postWithComments} from '../support/schemas'`

describe 'StorageModelSerializer', ->

  App = null
  session = null
  storageModelSerializer = null

  beforeEach ->
    App = {}

    @container = new Container()
    Coalesce.__container__ = @container

    storageModelSerializer = @container.lookup('serializer:storage-model') 

    session = @container.lookup('session:main')

    postWithComments.apply(this)

  describe '.deserialize', ->
    it 'deserializes', ->
      data = id: 1, client_id: "post2", type_key: "post", title: "a post", comments: [{id: 1, client_id: 'comment1', type_key: 'comment', body: "hello", post_id: 1}]
      
      post = storageModelSerializer.deserialize(data)
      expect(post).to.be.an.instanceOf(@Post)
      expect(post.comments).to.not.be.undefined
      expect(post.comments[0].body).to.eq('hello')
      expect(post.comments[0].id).to.eq('1')
      expect(post.title).to.eq("a post")
      expect(post.id).to.eq("1")

      # session.merge comment

      # expect(comment.post.comments[0]).to.eq(comment)

  describe '.serialize', ->

    it 'serializes', -> 

