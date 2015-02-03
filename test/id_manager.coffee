`import IdManager from 'coalesce/id_manager'`
`import Context from 'coalesce/context/default'`
`import {post} from './support/configs'`

describe 'IdManager', ->

  subject -> new IdManager()

  lazy 'context', -> new Context(post())
  lazy 'Post', -> @context.typeFor('post')

  describe '.reifyClientId', ->

    it 'sets clientId on new record', ->
      post = new @Post(title: 'new post')
      expect(post.clientId).to.be.null
      @subject.reifyClientId(post)
      expect(post.clientId).to.not.be.null


    it 'should set existing clientId on detached model', ->
      post = new @Post(title: 'new post', id: "1")
      expect(post.clientId).to.be.null
      @subject.reifyClientId(post)
      expect(post.clientId).to.not.be.null

      detached = new @Post(title: 'different instance', id: "1")
      expect(detached.clientId).to.be.null
      @subject.reifyClientId(detached)
      expect(detached.clientId).to.eq(post.clientId)
