`import Coalesce from 'coalesce'`
`import Model from 'coalesce/model/model'`
`import ModelSerializer from 'coalesce/serializers/model'`
`import {postWithComments} from '../support/schemas'`
`import Container from 'coalesce/container'`
`import Query from 'coalesce/session/query'`
`import Session from 'coalesce/session/session'`

describe "Session", ->

  session = null
  adapter = null
  
  reset = ->
    @App = {}
    @container = new Container()
    Coalesce.__container__ = @container

    postWithComments.apply(this)

    adapter = @container.lookup('adapter:main')
    @container = adapter.container
    session = adapter.newSession()

  beforeEach (done) ->
    reset.apply(@)
    session.clearStorage().then -> 
      done()
    
  describe '.saveTo and loadFrom Storage', ->

    it 'should save to storage', ->
      post = session.merge @Post.create id: '1', title: 'save me plz'
      post2 = session.merge @Post.create id: '2', title: 'save me plz to'
      post3 = session.merge @Post.create id: '3', title: 'save me plz too'
      post4 = session.create 'post', title: 'Im new'

      # make dirty so they are seralized
      post.title = 'save me plz2'
      post2.title = 'save me plz to2'
      post3.title = 'save me plz too2'

      session.saveToStorage().then (_session) =>   
        #debugger
        # Reset everything 
        reset.apply(@)
        
        expect(post.session).to.not.eq(session)

        expect(session.getForId('post', 1)).to.be.undefined
        expect(session.getForId('post', 2)).to.be.undefined
        expect(session.getForId('post', 3)).to.be.undefined

        session.loadFromStorage().then (value) =>
          expect(session.getForId('post', 1)).to.not.be.undefined
          expect(session.getForId('post', 2)).to.not.be.undefined
          expect(session.getForId('post', 3)).to.not.be.undefined   
        
  describe '.loading Storage', ->  
    it 'should skip loading from storage when storage is empty', ->
      session.clearStorage().then () ->

        session.loadFromStorage().then((value) ->

          expect(session.models).to.not.be.null
          return
        , (error) ->
          # something wrong throw error
          expect(error).to.be.null
          return
        )     
