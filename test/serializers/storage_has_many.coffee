`import Model from 'coalesce/model/model'`
`import Container from 'coalesce/container'`
`import ModelSetSerializer from 'coalesce/serializers/model_set'`
`import {postWithComments} from '../support/schemas'`

describe 'StorageHasManySerializer', ->

  App = null
  session = null
  storageHasManySerializer = null

  beforeEach ->
    App = {}

    @container = new Container()
    Coalesce.__container__ = @container

    storageHasManySerializer = @container.lookup('serializer:storage-has-many') 

    session = @container.lookup('session:main')

    postWithComments.apply(this)

  describe '.deserialize', ->
    it 'deserializes', ->
      data = [{id: 1, type_key: 'comment'}, {id: 2, type_key: 'comment'}]
      comments = storageHasManySerializer.deserialize(data)
      expect(comments.length).to.eq(2)
      expect(comments[0].isDetached).to.be.true

  describe '.serialize', ->

    it 'serializes', -> 
      comment = @Comment.create
        id: 1
        clientId: "1"
        body: "this is body"
        post: 1

      post = @Post.create
        id: 1
        clientId: "2"
        title: "wat"
        comments: [comment]

      data = storageHasManySerializer.serialize(post.comments)

      expect(data).to.eql([{id: 1, type_key: "comment"}])

