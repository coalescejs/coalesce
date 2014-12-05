`import PerField from 'coalesce/merge/per_field'`
`import Model from 'coalesce/model/model'`
`import Context from 'coalesce/context/default'`

describe 'PerField', ->

  beforeEach ->
    
    `class User extends Model {}`
    User.defineSchema
      attributes:
        name: {type: 'string'}
      relationships:
        posts: {kind: 'hasMany', type: 'post'}
    @User = User
      
    `class Comment extends Model {}`
    Comment.defineSchema
      attributes:
        body: {type: 'string'}
      relationships:
        post: {kind: 'belongsTo', type: 'post'}
    @Comment = Comment

    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
        body: {type: 'string'}
        createdAt: {type: 'date'}
      relationships:
        comments: {kind: 'hasMany', type: 'comment'}
        user: {kind: 'belongsTo', type: 'user'}
    @Post = Post
    
    @context = new Context
      types:
        user: User
        comment: Comment
        post: Post
    @session = @context.newSession()

  it 'keeps modified fields from both versions', ->
    post = @session.merge @Post.create(id: '1', title: 'titleA', body: 'bodyA', createdAt: new Date(1985, 7, 22))
    post.title = 'titleB'
    @session.merge @Post.create(id: '1', title: 'titleA', body: 'bodyB', createdAt: null, comments: [])
    expect(post.title).to.eq('titleB')
    expect(post.body).to.eq('bodyB')
    expect(post.createdAt).to.be.null
    post.comments.addObject @session.create 'comment'
    @session.merge @Post.create(id: '1', title: 'titleB', body: 'bodyB', user: @User.create(id: '2', posts: [@Post.create(id: '1')]))
    expect(post.comments.length).to.eq(1)
    expect(post.comments[0].id).to.be.null
    expect(post.user.id).to.eq('2')


  it 'keeps ours if same field modified in both versions', ->
    post = @session.merge @Post.create(id: '1', title: 'titleA', body: 'bodyA')
    post.title = 'titleB'
    post.body = 'bodyB'
    @session.merge @Post.create(id: '1', title: 'titleC', body: 'bodyC', user: null, comments: [])
    expect(post.title).to.eq('titleB')
    expect(post.body).to.eq('bodyB')
    post.comments.addObject @Comment.create()
    post.user = @User.create()
    @session.merge @Post.create(id: '1', title: 'titleB', body: 'bodyB', user: @User.create(id: '2'), comments: [@Comment.create(id: '3')])
    expect(post.comments.length).to.eq(1)
    expect(post.comments[0].id).to.be.null
    expect(post.user.id).to.be.null


  it 'keeps ours if only modified in ours', ->
    post = @session.merge @Post.create(id: '1', title: 'titleA', body: 'bodyA', user: @User.create(id: '2', posts: [@Post.create(id: '1')]), comments: [@Comment.create(id: '3', user: @User.create(id: '2'), post: @Post.create(id: '1'))])
    @session.create @Comment, post: post
    expect(post.comments.length).to.eq(2)
    newData = @Post.create(id: '1', title: 'titleA', body: 'bodyA', user: @User.create(id: '2', posts: [@Post.create(id: '1')]), comments: [@Comment.create(id: '3', user: @User.create(id: '2'), post: @Post.create(id: '1'))])
    newData.comments[0].post = newData
    @session.merge newData
    expect(post.comments.length).to.eq(2)


  it 'still merges model if removed from belongsTo in ours', ->
    post = @session.merge @Post.create(id: '1', title: 'herp', user: @User.create(id: '2', posts: [@Post.create(id: '1')]))
    user = post.user
    post.user = null

    @session.merge @Post.create(id: '1', title: 'herp', user: @User.create(id: '2', name: 'grodon', posts: [@Post.create(id: '1')]))
    expect(post.user).to.be.null
    expect(user.name).to.eq('grodon')


  it 'still merges model if removed from hasMany in ours', ->
    post = @session.merge @Post.create(id: '1', title: 'herp', comments: [@Comment.create(id: '2', body: 'herp', post: @Post.create(id: '1'))])
    comment = post.comments[0]
    post.comments.clear()
    expect(post.comments.length).to.eq(0)
    @session.merge @Post.create(id: '1', title: 'herp', comments: [@Comment.create(id: '2', body: 'derp', post: @Post.create(id: '1'))])
    expect(post.comments.length).to.eq(0)
    expect(comment.body).to.eq('derp')


  it 'still merges model if sibling added to hasMany', ->
    post = @session.merge @Post.create(id: '1', title: 'herp', comments: [@Comment.create(id: '2', body: 'herp', post: @Post.create(id: '1'))])
    post.comments.addObject(@session.create(@Comment, body: 'derp'))
    comment = post.comments[0]
    @session.merge @Post.create(id: '1', title: 'herp', comments: [@Comment.create(id: '2', body: 'derp?', post: @Post.create(id: '1'))])
    expect(post.comments.length).to.eq(2)
    expect(comment.body).to.eq('derp?')


  it 'will preserve local updates after multiple merges', ->
    post = @session.merge(@Post.create(id: '1', title: 'A'))
    post.title = 'B'
    @session.merge @Post.create(id: '1', title: 'C')
    expect(post.title).to.eq('B')
    @session.merge @Post.create(id: '1', title: 'C')
    expect(post.title).to.eq('B')
