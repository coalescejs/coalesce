`import Context from 'coalesce/json_api/context'`
`import {postWithComments} from '../support/configs'`

describe "rest with sideloading", ->

  lazy 'context', -> new Context(postWithComments())
  lazy 'session', -> @context.newSession()

  it 'is supported', ->
    debugger
    @server.r 'GET:/posts/1', 
      posts: {id: "1", title: 'sideload my children', comments: [2, 3]}
      comments: [{id: "2", body: "here we", post: "1"}, {id: "3",  body: "are", post: "1"}]

    @session.load('post', 1).then (post) =>
      expect(@server.h).to.eql(['GET:/posts/1'])
      expect(post.comments[0].body).to.eq('here we')
      expect(post.comments.lastObject.body).to.eq('are')
