`import Model from 'coalesce/model/model'`
`import Context from 'coalesce/rest/context'`

`import {postWithComments, groupWithMembersWithUsers} from '../support/configs'`
`import {delay} from '../support/async'`

describe "rest acceptance scenarios", ->

  lazy 'context', -> new Context
  lazy 'session', -> @context.newSession()

  describe "managing groups with embedded members", ->

    lazy 'context', -> new Context(groupWithMembersWithUsers())

    it 'creates new group and then deletes a member', ->
      @server.r 'POST:/users', -> users: {client_id: user.clientId, id: 1, name: "wes"}
      @server.r 'POST:/groups', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.group.members[0].role).to.eq('chief')
        return groups: {client_id: group.clientId, id: 2, name: "brogrammers", members: [{client_id: member.clientId, id: 3, role: "chief", group: 2, user: 1}], user: 1}

      childSession = @session.newSession()
      user = childSession.create 'user', name: 'wes'
      group = null
      member = null
      childSession.flushIntoParent().then =>
        expect(user.id).to.not.be.null
        expect(@server.h).to.eql(['POST:/users'])
        childSession = @session.newSession()
        user = childSession.add(user)
        group = childSession.create 'group', name: 'brogrammers', user: user
        member = childSession.create 'member', role: 'chief', user: user, group: group
        childSession.flushIntoParent().then =>
          expect(@server.h).to.eql(['POST:/users', 'POST:/groups'])
          expect(user.id).to.not.be.null
          expect(group.id).to.not.be.null
          expect(group.members.length).to.eq(1)
          expect(user.groups.length).to.eq(1)
          expect(user.members.length).to.eq(1)
          expect(member.id).to.not.be.null

          childSession = @session.newSession()
          member = childSession.add(member)
          user = childSession.add(user)
          group = childSession.add(group)
          childSession.deleteModel(member)
          expect(user.members.length).to.eq(0)
          expect(group.members.length).to.eq(0)
          expect(user.groups.length).to.eq(1)

          @server.r 'PUT:/groups/2', -> groups: {client_id: group.clientId, id: 2, name: "brogrammers", members: [], user: 1}
          childSession.flushIntoParent().then =>
            expect(member.isDeleted).to.be.true
            expect(group.members.length).to.eq(0)
            expect(user.members.length).to.eq(0)
            expect(user.groups.length).to.eq(1)
            expect(@server.h).to.eql(['POST:/users', 'POST:/groups', 'PUT:/groups/2'])


    it "doesn't choke when loading a group without a members key", ->
      @server.r 'GET:/groups', groups: [{client_id: null, id: "1", name: "brogrammers", user: "1"}]

      @session.query("group").then (result) =>
        expect(@server.h).to.eql(['GET:/groups'])
        expect(result.length).to.eq(1)
        expect(result[0].name).to.eq("brogrammers")
        expect(result[0].groups).to.be.undefined


    it 'adds a member to an existing group', ->
      @server.r 'GET:/groups/1', -> groups: {id: 1, name: "employees", members: [{id: 2, name: "kinz", group: 1, user: 3}]}, users: {id: 3, name: "wtf", members: [2], groups: [1]}

      @session.load("group", 1).then (group) =>
        expect(@server.h).to.eql(['GET:/groups/1'])

        childSession = @session.newSession()
        childGroup = childSession.add(group)

        existingMember = childGroup.members[0]
        expect(existingMember.user).to.not.be.null
        expect(existingMember.user.isDetached).to.be.false

        member = childSession.create('member', {name: "mollie"})
        childGroup.members.addObject(member)

        expect(childGroup.members.length).to.eq(2)
        expect(group.members.length).to.eq(1)

        @server.r 'PUT:/groups/1', -> groups: {id: 1, name: "employees", members: [{id: 2, name: "kinz", group: 1}, {id: 3, client_id: member.clientId, name: "mollie", group: 1}]}
        promise = childSession.flushIntoParent().then =>
          expect(childGroup.members.length).to.eq(2)
          expect(group.members.length).to.eq(2)
          expect(@server.h).to.eql(['GET:/groups/1', 'PUT:/groups/1'])

        expect(group.members.length).to.eq(2)
        promise


  describe "managing comments", ->

    lazy 'context', -> new Context(postWithComments())
    lazy 'Post', -> @context.typeFor('post')
    lazy 'Comment', -> @context.typeFor('comment')

    it 'creates a new comment within a child session', ->
      @server.r 'POST:/comments', -> comment: {client_id: comment.clientId, id: "3", message: "#2", post: "1"}

      post = @session.merge @Post.create(id: "1", title: "brogrammer's guide to beer pong", comments: [])
      @session.merge @Comment.create(id: "2", message: "yo", post: post)

      childSession = @session.newSession()
      childPost = childSession.add(post)
      comment = childSession.create 'comment',
        message: '#2',
        post: childPost

      expect(childPost.comments.length).to.eq(2)

      promise = childSession.flushIntoParent().then =>
        expect(childPost.comments.length).to.eq(2)
        expect(post.comments.length).to.eq(2)

      expect(childPost.comments.length).to.eq(2)
      expect(post.comments.length).to.eq(2)
      promise


  describe "two levels of embedded", ->

    lazy 'context', ->
      `class User extends Model {}`
      User.defineSchema
        attributes:
          name: {type: 'string'}
        relationships:
          profile: {kind: 'belongsTo', type: 'profile', embedded: 'always'}

      `class Profile extends Model {}`
      Profile.defineSchema
        attributes:
          bio: {type: 'string'}
        relationships:
          user: {kind: 'belongsTo', type: 'user'}
          tags: {kind: 'hasMany', type: 'tag', embedded: 'always'}

      `class Tag extends Model {}`
      Tag.defineSchema
        attributes:
          name: {type: 'string'}
        relationships:
          profile: {kind: 'belongsTo', type: 'profile'}

      new Context
        types:
          user: User
          profile: Profile
          tag: Tag
          
    lazy 'User', -> @context.typeFor('user')
    lazy 'Profile', -> @context.typeFor('profile')
    lazy 'Tag', -> @context.typeFor('tag')

    it 'deletes root', ->
      @server.r 'DELETE:/users/1', {}

      @User.create id: '1'
      user = @session.merge @User.create
        id: '1'
        name: 'abby'
        profile: @Profile.create
          id: '2'
          bio: 'asd'
          tags: [@Tag.create(id: '3', name: 'java')]

      @session.deleteModel(user)
      @session.flush().then =>
        expect(@server.h).to.eql(['DELETE:/users/1'])
        expect(user.isDeleted).to.be.true

  describe 'multiple belongsTo', ->
    lazy 'context', ->
      `class Foo extends Model {}`
      Foo.defineSchema
        typeKey: 'foo',
        relationships:
          bar: {kind: 'belongsTo', type: 'bar'}
          baz: {kind: 'belongsTo', type: 'baz'}
      
      `class Bar extends Model {}`
      Bar.defineSchema
        typeKey: 'bar'
        relationships:
          foos: {kind: 'hasMany', type: 'foo'}
      
      `class Baz extends Model {}`
      Baz.defineSchema
        typeKey: 'baz'
        relationships:
          foos: {kind: 'hasMany', type: 'foo'}
          
      new Context
        types:
          foo: Foo
          bar: Bar
          baz: Baz


    it 'sets ids properly', ->
      @server.r 'POST:/bars', -> bar: {client_id: bar.clientId, id: "1"}
      @server.r 'POST:/bazs', -> baz: {client_id: baz.clientId, id: "1"}
      @server.r 'POST:/foos', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.foo.bar).to.eq 1
        expect(data.foo.baz).to.eq 1
        foo: {client_id: foo.clientId, id: "1", bar: "1", baz: "1"}

      childSession = @session.newSession()
      foo = childSession.create 'foo'
      bar = childSession.create 'bar'
      baz = childSession.create 'baz'
      foo.bar = bar
      foo.baz = baz
      childSession.flushIntoParent().then =>
        expect(@server.h.length).to.eq(3)
        expect(@server.h[@server.h.length-1]).to.eq('POST:/foos')
        expect(@server.h).to.include('POST:/bars')
        expect(@server.h).to.include('POST:/bazs')
        expect(foo.id).to.not.be.null
        expect(bar.id).to.not.be.null
        expect(baz.id).to.not.be.null
        expect(foo.bar).to.not.be.null
        expect(foo.baz).to.not.be.null
        expect(bar.foos.length).to.eq 1
        expect(baz.foos.length).to.eq 1


  describe 'deep embedded relationship with leaf referencing a model without an inverse', ->

    lazy 'context', ->
      `class Template extends Model {}`
      Template.defineSchema
        attributes:
          subject: {type: 'string'}

      `class Campaign extends Model {}`
      Campaign.defineSchema
        attributes:
          name: {type: 'string'}
        relationships:
          campaignSteps: {kind: 'hasMany', type: 'campaign_step', embedded: 'always'}

      `class CampaignStep extends Model {}`
      CampaignStep.defineSchema
        relationships:
          campaign: {kind: 'belongsTo', type: 'campaign'}
          campaignTemplates: {kind: 'hasMany', type: 'campaign_template', embedded: 'always'}

      `class CampaignTemplate extends Model {}`
      CampaignTemplate.defineSchema
        relationships:
          campaignStep: {kind: 'belongsTo', type: 'campaign_step'}
          template: {kind: 'belongsTo', type: 'template'}

      new Context
        types:
          template: Template
          campaign: Campaign
          campaign_template: CampaignTemplate
          campaign_step: CampaignStep


    it 'creates new embedded children with reference to new hasMany', ->
      calls = 0
      delaySequence = (fn) ->
        delayAmount = calls * 100
        calls++
        delay delayAmount, fn
      @server.r 'POST:/templates', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        delaySequence =>
          if data.template.client_id == template.clientId
            {templates: {client_id: template.clientId, id: 2, subject: 'topological sort'}}
          else
            {templates: {client_id: template2.clientId, id: 5, subject: 'do you speak it?'}}
      @server.r 'PUT:/campaigns/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)
        expect(data.campaign.campaign_steps[0].campaign_templates[0].template).to.eq(2)
        expect(data.campaign.campaign_steps[1].campaign_templates[0].template).to.eq(5)
        delaySequence ->
          return campaigns:
            id: 1
            client_id: campaign.clientId
            campaign_steps: [
              {
                client_id: campaignStep.clientId
                id: 3
                campaign_templates: [
                  {id: 4, client_id: campaignTemplate.clientId, template: 2, campaign_step: 3}
                ]
              },
              {
                client_id: campaignStep2.clientId
                id: 6
                campaign_templates: [
                  {id: 7, client_id: campaignTemplate2.clientId, template: 5, campaign_step: 6}
                ]
              }
            ]

      campaign = @session.merge @session.build('campaign', id: 1, campaignSteps:[])

      childSession = @session.newSession()
      campaign = childSession.add campaign

      campaignStep = childSession.create('campaign_step', campaign: campaign)
      campaignTemplate = childSession.create 'campaign_template'
      campaignStep.campaignTemplates.pushObject(campaignTemplate)
      template = childSession.create 'template'
      template.subject = 'topological sort'
      campaignTemplate.template = template

      campaignStep2 = childSession.create('campaign_step', campaign: campaign)
      campaignTemplate2 = childSession.create 'campaign_template'
      campaignStep2.campaignTemplates.pushObject(campaignTemplate2)
      template2 = childSession.create 'template'
      template2.subject = 'do you speak it?'
      campaignTemplate2.template = template2

      childSession.flush().then =>
        expect(template.id).to.eq("2")
        expect(template.isNew).to.be.false
        expect(template.subject).to.eq('topological sort')
        expect(campaignTemplate.id).to.not.be.null
        expect(campaignTemplate.template).to.eq(template)
        expect(campaignTemplate.campaignStep).to.eq(campaignStep)
        expect(template2.id).to.eq("5")
        expect(template2.isNew).to.be.false
        expect(template2.subject).to.eq('do you speak it?')
        expect(campaignTemplate2.id).to.not.be.null
        expect(campaignTemplate2.template).to.eq(template2)
        expect(campaignTemplate2.campaignStep).to.eq(campaignStep2)
        expect(@server.h).to.eql(['POST:/templates', 'POST:/templates', 'PUT:/campaigns/1'])


    it 'save changes to parent when children not loaded in child session', ->
      @server.r 'PUT:/campaigns/1', (xhr) ->
        data = JSON.parse(xhr.requestBody)

      campaign = @session.merge @session.build 'campaign',
        name: 'old name'
        id: 1
        campaignSteps: []

      step = @session.merge @session.build 'campaign_step',
        id: 2
        campaign: campaign
        campaignTemplates: []

      step2 = @session.merge @session.build 'campaign_step',
        id: 4
        campaign: campaign
        campaignTemplates: []

      @session.merge @session.build 'campaign_template',
        id: 3
        campaignStep: step 

      expect(campaign.campaignSteps[0]).to.eq(step)
      childSession = @session.newSession()
      campaign = childSession.add campaign
      campaign.name = 'new name'

      childSession.flush().then =>
        expect(campaign.name).to.eq('new name')
        expect(@server.h).to.eql(['PUT:/campaigns/1'])
        
  describe 'belongsTo without inverse', ->
    
    lazy 'context', ->
      `class Contact extends Model {}`
      Contact.defineSchema
        attributes:
          name: {type: 'string'}
        relationships:
          account: {kind: 'belongsTo', type: 'account'}

      `class Account extends Model {}`
      Account.defineSchema
        attributes:
          name: {type: 'string'}
      
      new Context
        types:
          contact: Contact
          account: Account
          
    lazy 'session', ->
      @context.newSession()
      
    it 'creates hierarchy', ->
      @server.r 'POST:/contacts', -> contact: {id: 1, client_id: contact.clientId, name: "test contact", account: 2}
      @server.r 'POST:/accounts', -> account: {id: 2, client_id: contact.account.clientId, name: "test account"}
      
      contact = @session.create 'contact', name: 'test contact'
      contact.account = @session.create 'account', name: 'test account'
      
      @session.flush().then =>
        expect(@server.h).to.eql(['POST:/accounts', 'POST:/contacts'])
        expect(contact.account.id).to.eq("2")
      
