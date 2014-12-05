`import Model from 'coalesce/model/model'`
`import HasManyArray from 'coalesce/collections/has_many_array'`
`import Container from 'coalesce/context/container'`

describe 'hasMany', ->
  
  it 'accepts custom collectionType option', ->
    `class CustomArray extends HasManyArray {}`
    
    `class User extends Model {}`
    User.defineSchema
      relationships:
        tags: {kind: 'hasMany', type: 'tag', collectionType: CustomArray}
    User.typeKey = 'user'
    
    `class Tag extends Model {}`
    Tag.typeKey = 'tag'
    
    user = new User()
    expect(user.tags).to.be.an.instanceOf(CustomArray)
    
    
    
    
    
    
