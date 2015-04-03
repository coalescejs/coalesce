`import setup from './_shared'`
`import Model from 'coalesce/model/model'`
`import ModelSerializer from 'coalesce/serializers/model'`
`import {groupWithMembersWithUsers} from '../support/schemas'`

describe "ActiveModelAdapter", ->

  adapter = null
  session = null

  beforeEach ->
    setup.apply(this)
    adapter = @adapter
    session = @session

    `class MessageThread extends Model {}`
    MessageThread.defineSchema
      typeKey: 'message_thread'
      attributes:
        subject: {type: 'string'}
    @App.MessageThread = @MessageThread = MessageThread
    @container.register 'model:message_thread', @MessageThread

  afterEach ->
    delete Coalesce.__container__

  describe '.pathForType', ->

    it 'underscores and pluralizes', ->
      expect(adapter.pathForType('message_thread')).to.eq('message_threads')

  context 'one->many', ->
    it 'existing parent creates multiple children in multiple flushes', ->
      groupWithMembersWithUsers.apply(this);

      adapter.r['GET:/users'] = users: [{id: 1,  name: 'parent',  client_id: null, client_rev: null, rev: 1000}]

      session.query('user').then (models) ->
        expect(adapter.h).to.eql(['GET:/users'])
        
        adapter.r['GET:/users/1'] = users: [{id: 1,  name: 'parent', group_ids: [], member_ids: [],  client_id: null, client_rev: null, rev: 1001}], groups: [], members: []

        _user = models[0]

        expect(_user.rev).to.eql(1000)

        expect(_user.members).to.be.undefined
        expect(_user.groups).to.be.undefined

        _user.refresh().then (user) ->
          expect(adapter.h).to.eql(['GET:/users', 'GET:/users/1'])

          expect(user.rev).to.eql(1001)

          expect(user.members).to.not.be.undefined
          expect(user.groups).to.not.be.undefined

          group = session.create('group', name: 'child 1', user: user)
          
          adapter.r['POST:/groups'] = -> groups: [{id: 1, name: group.name, user_id: group.userId, client_id: group.clientId, client_rev: group.clientRev, rev: -1}]

          session.flush().then ->
            expect(adapter.h).to.eql(['GET:/users', 'GET:/users/1', 'POST:/groups'])
            
            expect(user.groups.length).to.eq(1)
            expect(user.members.length).to.eq(0)

            member = session.create('member', role: 'child 2', user: user)

            adapter.r['POST:/members'] = -> members: [{id: 1, role: member.name, user_id: member.userId, client_id: member.clientId, client_rev: member.clientRev, rev: -1}]

            session.flush().then (models) ->            
              expect(adapter.h).to.eql(['GET:/users', 'GET:/users/1', 'POST:/groups', 'POST:/members'])
              
              expect(_user.groups.length).to.eq(1)
              expect(_user.members.length).to.eq(1)

