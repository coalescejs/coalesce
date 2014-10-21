`import Model from 'coalesce/model/model'`
`import Container from 'coalesce/container'`
`import SessionSerializer from 'coalesce/serializers/session'`
`import {userWithPost} from '../support/schemas'`
`import TestRestAdapter from '../rest/_test_adapter'`
`import Coalesce from 'coalesce'`

describe 'SessionSerializer', ->

  App = null
  session = null
  sessionSerializer = null
  userSerializer = null
  postSerializer = null
  user = null
  adapter = null

  beforeEach ->
    App = {}

    @container = new Container()
    Coalesce.__container__ = @container

    userWithPost.apply(this)

    App.UserSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'user'

    @container.register 'serializer:user', App.UserSerializer
    userSerializer = @container.lookup('serializer:user')

    App.PostSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'post'

    @container.register 'serializer:post', App.PostSerializer
    postSerializer = @container.lookup('serializer:post')

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

      seralizedPost2 =
        id: 2
        title: 'yao'

      seralizedUser1 =
        id: 3
        name: 'jerry'

      seralizedUser2 =
        id: 4
        name: 'garcia'

      data =
        post: [
          seralizedPost1
          seralizedPost2
        ]
        user: [
          seralizedUser1
        ]

      newData =
        user: [
          seralizedUser2
        ]

      queries = 
        'post$undefined':['post1', 'post2']
        'user$undefined':['user3', 'user4']
      

      serializedSessionHash =
        models: data
        newModels: newData
        shadows: [],
        uuidStart: 5,
        queryCache: queries

      deserializedSession = sessionSerializer.deserialize(serializedSessionHash)
      
      # check hash structure
      expect(deserializedSession.models).to.not.be.undefined
      expect(deserializedSession.newModels).to.not.be.undefined
      expect(deserializedSession.shadows).to.not.be.undefined
      expect(deserializedSession.uuidStart).to.not.be.undefined
      expect(deserializedSession.queryCache).to.not.be.undefined

      expect(deserializedSession.queryCache._queries['post$undefined'].length).to.eq(2)
      expect(deserializedSession.queryCache._queries['user$undefined'].length).to.eq(2)
      expect(deserializedSession.queryCache._queries['post$undefined'][0].title).to.eq('heyna')
      expect(deserializedSession.queryCache._queries['user$undefined'][0].name).to.eq('jerry')

      # check that a user was deserialized correctly
      deserializeUser = userSerializer.deserialize(seralizedUser2)
      deserializedSessionUser = deserializedSession.newModels[0]

      expect(deserializedSessionUser).to.eql(deserializeUser)

      # check that a post was deserialized correctly
      deserializePost = postSerializer.deserialize(seralizedPost1)
      deserializedSessionPost = deserializedSession.models[0]

      expect(deserializedSessionPost).to.eql(deserializePost)
      
  describe '.serialize', ->

    it 'serializes', ->
      post1 = @Post.create id: 1, title: "yo"
      post2 = @Post.create id: 2, title: "boi"
      user1 = @User.create id: 3, name: "johnny"

      session.merge post1
      session.merge post2
      session.merge user1

      # this response will be returned for both queries
      adapter.r['GET:/posts'] =
        posts: [postSerializer.serialize(post1),postSerializer.serialize(post2)]

      query1 = session.query('post')
      query2 = session.query('post',{"name":"yo"})

      Coalesce.Promise.all([query1,query2]).then ->
        
        serializedSession = sessionSerializer.serialize(session)

        # check hash structure
        expect(serializedSession.models).to.not.be.undefined
        expect(serializedSession.newModels).to.not.be.undefined
        expect(serializedSession.shadows).to.not.be.undefined
        expect(serializedSession.queryCache).to.not.be.undefined

        expect(serializedSession.queryCache['post$undefined'].length).to.eq(2)
        expect(serializedSession.queryCache['post${"name":"yo"}'].length).to.eq(2)
        expect(serializedSession.uuidStart).to.eq(4)

        # check that a user was serialized correctly
        serializeUser = userSerializer.serialize(user1)

        serializedSessionUser = serializedSession.models.user[0]

        expect(serializeUser).to.eql(serializedSessionUser)

        # check that a post was serialized correctly
        serializePost = postSerializer.serialize(post1)

        serializedSessionPost = serializedSession.models.post[0]

        expect(serializePost).to.eql(serializedSessionPost)
