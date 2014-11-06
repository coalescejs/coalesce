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
        type_key: 'post'

      seralizedPost2 =
        id: 2
        title: 'boi'
        type_key: 'post'

      seralizedUser1 =
        id: 3
        name: 'johnny'
        type_key: 'user'

      seralizedUser2 =
        id: 4
        name: 'bobby'
        type_key: 'user'

      data =
        [
          seralizedPost1
          seralizedPost2
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

      post1 = session.create 'post',
        title: "yo"

      serializedModelSetArray = modelSetSerializer.serialize(session.newModels)
      
      expect(serializedModelSetArray[0]).to.not.be.undefined
    
      expect(serializedModelSetArray[0].title).to.eq('yo')
