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

      seralizedPost2 =
        id: 2
        title: 'yao'
        type_key: 'post'

      seralizedUser1 =
        id: 3
        name: 'jerry'
        type_key: 'user'

      seralizedUser2 =
        id: 4
        name: 'garcia'
        type_key: 'user'

      data =
        [
          seralizedPost1
          seralizedPost2
          seralizedUser1
        ]

      newData =
        [
          seralizedUser2
        ]

      queries = 
        'post${}':['post1', 'post2']
        'user${}':['user3']
      

      serializedSessionHash =
        models: data
        newModels: newData
        shadows: [],
        uuidStart: 5,
        queryCache: queries

      deserializedSession = sessionSerializer.deserialize(session, serializedSessionHash)
      
      # check hash structure
      expect(deserializedSession.models).to.not.be.undefined
      expect(deserializedSession.newModels).to.not.be.undefined
      expect(deserializedSession.shadows).to.not.be.undefined
      expect(deserializedSession.queryCache).to.not.be.undefined
      expect(deserializedSession.idManager.uuid).to.eq(5)

      expect(deserializedSession.queryCache._queries['post${}']).to.be.an.instanceOf(Query)
      expect(deserializedSession.queryCache._queries['post${}'].length).to.eq(2)
      expect(deserializedSession.queryCache._queries['user${}'].length).to.eq(1)
      expect(deserializedSession.queryCache._queries['post${}'][0].title).to.eq('heyna')
      expect(deserializedSession.queryCache._queries['user${}'][0].name).to.eq('jerry')

      # check that a user was deserialized correctly
      deserializeUser = userSerializer.deserialize(seralizedUser2)
      deserializedSessionUser = deserializedSession.newModels[0]

      expect(deserializedSessionUser).to.eql(deserializeUser)

      # check that a post was deserialized correctly
      deserializePost = postSerializer.deserialize(seralizedPost1)
      deserializedSessionPost = deserializedSession.models[0]
      
      expect(deserializedSessionPost.id).to.eql(deserializePost.id)
      
  describe '.serialize', ->

    it 'serializes', ->
      post1 = @Post.create id: 1, title: "yo"
      post2 = @Post.create id: 2, title: "yo boi"
      user1 = @User.create id: 3, name: "johnny"

      session.merge post1
      session.merge post2
      session.merge user1

      # this response will be returned for both queries
      adapter.r['GET:/posts'] =
        posts: [postSerializer.serialize(post1),postSerializer.serialize(post2)]

      query1 = session.query('post')
      query2 = session.query('post',{"title":"yo"})

      Coalesce.Promise.all([query1,query2]).then ->
        
        serializedSession = sessionSerializer.serialize(session)

        # check hash structure
        expect(serializedSession.models).to.not.be.undefined
        expect(serializedSession.newModels).to.not.be.undefined
        expect(serializedSession.shadows).to.not.be.undefined
        expect(serializedSession.queryCache).to.not.be.undefined

        expect(serializedSession.queryCache['post${}'].length).to.eq(2)
        expect(serializedSession.queryCache['post${"title":"yo"}'].length).to.eq(2)
        expect(serializedSession.uuidStart).to.eq(4)

        # check that a post was serialized correctly
        serializePost = storageModelSerializer.serialize(post1)

        serializedSessionPost = serializedSession.models[0]

        expect(serializePost).to.eql(serializedSessionPost)

    describe "relationships", ->

      it 'should serialize/deserialize hasMany relationships', ->
        adapter.r['GET:/users/1'] = users: [{id: 1, name: 'johnny', posts: [2,3]}], posts: [{id: 2, title: 'I party', user: 1},{id: 3, title: 'everyday', user: 1}]

        session.load('user', 1).then (user) ->        
          expect(user.posts.length).to.eq(2)

          serializedSession = sessionSerializer.serialize(session)

          newSession = sessionSerializer.deserialize(session.newSession(), serializedSession)

          user = newSession.fetch('user', 1)

          expect(user.posts.length).to.eq(2)





