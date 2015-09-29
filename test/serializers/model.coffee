`import ModelSerializer from 'coalesce/serializers/model'`
`import Model from 'coalesce/model/model'`
`import Context from 'coalesce/context/default'`
`import Serializer from 'coalesce/serializers/base'`

`import {postWithComments, postWithEmbeddedComments} from '../support/configs'`

describe 'ModelSerializer', ->

  lazy 'ModelClass', ->
    `class User extends Model {}`
    User.defineSchema @schema
    User
    
  lazy 'schema', ->
    attributes:
      name: {type: 'string'}
    
  lazy 'context', ->
    new Context
      types:
        user: @ModelClass

  subject ->
    @context.configFor('user').get('serializer')

  lazy 'data', -> {id: 1, name: 'Bro', rev: 123, client_rev: 321, client_id: 1,}
  lazy 'deserialized', -> @subject.deserialize @data
  
  lazy 'model', -> new @ModelClass id: 1, name: 'Bro'
  lazy 'serialized', -> @subject.serialize @model
  
  describe '.deserialize', ->
      
    it 'deserializes to a model instance', ->
      expect(@deserialized.name).to.eq('Bro')
      
    it 'reifies client_id', ->
      expect(@deserialized.clientId).to.not.be.null
      
    it 'includes meta properties', ->
      expect(@deserialized.rev).to.not.be.null
      expect(@deserialized.clientRev).to.not.be.null
      expect(@deserialized.id).to.not.be.null
      expect(@deserialized.clientId).to.not.be.null

  describe '.serialize', ->
        
    it 'serializes to pojo', ->
      expect(@serialized.name).to.eq('Bro')
  
  context 'when attribute has `transient` option set to true', ->
    
    lazy 'schema', ->
      attributes:
        postCount: {type: 'number', transient: true}
        
    describe '.deserialize', ->
    
      lazy 'data', -> {id: 1, post_count: 12}
      
      it 'includes attribute', ->
        expect(@deserialized.postCount).to.eq(12)
        
    describe '.serialize', ->
      
      lazy 'model', -> new @ModelClass id: 1, postCount: 12
      
      it 'does not include attribute', ->
        expect(@serialized.post_count).to.be.undefined
        
  context 'when attribute has `key` option set', ->
    
    lazy 'schema', ->
      attributes:
        name: {type: 'string', key: 'FULL_NAME'}
    
    describe '.deserialize', ->
        
      lazy 'data', -> id: 1, FULL_NAME: 'Gordon Michael Hempton'
      
      it 'deserializes attribute from that key', ->
        expect(@deserialized.name).to.eq('Gordon Michael Hempton')
        
    describe '.serialize', ->
      
      lazy 'model', -> new @ModelClass id: 1, name: 'Gordon Michael Hempton'
      
      it 'serializes attribute to that key', ->
        expect(@serialized.FULL_NAME).to.eq('Gordon Michael Hempton')

  
  context 'when attribute does not have a type', ->
    
    lazy 'schema', ->
      attributes:
        name: {}
        
    context 'and attribute value is a pojo', ->
      
      describe '.deserialize', ->
        
        lazy 'data', -> id: 1, name: {middle_name: 'Michael'}
        
        it 'keeps nested properties', ->
          expect(@deserialized.name.middle_name).to.eq('Michael')
          
      describe '.serialize', ->
        
        lazy 'model', -> new @ModelClass id: 1, name: {middle_name: 'Michael'}
        
        it 'keeps nested properties', ->
          expect(@serialized.name.middle_name).to.eq('Michael')
          
    context 'and attribute value is a populated array', ->
      
      describe '.deserialize', ->
        
        lazy 'data', -> id: 1, name: ['Gordon', 'Michael', 'Hempton']
        
        it 'keeps array contents', ->
          expect(@deserialized.name).to.eql(['Gordon', 'Michael', 'Hempton'])
          
      describe '.serialize', ->
        
        lazy 'model', -> new @ModelClass id: 1, name: ['Gordon', 'Michael', 'Hempton']
        
        it 'keeps array contents', ->
          expect(@serialized.name).to.eql(['Gordon', 'Michael', 'Hempton'])
          
    context 'and attribute value is an empty array', ->
      
      describe '.deserialize', ->
        
        lazy 'data', -> id: 1, name: []
        
        it 'keeps array contents', ->
          expect(@deserialized.name).to.eql([])
          
      describe '.serialize', ->
        
        lazy 'model', -> new @ModelClass id: 1, name: []
        
        it 'keeps array contents', ->
          expect(@serialized.name).to.eql([])
          
  context 'when attribute type is associated with a custom serializer', ->
    
    lazy 'CustomSerializer', ->
      `class CustomSerializer extends Serializer {}`
      CustomSerializer.prototype.serialize = -> 's'
      CustomSerializer.prototype.deserialize = -> 'd'
      CustomSerializer
    
    lazy 'context', ->
      new Context
        types:
          user: @ModelClass
          thing:
            serializer: @CustomSerializer
            
    lazy 'schema', ->
      attributes:
        thing: {type: 'thing'}
            
    describe '.deserialize', ->
      
      lazy 'data', -> id: 1, thing: '1'
        
      it 'uses serializer', ->
        expect(@deserialized.thing).to.eq('d')
        
    describe '.serialize', ->
      
      lazy 'model', -> new @ModelClass id: 1, thing: '1'
      
      it 'uses serializer', ->
        expect(@serialized.thing).to.eq('s')
    
    context 'and its value is undefined', ->
      
      describe '.deserialize', ->
        
        it 'does not include attribute', ->
          expect(@deserialized.thing).to.be.undefined
      
      describe '.serialize', ->
        
        it 'does not include attribute', ->
          expect(@serialized.thing).to.be.undefined

    context 'and its value is null', ->
      
      describe '.deserialize', ->
        
        lazy 'data', -> id: 1, thing: null
          
        it 'uses serializer', ->
          expect(@deserialized.thing).to.eq('d')
          
      describe '.serialize', ->
        
        lazy 'model', -> new @ModelClass id: 1, thing: null
        
        it 'uses serializer', ->
          expect(@serialized.thing).to.eq('s')
  
  context 'with belongsTo relationship', ->
    
    lazy 'context', -> new Context(postWithComments())
    lazy 'ModelClass', -> @context.typeFor('comment')
    subject -> @context.configFor('comment').get('serializer')
    
    describe '.deserialize', ->
      
      lazy 'data', -> id: 1, post: 2
      
      it 'deserializes relationship', ->
        expect(@deserialized.post).to.not.be.null
        
      context 'with null', ->
        
        lazy 'data', -> id: 1, post: null
        
        it 'deserializes as empty relationship', ->
          expect(@deserialized.post).to.be.null
          
      context 'when embedded', ->
        
        lazy 'context', -> new Context(postWithEmbeddedComments())
        lazy 'data', -> id: 1, post: {id: 2}
        
        it 'deserializes relationship', ->
          expect(@deserialized.post).to.not.be.null
          
        context 'with null', ->
          lazy 'data', -> id: 1, post: null
          
          it 'deserializes as empty relationship', ->
            expect(@deserialized.post).to.be.null
            
  context 'with hasMany relationship', ->
  
    lazy 'context', -> new Context(postWithComments())
    lazy 'ModelClass', -> @context.typeFor('post')
    subject -> @context.configFor('post').get('serializer')
    
    describe '.deserialize', ->
      
      lazy 'data', -> id: 1, comments: [2]
      
      it 'deserializes relationship', ->
        expect(@deserialized.comments.length).to.eq(1)
        
      context 'with null', ->
        
        lazy 'data', -> id: 1, comments: null
        
        it 'deserializes as empty relationship', ->
          expect(@deserialized.comments.length).to.eq(0)
          
      context 'with multiple models', ->
        
        lazy 'data', -> id: 1, comments: [2, 3]
        
        it 'preserves order', ->
          expect(@deserialized.comments.length).to.eq(2)
          expect(@deserialized.comments[0].id).to.eq("2")
          
      context 'when embedded', ->
        
        lazy 'context', -> new Context(postWithEmbeddedComments())
        lazy 'data', -> id: 1, comments: [{id: 2}]
        
        it 'deserializes relationship', ->
          expect(@deserialized.comments.length).to.eq(1)
          
        context 'with null', ->
          lazy 'data', -> id: 1, post: null
          
          xit 'deserializes as empty relationship', ->
            expect(@deserialized.comments.length).to.eq(0)
