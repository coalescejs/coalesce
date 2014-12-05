`import Model from 'coalesce/model/model'`
`import ModelSerializer from 'coalesce/serializers/model'`
`import Context from 'coalesce/rest/context'`

describe 'PayloadSerializer', ->

  lazy 'context', -> new Context
  lazy 'Payload', -> @context.typeFor('payload')
  subject -> @context.configFor('payload').get('serializer')

  context 'with a simple model', ->
    lazy 'Post', ->
      `class Post extends Model {}`
      Post.defineSchema
        attributes:
          title: {type: 'string'}
          longTitle: {type: 'string'}
      Post
  
    lazy 'context', ->
      new Context
        types:
          post: @Post

    describe '.deserialize', ->
      
      it 'reads plural hash key', ->
        data = {posts: {id: 1, title: 'wat', long_title: 'wat omgawd'}}
        models = @subject.deserialize(data)
        post = models[0]
        expect(post).to.be.an.instanceof(@Post)
        expect(post.title).to.eq('wat')
        expect(post.longTitle).to.eq('wat omgawd')
        expect(post.id).to.eq("1")
        
      it 'reads singular hash key', ->
        data = {post: {id: 1, title: 'wat', long_title: 'wat omgawd'}}
        models = @subject.deserialize(data)
        post = models[0]
        expect(post).to.be.an.instanceof(@Post)
        expect(post.title).to.eq('wat')
        expect(post.longTitle).to.eq('wat omgawd')
        expect(post.id).to.eq("1")


      it 'reads array value', ->
        data = {post: [{id: 1, title: 'wat', long_title: 'wat omgawd'}] }
        models = @subject.deserialize(data)
        post = models[0]
        expect(post).to.be.an.instanceof(@Post)
        expect(post.title).to.eq('wat')
        expect(post.longTitle).to.eq('wat omgawd')
        expect(post.id).to.eq("1")

      it 'respects aliases', ->
        @subject.constructor.reopen
          aliases:
            blog_post: 'post'

        data = {blog_post: {id: 1, title: 'wat', long_title: 'wat omgawd'}}
        models = @subject.deserialize(data)
        post = models[0]
        expect(post).to.be.an.instanceof(@Post)
        expect(post.title).to.eq('wat')
        expect(post.longTitle).to.eq('wat omgawd')
        expect(post.id).to.eq("1")
        
    describe '.serialize', ->
      
      it 'is not supported', ->
        fn = => @subject.serialize(new @Payload())
        expect(fn).to.throw
