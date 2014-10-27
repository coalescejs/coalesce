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

  beforeEach ->
    reset.apply(@)
    session.clearStorage()

  describe '.saveTo and loadFrom Storage', ->

    it 'should save to storage', ->
      post = session.merge @Post.create id: '1', title: 'save me plz'
      post2 = session.merge @Post.create id: '2', title: 'save me plz to'
      post3 = session.merge @Post.create id: '3', title: 'save me plz too'
      post4 = session.create 'post', title: 'Im new'

      Session.saveToStorage(session).then (_session) =>       
        # Reset everything 
        reset.apply(@)
        
        # XXX: wtf, tests seem to sporadically fail without this sleep, despite
        # both setItem and getItem returning promises. Maybe localforage promise
        # implementation bug?
        timeout = new Coalesce.Promise (resolve, reject) ->
          Coalesce.run.later resolve

        timeout.then ->
          expect(post.session).to.not.eq(session)

          expect(session.getForId('post', 1)).to.be.undefined
          expect(session.getForId('post', 2)).to.be.undefined
          expect(session.getForId('post', 3)).to.be.undefined

          Session.loadFromStorage(session).then (value) =>
            expect(session.getForId('post', 1)).to.not.be.undefined
            expect(session.getForId('post', 2)).to.not.be.undefined
            expect(session.getForId('post', 3)).to.not.be.undefined
            
    it 'preserves cached queries', ->
      adapter.query = =>
        Coalesce.Promise.resolve [@Post.create(id: 1, title: 'offline')]
        
      session.query(@Post).then (posts) =>
        expect(posts.length).to.eq(1)
        
        Session.saveToStorage(session).then (value) =>
          # Reset everything 
          reset.apply(@)
          
          # XXX: wtf, tests seem to sporadically fail without this sleep, despite
          # both setItem and getItem returning promises. Maybe localforage promise
          # implementation bug?
          timeout = new Coalesce.Promise (resolve, reject) ->
            Coalesce.run.later resolve
            
          timeout.then =>
            Session.loadFromStorage(session).then (value) =>
              posts = session.fetchQuery(@Post)
              expect(posts.length).to.eq(1)
        
        
        
  describe '.loading Storage', ->  
    it 'should skip loading from storage when storage is empty', ->
      session.clearStorage().then (_session) ->
        # debugger
        Session.loadFromStorage(_session).then((value) ->
          # debugger
          expect(_session.models).to.not.be.null
          return
        , (error) ->
          # something wrong throw error
          expect(error).to.be.null
          return
        )     
