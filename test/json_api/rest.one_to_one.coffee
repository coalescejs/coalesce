`import Context from 'coalesce/rest/context'`
`import {userWithProfile, userWithEmbeddedProfile} from '../support/configs'`

describe "rest with one->one relationship", ->

  lazy 'context', -> new Context(userWithProfile())
  lazy 'User', -> @context.typeFor('user')
  lazy 'Profile', -> @context.typeFor('profile')
  lazy 'session', -> @context.newSession()

  it 'child can be null', ->
    @server.r 'GET:/profiles/1', profiles: {id: 1, title: 'mvcc ftw', user: null}
    @server.r 'PUT:/profiles/1', profiles: {id: 1, title: 'new title', user: null}

    @session.load(@Profile, 1).then (profile) =>
      expect(profile.id).to.eq("1")
      expect(profile.title).to.eq("mvcc ftw")
      expect(profile.user).to.be.null
      profile.title = 'new title'
      @session.flush().then =>
        expect(profile.title).to.eq('new title')


  it 'loads lazily', ->
    @server.r 'GET:/profiles/1', profiles: {id: 1, title: 'mvcc ftw', user: 2}
    @server.r 'GET:/users/2', users: {id: 2, name: 'brogrammer', profile: 1}

    @session.load(@Profile, 1).then (profile) =>
      expect(@server.h).to.eql(['GET:/profiles/1'])
      expect(profile.id).to.eq("1")
      expect(profile.title).to.eq('mvcc ftw')
      user = profile.user
      expect(user.id).to.eq("2")
      expect(user.name).to.be.undefined

      profile.user.load().then =>
        expect(@server.h).to.eql(['GET:/profiles/1', 'GET:/users/2'])
        expect(user.name).to.eq('brogrammer')
        expect(user.profile.isEqual(profile)).to.be.true


  it 'deletes one side', ->
    @server.r 'DELETE:/users/2', {}

    profile = new @Profile(id: "1", title: 'parent')
    profile.user = new @User(id: "2", name: 'wes', profile: profile)
    @session.merge profile

    @session.load('profile', 1).then (profile) =>
      user = profile.user
      @session.deleteModel(user)
      expect(profile.user).to.be.null
      @session.flush().then =>
        expect(profile.user).to.be.null
        expect(@server.h).to.eql(['DELETE:/users/2'])


  it 'deletes both', ->
    @server.r 'DELETE:/profiles/1', {}
    @server.r 'DELETE:/users/2', {}

    profile = new @Profile(id: "1", title: 'parent')
    profile.user = new @User(id: "2", name: 'wes', profile: profile)
    @session.merge profile

    @session.load('profile', 1).then (profile) =>
      user = profile.user
      @session.deleteModel(user)
      @session.deleteModel(profile)
      @session.flush().then =>
        expect(@server.h.length).to.eq(2)
        expect(@server.h).to.include('DELETE:/users/2')
        expect(@server.h).to.include('DELETE:/profiles/1')


  it 'creates on server', ->
    @server.r 'POST:/profiles', -> profiles: {client_id: profile.clientId, id: 1, title: 'herp', user: 2}
    @server.r 'GET:/users/2', users: {id: 1, name: 'derp', profile: 1}

    profile = @session.create 'profile', title: 'herp'

    @session.flush().then =>
      expect(@server.h).to.eql ['POST:/profiles']
      expect(profile.id).to.eq("1")
      expect(profile.title).to.eq('herp')
      expect(profile.user).to.not.be.null
      
  
  it 'creates on server and returns sideloaded', ->
    @server.r 'POST:/profiles', ->
      users: {id: 2, name: 'derp', profile: 1}
      profiles: {client_id: profile.clientId, id: 1, title: 'herp', user: 2}

    profile = @session.create 'profile', title: 'herp'

    @session.flush().then =>
      expect(@server.h).to.eql ['POST:/profiles']
      expect(profile.id).to.eq("1")
      expect(profile.title).to.eq('herp')
      expect(profile.user).to.not.be.null
      expect(profile.user.name).to.eq('derp')

  context "when embedded", ->

    lazy 'context', -> new Context(userWithEmbeddedProfile())

    it 'creates child', ->
      @server.r 'PUT:/profiles/1', -> profiles: {id: 1, title: 'parent', user: {client_id: profile.user.clientId, id: 2, name: 'child', profile: 1}}

      profile = new @session.merge @Profile(id: "1", title: 'parent')

      profile.user = @session.create 'user', name: 'child'

      @session.flush().then =>
        expect(@server.h).to.eql(['PUT:/profiles/1'])
        expect(profile.user.isNew).to.be.false
        expect(profile.user.id).to.eq('2')


    it 'creates hierarchy', ->
      @server.r 'POST:/profiles', -> profiles: {client_id: profile.clientId, id: 1, title: 'herp', user: {client_id: profile.user.clientId, id: 1, name: 'derp', profile: 1}}

      profile = @session.create 'profile', title: 'herp'
      profile.user = @session.create 'user', name: 'derp'

      @session.flush().then =>
        expect(@server.h).to.eql ['POST:/profiles']
        expect(profile.id).to.eq("1")
        expect(profile.title).to.eq('herp')
        expect(profile.user.name).to.eq('derp')


    it 'deletes parent', ->
      @server.r 'DELETE:/profiles/1', {}

      profile = new @Profile(id: "1", title: 'parent')
      profile.user = new @User(id: "2", name: 'wes')
      profile = @session.merge profile

      @session.deleteModel(profile)
      @session.flush().then =>
        expect(@server.h).to.eql(['DELETE:/profiles/1'])
        expect(profile.isDeleted).to.be.true
