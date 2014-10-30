`import {postWithComments} from '../support/schemas'`
`import Container from 'coalesce/container'`
`import Session from 'coalesce/session/session'`


describe "Session Storage", ->

  session = null
  adapter = null

  beforeEach ->
    @App = {}
    @container = new Container()
    Coalesce.__container__ = @container

    postWithComments.apply(this)

    adapter = @container.lookup('adapter:main')
    @container = adapter.container
    session = adapter.newSession()

  describe '.saveToStorage', ->

    it 'returns a promise', ->

      promise = Session.saveToStorage(session)
      expect(promise).to.be.an.instanceOf(Promise)

    it 'promises a session', ->

      post = @Post.create(id: "1", title: 'test')
      session.merge(post)
      Session.saveToStorage(session).then (sesh) ->
        expect(sesh).to.be.an.instanceOf(Session)
        expect(sesh).to.eq(session)

  describe '.loadFromStorage', ->

    it 'returns a promise', ->

      promise = Session.loadFromStorage(session)
      expect(promise).to.be.an.instanceOf(Promise)

    it 'promises a session', ->

      Session.loadFromStorage(session).then (sesh) ->
        expect(sesh).to.be.an.instanceOf(Session)
        expect(sesh).to.eq(session)

  describe '.clearStorage', ->

    it 'returns a promise', ->

      promise = Session.clearStorage()
      expect(promise).to.be.an.instanceOf(Promise)

