`import ModelMerge from 'coalesce/merge/model'`
`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/context/default'`

describe 'ModelMerge', ->

  lazy 'context', ->
    `class User extends Model {}`
    User.defineSchema
      attributes:
        name: {type: 'string'}
      relationships:
        posts: {kind: 'hasMany', type: 'post'}
      
    `class Comment extends Model {}`
    Comment.defineSchema
      attributes:
        body: {type: 'string'}
      relationships:
        post: {kind: 'belongsTo', type: 'post'}
        
    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
        body: {type: 'string'}
        createdAt: {type: 'date'}
      relationships:
        comments: {kind: 'hasMany', type: 'comment'}
        user: {kind: 'belongsTo', type: 'user'}
    
    new Context
      types:
        user: User
        comment: Comment
        post: Post
  
  lazy 'session', ->
    @context.newSession()
    
  lazy 'User', -> @context.typeFor('user')
  lazy 'Comment', -> @context.typeFor('comment')
  lazy 'Post', -> @context.typeFor('post')

  it 'keeps modified fields from both versions', ->
    post = @session.merge new @Post(id: '1', title: 'titleA', body: 'bodyA', createdAt: new Date(1985, 7, 22))
    post.title = 'titleB'
    @session.merge new @Post(id: '1', title: 'titleA', body: 'bodyB', createdAt: null, comments: [])
    expect(post.title).to.eq('titleB')
    expect(post.body).to.eq('bodyB')
    expect(post.createdAt).to.be.null
    post.comments.addObject @session.create 'comment'
    @session.merge new @Post(id: '1', title: 'titleB', body: 'bodyB', user: new @User(id: '2', posts: [new @Post(id: '1')]))
    expect(post.comments.length).to.eq(1)
    expect(post.comments[0].id).to.be.null
    expect(post.user.id).to.eq('2')


  it 'keeps ours if same field modified in both versions', ->
    post = @session.merge new @Post(id: '1', title: 'titleA', body: 'bodyA')
    post.title = 'titleB'
    post.body = 'bodyB'
    @session.merge new @Post(id: '1', title: 'titleC', body: 'bodyC', user: null, comments: [])
    expect(post.title).to.eq('titleB')
    expect(post.body).to.eq('bodyB')
    post.comments.addObject new @Comment()
    post.user = new @User()
    @session.merge new @Post(id: '1', title: 'titleB', body: 'bodyB', user: new @User(id: '2'), comments: [new @Comment(id: '3')])
    expect(post.comments.length).to.eq(1)
    expect(post.comments[0].id).to.be.null
    expect(post.user.id).to.be.null


  it 'keeps ours if only modified in ours', ->
    post = @session.merge new @Post(id: '1', title: 'titleA', body: 'bodyA', user: new @User(id: '2', posts: [new @Post(id: '1')]), comments: [new @Comment(id: '3', user: new @User(id: '2'), post: @Post(id: '1'))])
    @session.create @Comment, post: post
    expect(post.comments.length).to.eq(2)
    newData = new @Post(id: '1', title: 'titleA', body: 'bodyA', user: new @User(id: '2', posts: [new @Post(id: '1')]), comments: [new @Comment(id: '3', user: new @User(id: '2'), post: @Post(id: '1'))])
    newData.comments[0].post = newData
    @session.merge newData
    expect(post.comments.length).to.eq(2)


  it 'still merges model if removed from belongsTo in ours', ->
    post = @session.merge new @Post(id: '1', title: 'herp', user: new @User(id: '2', posts: [new @Post(id: '1')]))
    user = post.user
    post.user = null
    @session.merge new @Post(id: '1', title: 'herp', user: new @User(id: '2', name: 'grodon', posts: [new @Post(id: '1')]))
    expect(post.user).to.be.null
    expect(user.name).to.eq('grodon')


  it 'still merges model if removed from hasMany in ours', ->
    post = @session.merge new @Post(id: '1', title: 'herp', comments: [new @Comment(id: '2', body: 'herp', post: @Post(id: '1'))])
    comment = post.comments[0]
    post.comments.clear()
    expect(post.comments.length).to.eq(0)
    @session.merge new @Post(id: '1', title: 'herp', comments: [new @Comment(id: '2', body: 'derp', post: @Post(id: '1'))])
    expect(post.comments.length).to.eq(0)
    expect(comment.body).to.eq('derp')


  it 'still merges model if sibling added to hasMany', ->
    post = @session.merge new @Post(id: '1', title: 'herp', comments: [new @Comment(id: '2', body: 'herp', post: @Post(id: '1'))])
    post.comments.addObject(new @Comment(body: 'derp'))
    comment = post.comments[0]
    @session.merge new @Post(id: '1', title: 'herp', comments: [new @Comment(id: '2', body: 'derp?', post: @Post(id: '1'))])
    expect(post.comments.length).to.eq(2)
    expect(comment.body).to.eq('derp?')


  it 'will preserve local updates after multiple merges', ->
    post = @session.merge(new @Post(id: '1', title: 'A'))
    post.title = 'B'
    @session.merge new @Post(id: '1', title: 'C')
    expect(post.title).to.eq('B')
    @session.merge new @Post(id: '1', title: 'C')
    expect(post.title).to.eq('B')
