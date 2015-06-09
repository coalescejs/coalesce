`import Model from 'coalesce/model/model'`
`import Container from 'coalesce/container'`
`import SessionSerializer from 'coalesce/serializers/session'`
`import {userWithPosts} from '../support/schemas'`
`import TestRestAdapter from '../rest/_test_adapter'`
`import Coalesce from 'coalesce'`
`import Query from 'coalesce/session/query'`

describe 'SessionSerializer', ->

  App = null
  session = null
  sessionSerializer = null
  userSerializer = null
  postSerializer = null
  storageModelSerializer = null
  user = null
  adapter = null

  beforeEach ->
    App = {}

    @container = new Container()
    Coalesce.__container__ = @container

    userWithPosts.apply(this)

    App.UserSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'user'

    @container.register 'serializer:user', App.UserSerializer
    userSerializer = @container.lookup('serializer:user')

    App.PostSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'post'

    @container.register 'serializer:post', App.PostSerializer
    postSerializer = @container.lookup('serializer:post')

    storageModelSerializer = @container.lookup('serializer:storage-model')

    @RestAdapter = TestRestAdapter.extend()
    @container.register 'adapter:main', @RestAdapter

    adapter = @container.lookup('adapter:main')
    @container = adapter.container
    session = adapter.newSession()

    sessionSerializer = @container.lookup('serializer:session')


  describe '.deserialize', ->
    it 'deserializes', ->
      seralizedPost1 =
        id: 1
        title: 'heyna'
        type_key: 'post'
        user_id: 3
        client_id: "post1"

      seralizedPost2 =
        id: 2
        title: 'yao'
        type_key: 'post'
        user_id: 4
        client_id: "post2"

      seralizedUser1 =
        id: 3
        name: 'jerry'
        type_key: 'user'
        post:
          id: 1
          type_key: 'post'
          clientId: 'post1'

      seralizedUser2 =
        id: 4
        name: 'garcia'
        type_key: 'user'
        post:
          id: 2
          type_key: 'post'
          clientId: 'post2'

      data =
        [
          seralizedPost1
          seralizedPost2
          seralizedUser1
        ]

      serializedSessionHash =
        models: data
        uuidStart: 5

      deserializedSession = sessionSerializer.deserialize(session, serializedSessionHash)
      # check hash structure
      expect(deserializedSession.models).to.not.be.undefined
      expect(deserializedSession.idManager.uuid).to.eq(5)
      
  describe '.serialize', ->

    it 'serializes', ->

      user1 = @User.create name: "johnny"
      post1 = @Post.create title: "post1", user: user1
      post2 = @Post.create title: "post2", user: user1

      user1.posts = [post1, post2]
      session.merge user1
      session.merge post1
      session.merge post2

      serializedSession = sessionSerializer.serialize(session)

      # check hash structure
      expect(serializedSession.models).to.not.be.undefined
      expect(serializedSession.uuidStart).to.eq(4)

      deserializedSession = sessionSerializer.deserialize(session, serializedSession)

      user1 = deserializedSession.models[0]
      post1 = deserializedSession.models[2]
      post2 = deserializedSession.models[1]
      
      expect(user1.posts.length).to.eq(2)
      expect(user1.posts[0]).to.eq(post2)
      expect(user1.posts[1]).to.eq(post1)
      expect(post1.user).to.eq(user1)
      expect(post2.user).to.eq(user1)

    describe "relationships", ->

      it 'should serialize/deserialize relationships for existing models ', ->
        adapter.r['GET:/users/1'] = users: [{id: 1, name: 'johnny', posts: [2,3]}], posts: [{id: 2, title: 'I party', user: 1},{id: 3, title: 'everyday', user: 1}]

        session.load('user', 1).then (user) ->        
          expect(user.posts.length).to.eq(2)

          # make user  dirty so they will be seralized
          user.name = "johnny2"
          user.name = "johnny"

          serializedSession = sessionSerializer.serialize(session)

          newSession = sessionSerializer.deserialize(adapter.newSession(), serializedSession)
          
          user = newSession.fetch('user', 1)
          post = newSession.fetch('post', 2)

          # check has many
          expect(user.posts.length).to.eq(2)
          
          expect(user.posts[1].id).to.eq(post.id)

          # # check belongs to
          # NO LONGER WORKS CAUSE WE ONLY SERIALIZE DIRTY MODELS
          # expect(post.user).to.eq(user)

      it 'should serialize/deserialize relationships for new models ', ->
        user = session.create "user", name: "John"

        post = session.create "post", title: "he dont party", user: user
        post2 = session.create "post", title: "he def parties", user: user
        post3 = session.create "post", title: "Delete me!", user: user

        session.deleteModel post3

        expect(user.isNew).to.be.true
        expect(post.isNew).to.be.true
        expect(post2.isNew).to.be.true

        expect(user.posts.length).to.eq(2)
        expect(user.posts[0]).to.eq(post)
        expect(post.user).to.eq(user)

        serializedSession = sessionSerializer.serialize(session)

        newSession = sessionSerializer.deserialize(session.newSession(), serializedSession)

        _user = newSession.getForClientId(user.clientId)
        _post = newSession.getForClientId(post.clientId)

        # check has many
        expect(_user.posts.length).to.eq(2)
        expect(_user.posts[0].clientId).to.eq(_post.clientId)

        # check belongs to
        expect(_post.user.clientId).to.eq(_user.clientId)

