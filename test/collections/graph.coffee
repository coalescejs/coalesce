`import {postWithComments} from '../support/configs'`
`import Context from 'coalesce/context/default'`
`import Graph from 'coalesce/collections/graph'`

describe 'Graph', ->
  
  lazy 'context', -> new Context(postWithComments())
  lazy 'Post', -> @context.typeFor 'post'
  
  subject -> new Graph()
  
  describe '.add', ->
    
    it 'adds to graph', ->
      post = new @Post(clientId: 1)
      @subject.add(post)
      expect(@subject.get(post)).to.eq(post)
      
