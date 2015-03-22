`import Context from 'coalesce/json_api/context'`
`import {postWithComments} from '../support/configs'`

describe "rest performance", ->

    lazy 'context', -> new Context(postWithComments())
    lazy 'session', -> @context.newSession()

    it 'loads model with many children to empty session fast', ->
      # Tell mocha to highlight testcase if it take longer than this threshold
      # As alternative it is possible to set `@timeout 500` to fail the test
      @slow 500

      @server.r 'GET:/posts', posts: [{id: 1, title: 'is it fast?', rev: 1, comments: [1..100]}],
      comments: ({id: i, message: "message#{i}", post: 1, rev: 1} for i in [1..100])

      @session.query('post').then (posts) ->
        expect(posts[0].comments.length).to.eq(100)


    it 'loads model with many children repeatedly fast when rev is set', ->
      # Tell mocha to highlight testcase if it take longer than this threshold
      # As alternative it is possible to set `@timeout 2500` to fail the test
      @slow 2500

      @server.r 'GET:/posts', posts: [{id: 1, title: 'still fast?', rev: 1, comments: [1..100]}],
      comments: ({id: i, message: "message#{i}", post: 1, rev: 1} for i in [1..100])

      @session.query('post').then (posts) ->
        posts.refresh().then (posts) ->
          expect(posts[0].comments.length).to.eq(100)
