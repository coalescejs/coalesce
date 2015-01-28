`import {userWithProfile, groupWithMembersWithUsers} from '../support/configs'`
`import Model from 'coalesce/entities/model'`
`import Context from 'coalesce/context/default'`

describe "relationships", ->
  
  lazy 'context', ->
    `class User extends Model {}`
    User.defineSchema
      attributes:
        name: {type: 'string'}

    `class Post extends Model {}`
    Post.defineSchema
      attributes:
        title: {type: 'string'}
      relationships:
        user: {kind: 'belongsTo', type: 'user'}
        comments: {kind: 'hasMany', type: 'comment'}

    `class Comment extends Model {}`
    Comment.defineSchema
      attributes:
        text: {type: 'string'}
      relationships:
        post: {kind: 'belongsTo', type: 'post'}

    new Context
      types:
        user: User
        post: Post
        comment: Comment
        
  lazy 'session', -> @context.newSession()
  lazy 'Post', -> @context.typeFor('post')
  lazy 'User', -> @context.typeFor('user')
  lazy 'Comment', -> @context.typeFor('comment')

  context 'one->many', ->

    it 'belongsTo updates inverse', ->
      post = @session.create('post')
      comment = @session.create('comment')
      comment.post = post
      expect(post.comments.toArray()).to.eql([comment])
      comment.post = null
      expect(post.comments.toArray()).to.eql([])


    it 'belongsTo updates inverse on delete', ->
      post = @session.create('post')
      comment = @session.create('comment')
      comment.post = post
      expect(post.comments.toArray()).to.eql([comment])
      @session.deleteModel comment
      expect(post.comments.toArray()).to.eql([])


    it 'belongsTo updates inverse on delete when initially added unloaded', ->
      post = @session.merge @session.build 'post', id: 1, comments: [@Comment.create(id: 2)]
      unloadedComment = post.comments[0]
      comment = @session.merge @session.build 'comment', id: 2, post: @Post.create(id: 1)
      unloadedComment.post = post
      expect(post.comments.toArray()).to.eql([unloadedComment])
      @session.deleteModel unloadedComment
      expect(post.comments.toArray()).to.eql([])


    it 'belongsTo updates inverse when set during create', ->
      comment = @session.create('comment', post: @session.create('post'))
      post = comment.post
      expect(post.comments.toArray()).to.eql([comment])
      comment.post = null
      expect(post.comments.toArray()).to.eql([])


    it 'belongsTo adds object to session', ->
      post = @session.merge(@Post.create(id: '1'))
      comment = @session.merge(@Comment.create(id: '2'))

      comment.post = @Post.create(id: '1')
      expect(comment.post).to.eq(post)


    it 'hasMany updates inverse', ->
      post = @session.create('post')
      comment = @session.create('comment')
      post.comments.addObject(comment)
      expect(comment.post).to.eq(post)
      post.comments.removeObject(comment)
      expect(comment.post).to.be.null


    it 'hasMany updates inverse on delete', ->
      post = @session.create('post')
      comment = @session.create('comment')
      post.comments.addObject(comment)
      expect(comment.post).to.eq(post)
      @session.deleteModel post
      expect(comment.post).to.be.null


    it 'hasMany updates inverse on create', ->
      post = @session.create('post', comments: [])
      comment = @session.create('comment')
      post.comments.addObject(comment)
      expect(comment.post).to.eq(post)
      @session.deleteModel post
      expect(comment.post).to.be.null


    it 'hasMany adds to session', ->
      post = @session.merge(@Post.create(id: '1', comments: []))
      comment = @session.merge(@Comment.create(id: '2', post: null))

      post.comments.addObject @Comment.create(id: '2')
      expect(post.comments[0]).to.eq(comment)


    it 'hasMany content can be set directly', ->
      post = @session.create 'post', comments: [@Comment.create(id: '2')]
      expect(post.comments.length).to.eq(1)
      expect(post.comments[0].id).to.eq('2')


  context 'one->one', ->
      
    lazy 'context', -> new Context(userWithProfile())

    it 'updates inverse', ->
      profile = @session.create('profile')
      user = @session.create('user')
      profile.user = user
      expect(user.profile).to.eq(profile)
      profile.user = null
      expect(user.profile).to.be.null


    it 'updates inverse on delete', ->
      profile = @session.create('profile')
      user = @session.create('user')
      profile.user = user
      expect(user.profile).to.eq(profile)
      @session.deleteModel profile
      expect(user.profile).to.be.null


  context 'multiple one->many', ->
    
    lazy 'context', -> new Context(groupWithMembersWithUsers())

    it 'updates inverse on delete', ->

      group = @session.create('group')
      user = @session.create('user')
      member = @session.create('member', group: group, user: user)

      expect(member.user).to.eq(user)
      expect(member.group).to.eq(group)
      expect(user.members.toArray()).to.eql([member])
      expect(group.members.toArray()).to.eql([member])

      @session.deleteModel member

      expect(user.members.toArray()).to.eql([])
      expect(group.members.toArray()).to.eql([])
