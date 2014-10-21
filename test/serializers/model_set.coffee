`import Model from 'coalesce/model/model'`
`import Container from 'coalesce/container'`
`import ModelSetSerializer from 'coalesce/serializers/model_set'`
`import {userWithPost} from '../support/schemas'`

describe 'ModelSetSerializer', ->

  App = null
  session = null
  serializer = null
  modelSetSerializer = null


  beforeEach ->
    App = {}

    @container = new Container()
    Coalesce.__container__ = @container

    modelSetSerializer = @container.lookup('serializer:model-set') 

    App.UserSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'user'

    @container.register 'serializer:user', App.UserSerializer

    App.PostSerializer = Coalesce.ModelSerializer.extend
      typeKey: 'post'
      
    @container.register 'serializer:post', App.PostSerializer

    session = @container.lookup('session:main')

    userWithPost.apply(this)

  describe '.deserialize', ->
    it 'deserializes', ->
      seralizedPost1 =
        id: 1
        title: 'yo'

      seralizedPost2 =
        id: 2
        title: 'boi'

      seralizedUser1 =
        id: 3
        name: 'johnny'

      seralizedUser2 =
        id: 4
        name: 'bobby'

      data =
        post: [
          seralizedPost1
          seralizedPost2
        ]
        user: [
          seralizedUser1
          seralizedUser2
        ]

      modelSet = modelSetSerializer.deserialize(data)

      expect(modelSet.size).to.eq(4)

      modelArray = modelSet.toArray()

      # hopefully order isnt a problem here

      expect(modelArray[0].isModel).to.be.true
      expect(modelArray[1].isModel).to.be.true
      expect(modelArray[2].isModel).to.be.true
      expect(modelArray[3].isModel).to.be.true

      expect(modelArray[0].title).to.eq('yo')
      expect(modelArray[1].title).to.eq('boi')
      expect(modelArray[2].name).to.eq('johnny')
      expect(modelArray[3].name).to.eq('bobby')

      expect(modelArray[0].id).to.eq('1')
      expect(modelArray[1].id).to.eq('2')
      expect(modelArray[2].id).to.eq('3')
      expect(modelArray[3].id).to.eq('4')

  describe '.serialize', ->

    it 'serializes', -> 
      post1 = @Post.create id: 1, title: "yo"
      post2 = @Post.create id: 2, title: "boi"
      user1 = @User.create id: 3, name: "johnny"

      session.merge post1
      session.merge post2
      session.merge user1

      serializedModelSetHash = modelSetSerializer.serialize(session.models)

      expect(serializedModelSetHash[post1.typeKey]).to.not.be.undefined
      expect(serializedModelSetHash[user1.typeKey]).to.not.be.undefined

      expect(serializedModelSetHash[post1.typeKey].length).to.eq(2)
      expect(serializedModelSetHash[user1.typeKey].length).to.eq(1)
    
      expect(serializedModelSetHash[post1.typeKey][0].title).to.eq('yo')
      expect(serializedModelSetHash[user1.typeKey][0].name).to.eq('johnny')
